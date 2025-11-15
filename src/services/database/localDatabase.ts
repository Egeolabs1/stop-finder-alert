// Serviço de banco de dados local (fallback usando localStorage)
// Usado quando Firebase não está configurado

import { 
  DatabaseUser, 
  UserFavorites, 
  UserLists, 
  UserAlarms, 
  UserHistory,
  SyncResult,
  SyncStatus 
} from '@/types/database';

const STORAGE_PREFIX = 'sonecaz_db_';

class LocalDatabaseService {
  // Usuário
  async getUser(userId: string): Promise<DatabaseUser | null> {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}user_${userId}`);
      if (!stored) return null;
      const data = JSON.parse(stored);
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
        lastLoginAt: new Date(data.lastLoginAt),
      };
    } catch {
      return null;
    }
  }

  async createUser(user: Omit<DatabaseUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<DatabaseUser> {
    const now = new Date();
    const dbUser: DatabaseUser = {
      ...user,
      id: user.id || `user_${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: now,
    };
    localStorage.setItem(`${STORAGE_PREFIX}user_${dbUser.id}`, JSON.stringify(dbUser));
    return dbUser;
  }

  async updateUser(userId: string, updates: Partial<DatabaseUser>): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    const updated: DatabaseUser = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };
    localStorage.setItem(`${STORAGE_PREFIX}user_${userId}`, JSON.stringify(updated));
  }

  // Favoritos
  async getFavorites(userId: string): Promise<UserFavorites | null> {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}favorites_${userId}`);
      if (!stored) return null;
      const data = JSON.parse(stored);
      return {
        ...data,
        favorites: data.favorites.map((f: any) => ({
          ...f,
          createdAt: new Date(f.createdAt),
          updatedAt: new Date(f.updatedAt),
          lastUsedAt: f.lastUsedAt ? new Date(f.lastUsedAt) : undefined,
        })),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch {
      return null;
    }
  }

  async saveFavorites(userId: string, favorites: UserFavorites['favorites']): Promise<SyncResult> {
    try {
      const now = new Date();
      const data: UserFavorites = {
        userId,
        favorites,
        createdAt: now,
        updatedAt: now,
      };
      localStorage.setItem(`${STORAGE_PREFIX}favorites_${userId}`, JSON.stringify(data));
      return {
        success: true,
        syncedAt: now,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao salvar favoritos',
        syncedAt: new Date(),
      };
    }
  }

  // Listas
  async getLists(userId: string): Promise<UserLists | null> {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}lists_${userId}`);
      if (!stored) return null;
      const data = JSON.parse(stored);
      return {
        ...data,
        lists: data.lists.map((list: any) => ({
          ...list,
          createdAt: new Date(list.createdAt),
          updatedAt: new Date(list.updatedAt),
          items: list.items.map((item: any) => ({
            ...item,
            createdAt: new Date(item.createdAt),
            completedAt: item.completedAt ? new Date(item.completedAt) : undefined,
          })),
        })),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch {
      return null;
    }
  }

  async saveLists(userId: string, lists: UserLists['lists']): Promise<SyncResult> {
    try {
      const now = new Date();
      const data: UserLists = {
        userId,
        lists,
        createdAt: now,
        updatedAt: now,
      };
      localStorage.setItem(`${STORAGE_PREFIX}lists_${userId}`, JSON.stringify(data));
      return {
        success: true,
        syncedAt: now,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao salvar listas',
        syncedAt: new Date(),
      };
    }
  }

  // Alarmes Recorrentes
  async getAlarms(userId: string): Promise<UserAlarms | null> {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}alarms_${userId}`);
      if (!stored) return null;
      const data = JSON.parse(stored);
      return {
        ...data,
        recurringAlarms: data.recurringAlarms.map((alarm: any) => ({
          ...alarm,
          createdAt: new Date(alarm.createdAt),
          updatedAt: new Date(alarm.updatedAt),
        })),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch {
      return null;
    }
  }

  async saveAlarms(userId: string, alarms: UserAlarms['recurringAlarms']): Promise<SyncResult> {
    try {
      const now = new Date();
      const data: UserAlarms = {
        userId,
        recurringAlarms: alarms,
        createdAt: now,
        updatedAt: now,
      };
      localStorage.setItem(`${STORAGE_PREFIX}alarms_${userId}`, JSON.stringify(data));
      return {
        success: true,
        syncedAt: now,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao salvar alarmes',
        syncedAt: new Date(),
      };
    }
  }

  // Histórico
  async getHistory(userId: string): Promise<UserHistory | null> {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}history_${userId}`);
      if (!stored) return null;
      const data = JSON.parse(stored);
      return {
        ...data,
        history: data.history.map((item: any) => ({
          ...item,
          triggeredAt: new Date(item.triggeredAt),
          activatedAt: new Date(item.activatedAt),
          deactivatedAt: new Date(item.deactivatedAt),
        })),
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt),
      };
    } catch {
      return null;
    }
  }

  async saveHistory(userId: string, history: UserHistory['history']): Promise<SyncResult> {
    try {
      const now = new Date();
      const data: UserHistory = {
        userId,
        history,
        createdAt: now,
        updatedAt: now,
      };
      localStorage.setItem(`${STORAGE_PREFIX}history_${userId}`, JSON.stringify(data));
      return {
        success: true,
        syncedAt: now,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao salvar histórico',
        syncedAt: new Date(),
      };
    }
  }

  // Sincronização
  async syncAll(userId: string): Promise<SyncResult> {
    // Em modo local, a sincronização é instantânea
    return {
      success: true,
      syncedAt: new Date(),
    };
  }

  async getSyncStatus(userId: string): Promise<SyncStatus> {
    return {
      isSyncing: false,
      lastSyncAt: new Date(),
      error: null,
    };
  }
}

export const localDatabaseService = new LocalDatabaseService();



