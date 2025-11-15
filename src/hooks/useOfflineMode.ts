import { useState, useEffect, useCallback } from 'react';

export interface OfflineCache {
  maps: {
    [key: string]: {
      data: any;
      timestamp: number;
    };
  };
  places: {
    [key: string]: {
      data: any;
      timestamp: number;
    };
  };
  syncQueue: Array<{
    id: string;
    type: string;
    data: any;
    timestamp: number;
  }>;
}

const CACHE_STORAGE_KEY = 'sonecaz_offline_cache';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas

export const useOfflineMode = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [cache, setCache] = useState<OfflineCache>({
    maps: {},
    places: {},
    syncQueue: [],
  });

  // Salvar cache no localStorage
  const saveCache = useCallback((newCache: OfflineCache) => {
    try {
      localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(newCache));
      setCache(newCache);
    } catch (error) {
      console.error('Error saving offline cache:', error);
    }
  }, []);

  // Sincronizar quando voltar online
  const syncWhenOnline = useCallback(async () => {
    if (!isOnline || cache.syncQueue.length === 0) return;

    try {
      // Processar itens da fila de sincronização
      const processedItems: string[] = [];
      
      for (const item of cache.syncQueue) {
        try {
          // Aqui você pode adicionar lógica para sincronizar com servidor
          // Por enquanto, apenas marcamos como processado
          console.log('Syncing item:', item);
          processedItems.push(item.id);
        } catch (error) {
          console.error('Error syncing item:', error);
        }
      }

      // Remover itens processados da fila
      if (processedItems.length > 0) {
        const newCache = {
          ...cache,
          syncQueue: cache.syncQueue.filter(item => !processedItems.includes(item.id)),
        };
        saveCache(newCache);
      }
    } catch (error) {
      console.error('Error syncing:', error);
    }
  }, [isOnline, cache, saveCache]);

  // Monitorar status de conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sincronizar quando voltar online
  useEffect(() => {
    if (isOnline && cache.syncQueue.length > 0) {
      syncWhenOnline();
    }
  }, [isOnline, cache.syncQueue.length, syncWhenOnline]);

  // Carregar cache do localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CACHE_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Limpar cache expirado
        const now = Date.now();
        const cleanedCache: OfflineCache = {
          maps: {},
          places: {},
          syncQueue: parsed.syncQueue || [],
        };

        // Limpar mapas expirados
        Object.keys(parsed.maps || {}).forEach(key => {
          if (parsed.maps[key].timestamp + CACHE_EXPIRY > now) {
            cleanedCache.maps[key] = parsed.maps[key];
          }
        });

        // Limpar lugares expirados
        Object.keys(parsed.places || {}).forEach(key => {
          if (parsed.places[key].timestamp + CACHE_EXPIRY > now) {
            cleanedCache.places[key] = parsed.places[key];
          }
        });

        setCache(cleanedCache);
      }
    } catch (error) {
      console.error('Error loading offline cache:', error);
    }
  }, []);

  // Adicionar ao cache de mapas
  const cacheMapData = useCallback((key: string, data: any) => {
    const newCache = {
      ...cache,
      maps: {
        ...cache.maps,
        [key]: {
          data,
          timestamp: Date.now(),
        },
      },
    };
    saveCache(newCache);
  }, [cache, saveCache]);

  // Obter dados do cache de mapas
  const getCachedMapData = useCallback((key: string): any | null => {
    const cached = cache.maps[key];
    if (!cached) return null;

    // Verificar se expirou
    if (cached.timestamp + CACHE_EXPIRY < Date.now()) {
      // Remover do cache
      const newCache = {
        ...cache,
        maps: { ...cache.maps },
      };
      delete newCache.maps[key];
      saveCache(newCache);
      return null;
    }

    return cached.data;
  }, [cache, saveCache]);

  // Adicionar ao cache de lugares
  const cachePlaceData = useCallback((key: string, data: any) => {
    const newCache = {
      ...cache,
      places: {
        ...cache.places,
        [key]: {
          data,
          timestamp: Date.now(),
        },
      },
    };
    saveCache(newCache);
  }, [cache, saveCache]);

  // Obter dados do cache de lugares
  const getCachedPlaceData = useCallback((key: string): any | null => {
    const cached = cache.places[key];
    if (!cached) return null;

    // Verificar se expirou
    if (cached.timestamp + CACHE_EXPIRY < Date.now()) {
      // Remover do cache
      const newCache = {
        ...cache,
        places: { ...cache.places },
      };
      delete newCache.places[key];
      saveCache(newCache);
      return null;
    }

    return cached.data;
  }, [cache, saveCache]);

  // Adicionar à fila de sincronização
  const addToSyncQueue = useCallback((type: string, data: any) => {
    const newCache = {
      ...cache,
      syncQueue: [
        ...cache.syncQueue,
        {
          id: `${Date.now()}-${Math.random()}`,
          type,
          data,
          timestamp: Date.now(),
        },
      ],
    };
    saveCache(newCache);
  }, [cache, saveCache]);

  // Limpar cache
  const clearCache = useCallback(() => {
    const emptyCache: OfflineCache = {
      maps: {},
      places: {},
      syncQueue: [],
    };
    saveCache(emptyCache);
  }, [saveCache]);

  return {
    isOnline,
    cacheMapData,
    getCachedMapData,
    cachePlaceData,
    getCachedPlaceData,
    addToSyncQueue,
    syncWhenOnline,
    clearCache,
  };
};
