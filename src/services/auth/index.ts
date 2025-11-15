// Exportar o serviço de autenticação apropriado
// Tenta usar Firebase se configurado, senão usa autenticação local

import { AuthProvider } from '@/types/auth';
import { isFirebaseConfigured } from '@/config/firebase';
import { firebaseAuthService } from './firebaseAuth';
import { localAuthService } from './localAuth';

// Selecionar o serviço de autenticação baseado na configuração
export const authService: AuthProvider = isFirebaseConfigured()
  ? firebaseAuthService
  : localAuthService;

// Exportar ambos os serviços para uso direto se necessário
export { firebaseAuthService, localAuthService };

// Informar qual serviço está sendo usado
console.log(
  `[Auth] Using ${isFirebaseConfigured() ? 'Firebase' : 'Local'} authentication service`
);



