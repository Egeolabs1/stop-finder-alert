import { useState, useEffect, useCallback } from 'react';

export interface FavoriteDestination {
  id: string;
  name: string;
  address: string;
  location: [number, number];
  icon?: 'home' | 'briefcase' | 'map-pin' | 'star' | 'heart' | 'flag';
  color?: string;
  radius?: number;
  createdAt: Date;
  updatedAt: Date;
  useCount: number;
  lastUsedAt?: Date;
}

const STORAGE_KEY = 'sonecaz_favorites';

const DEFAULT_FAVORITES: FavoriteDestination[] = [];

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<FavoriteDestination[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar favoritos do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Converter datas de string para Date
        const favoritesWithDates = parsed.map((fav: any) => ({
          ...fav,
          createdAt: new Date(fav.createdAt),
          updatedAt: new Date(fav.updatedAt),
          lastUsedAt: fav.lastUsedAt ? new Date(fav.lastUsedAt) : undefined,
        }));
        setFavorites(favoritesWithDates);
      } else {
        setFavorites(DEFAULT_FAVORITES);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites(DEFAULT_FAVORITES);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar favoritos no localStorage
  const saveFavorites = useCallback((newFavorites: FavoriteDestination[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  }, []);

  // Adicionar favorito
  const addFavorite = useCallback(
    (favorite: Omit<FavoriteDestination, 'id' | 'createdAt' | 'updatedAt' | 'useCount'>) => {
      const newFavorite: FavoriteDestination = {
        ...favorite,
        id: `${Date.now()}-${Math.random()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        useCount: 0,
      };
      const newFavorites = [...favorites, newFavorite];
      saveFavorites(newFavorites);
      return newFavorite;
    },
    [favorites, saveFavorites]
  );

  // Atualizar favorito
  const updateFavorite = useCallback(
    (id: string, updates: Partial<FavoriteDestination>) => {
      const newFavorites = favorites.map((fav) =>
        fav.id === id
          ? { ...fav, ...updates, updatedAt: new Date() }
          : fav
      );
      saveFavorites(newFavorites);
    },
    [favorites, saveFavorites]
  );

  // Remover favorito
  const removeFavorite = useCallback(
    (id: string) => {
      const newFavorites = favorites.filter((fav) => fav.id !== id);
      saveFavorites(newFavorites);
    },
    [favorites, saveFavorites]
  );

  // Incrementar uso de favorito
  const incrementUseCount = useCallback(
    (id: string) => {
      const newFavorites = favorites.map((fav) =>
        fav.id === id
          ? {
              ...fav,
              useCount: fav.useCount + 1,
              lastUsedAt: new Date(),
              updatedAt: new Date(),
            }
          : fav
      );
      saveFavorites(newFavorites);
    },
    [favorites, saveFavorites]
  );

  // Obter favoritos mais usados
  const getMostUsedFavorites = useCallback(
    (limit: number = 5) => {
      return [...favorites]
        .sort((a, b) => b.useCount - a.useCount)
        .slice(0, limit);
    },
    [favorites]
  );

  // Obter favoritos recentes
  const getRecentFavorites = useCallback(
    (limit: number = 5) => {
      return [...favorites]
        .filter((fav) => fav.lastUsedAt)
        .sort((a, b) => {
          const dateA = a.lastUsedAt?.getTime() || 0;
          const dateB = b.lastUsedAt?.getTime() || 0;
          return dateB - dateA;
        })
        .slice(0, limit);
    },
    [favorites]
  );

  return {
    favorites,
    isLoading,
    addFavorite,
    updateFavorite,
    removeFavorite,
    incrementUseCount,
    getMostUsedFavorites,
    getRecentFavorites,
  };
};



