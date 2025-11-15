// Tipos de autenticação

export interface User {
  id: string;
  email: string | null;
  name: string;
  photoURL: string | null;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  provider: 'google' | 'email' | 'anonymous';
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
}

export interface AuthProvider {
  // Autenticação
  signInWithEmail: (credentials: SignInCredentials) => Promise<User>;
  signUpWithEmail: (credentials: SignUpCredentials) => Promise<User>;
  signInWithGoogle: () => Promise<User>;
  signInAnonymously: () => Promise<User>;
  signOut: () => Promise<void>;
  
  // Estado
  getCurrentUser: () => Promise<User | null>;
  onAuthStateChanged: (callback: (user: User | null) => void) => () => void;
  
  // Recuperação
  sendPasswordResetEmail: (email: string) => Promise<void>;
  confirmPasswordReset: (code: string, newPassword: string) => Promise<void>;
  
  // Gerenciamento
  updateProfile: (updates: Partial<Pick<User, 'name' | 'photoURL'>>) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
}



