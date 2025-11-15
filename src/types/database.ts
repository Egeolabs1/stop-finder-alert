// Tipos de banco de dados

export interface DatabaseUser {
  id: string;
  email: string | null;
  name: string;
  photoURL: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
  settings: UserSettings;
  preferences: UserPreferences;
}

export interface UserSettings {
  language: string;
  theme: 'light' | 'dark' | 'system';
  defaultRadius: number;
  enableNotifications: boolean;
  enableHaptics: boolean;
  nearbyAlertRadius: number;
  alertCooldown: number;
  enableNearbyAlerts: boolean;
}

export interface UserPreferences {
  favoriteRadius: number;
  preferredCategories: string[];
}

// Coleções do banco de dados
export interface UserFavorites {
  userId: string;
  favorites: FavoriteDestination[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserLists {
  userId: string;
  lists: List[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserAlarms {
  userId: string;
  recurringAlarms: RecurringAlarm[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserHistory {
  userId: string;
  history: AlarmHistory[];
  createdAt: Date;
  updatedAt: Date;
}

// Tipos reutilizados
export interface FavoriteDestination {
  id: string;
  name: string;
  address: string;
  location: [number, number];
  icon?: string;
  color?: string;
  radius?: number;
  createdAt: Date;
  updatedAt: Date;
  useCount: number;
  lastUsedAt?: Date;
}

export interface List {
  id: string;
  type: 'todo' | 'shopping' | 'places';
  name: string;
  items: (TodoItem | ShoppingItem)[];
  createdAt: Date;
  updatedAt: Date;
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

export interface ShoppingItem {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface RecurringAlarm {
  id: string;
  name: string;
  destination: {
    name: string;
    address: string;
    location: [number, number];
  };
  radius: number;
  daysOfWeek: string[];
  startTime: string;
  endTime?: string;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AlarmHistory {
  id: string;
  destination: {
    name: string;
    address: string;
    location: [number, number];
  };
  radius: number;
  triggeredAt: Date;
  activatedAt: Date;
  deactivatedAt: Date;
  duration: number; // em minutos
}

// Operações de sincronização
export interface SyncResult {
  success: boolean;
  error?: string;
  syncedAt: Date;
}

export interface SyncStatus {
  isSyncing: boolean;
  lastSyncAt: Date | null;
  error: string | null;
}



