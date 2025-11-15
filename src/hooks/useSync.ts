// Hook para sincronização de dados com o banco de dados
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { databaseService } from '@/services/database';
import { SyncStatus, SyncResult } from '@/types/database';
import { useFavorites } from '@/hooks/useFavorites';
import { useLists } from '@/hooks/useLists';
import { useRecurringAlarms } from '@/hooks/useRecurringAlarms';
import { useAlarmHistory } from '@/hooks/useAlarmHistory';

export const useSync = () => {
  const { user } = useAuth();
  const { favorites } = useFavorites();
  const { lists } = useLists();
  const { alarms: recurringAlarms } = useRecurringAlarms();
  const { history } = useAlarmHistory();
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncAt: null,
    error: null,
  });

  // Sincronizar todos os dados
  const syncAll = useCallback(async () => {
    if (!user) {
      return {
        success: false,
        error: 'Usuário não autenticado',
        syncedAt: new Date(),
      } as SyncResult;
    }

    setSyncStatus((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      // Sincronizar favoritos
      await databaseService.saveFavorites(user.id, favorites);
      
      // Sincronizar listas
      await databaseService.saveLists(user.id, lists);
      
      // Sincronizar alarmes recorrentes
      await databaseService.saveAlarms(user.id, recurringAlarms);
      
      // Sincronizar histórico
      await databaseService.saveHistory(user.id, history);

      const result: SyncResult = {
        success: true,
        syncedAt: new Date(),
      };

      setSyncStatus({
        isSyncing: false,
        lastSyncAt: new Date(),
        error: null,
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao sincronizar';
      const result: SyncResult = {
        success: false,
        error: errorMessage,
        syncedAt: new Date(),
      };

      setSyncStatus({
        isSyncing: false,
        lastSyncAt: null,
        error: errorMessage,
      });

      return result;
    }
  }, [user, favorites, lists, recurringAlarms, history]);

  // Carregar dados do banco de dados
  const loadFromDatabase = useCallback(async () => {
    if (!user) return;

    try {
      // Carregar favoritos
      const dbFavorites = await databaseService.getFavorites(user.id);
      if (dbFavorites) {
        // Atualizar favoritos locais (implementar conforme necessário)
        console.log('Favoritos carregados do banco de dados:', dbFavorites);
      }

      // Carregar listas
      const dbLists = await databaseService.getLists(user.id);
      if (dbLists) {
        // Atualizar listas locais (implementar conforme necessário)
        console.log('Listas carregadas do banco de dados:', dbLists);
      }

      // Carregar alarmes
      const dbAlarms = await databaseService.getAlarms(user.id);
      if (dbAlarms) {
        // Atualizar alarmes locais (implementar conforme necessário)
        console.log('Alarmes carregados do banco de dados:', dbAlarms);
      }

      // Carregar histórico
      const dbHistory = await databaseService.getHistory(user.id);
      if (dbHistory) {
        // Atualizar histórico local (implementar conforme necessário)
        console.log('Histórico carregado do banco de dados:', dbHistory);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do banco de dados:', error);
    }
  }, [user]);

  // Carregar dados quando o usuário fizer login (apenas uma vez)
  useEffect(() => {
    if (user && !syncStatus.lastSyncAt) {
      loadFromDatabase();
    }
  }, [user, loadFromDatabase, syncStatus.lastSyncAt]);

  // Sincronizar quando dados mudarem (com debounce)
  useEffect(() => {
    if (!user) return;

    // Aguardar 5 segundos antes de sincronizar após mudanças
    const timer = setTimeout(() => {
      syncAll().catch((error) => {
        console.error('Erro na sincronização automática:', error);
      });
    }, 5000);

    return () => clearTimeout(timer);
  }, [user, favorites.length, lists.length, recurringAlarms.length, history.length]); // Sincronizar apenas quando quantidade mudar

  return {
    syncAll,
    loadFromDatabase,
    syncStatus,
  };
};

