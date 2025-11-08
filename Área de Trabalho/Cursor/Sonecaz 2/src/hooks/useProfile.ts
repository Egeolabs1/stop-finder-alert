import { useState, useEffect, useCallback } from 'react';

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  createdAt: Date;
  lastActiveAt: Date;
  totalAlarms: number;
  totalShoppingAlerts: number;
  favoriteRadius: number;
}

const DEFAULT_PROFILE: UserProfile = {
  id: 'default-user',
  name: 'Usuário',
  email: '',
  avatar: '',
  createdAt: new Date(),
  lastActiveAt: new Date(),
  totalAlarms: 0,
  totalShoppingAlerts: 0,
  favoriteRadius: 500,
};

const STORAGE_KEY = 'sonecaz_profile';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar perfil do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setProfile({
          ...DEFAULT_PROFILE,
          ...parsed,
          createdAt: new Date(parsed.createdAt || Date.now()),
          lastActiveAt: new Date(parsed.lastActiveAt || Date.now()),
        });
      } else {
        // Criar perfil padrão
        const newProfile = {
          ...DEFAULT_PROFILE,
          id: `user-${Date.now()}`,
          createdAt: new Date(),
          lastActiveAt: new Date(),
        };
        setProfile(newProfile);
        saveProfile(newProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Atualizar última atividade apenas uma vez ao carregar
  useEffect(() => {
    if (!isLoading && profile.id) {
      const updated = { ...profile, lastActiveAt: new Date() };
      setProfile(updated);
      saveProfile(updated);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]); // Apenas quando carregar

  // Salvar perfil no localStorage
  const saveProfile = useCallback((profileToSave: UserProfile) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profileToSave));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }, []);

  // Atualizar perfil
  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    const updated = { ...profile, ...updates, lastActiveAt: new Date() };
    setProfile(updated);
    saveProfile(updated);
  }, [profile, saveProfile]);

  // Incrementar contadores
  const incrementAlarms = useCallback(() => {
    updateProfile({ totalAlarms: profile.totalAlarms + 1 });
  }, [profile, updateProfile]);

  const incrementShoppingAlerts = useCallback(() => {
    updateProfile({ totalShoppingAlerts: profile.totalShoppingAlerts + 1 });
  }, [profile, updateProfile]);

  // Atualizar raio favorito
  const updateFavoriteRadius = useCallback((radius: number) => {
    updateProfile({ favoriteRadius: radius });
  }, [updateProfile]);

  return {
    profile,
    isLoading,
    updateProfile,
    incrementAlarms,
    incrementShoppingAlerts,
    updateFavoriteRadius,
  };
};

