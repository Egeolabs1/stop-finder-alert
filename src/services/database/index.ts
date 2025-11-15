// Exportar o serviço de banco de dados apropriado
import { isFirebaseConfigured } from '@/config/firebase';
import { firebaseDatabaseService } from './firebaseDatabase';
import { localDatabaseService } from './localDatabase';

// Interface comum para serviços de banco de dados
export interface DatabaseService {
  getUser: (userId: string) => Promise<any>;
  createUser: (user: any) => Promise<any>;
  updateUser: (userId: string, updates: any) => Promise<void>;
  getFavorites: (userId: string) => Promise<any>;
  saveFavorites: (userId: string, favorites: any) => Promise<any>;
  getLists: (userId: string) => Promise<any>;
  saveLists: (userId: string, lists: any) => Promise<any>;
  getAlarms: (userId: string) => Promise<any>;
  saveAlarms: (userId: string, alarms: any) => Promise<any>;
  getHistory: (userId: string) => Promise<any>;
  saveHistory: (userId: string, history: any) => Promise<any>;
  syncAll: (userId: string) => Promise<any>;
  getSyncStatus: (userId: string) => Promise<any>;
}

// Selecionar o serviço de banco de dados baseado na configuração
export const databaseService: DatabaseService = isFirebaseConfigured()
  ? firebaseDatabaseService
  : localDatabaseService;

// Exportar ambos os serviços
export { firebaseDatabaseService, localDatabaseService };

// Informar qual serviço está sendo usado
console.log(
  `[Database] Using ${isFirebaseConfigured() ? 'Firebase' : 'Local'} database service`
);



