// Serviço de autenticação local (fallback quando Firebase não está configurado)
// Usa localStorage para simular autenticação básica

import { AuthProvider, User, SignInCredentials, SignUpCredentials } from '@/types/auth';

const STORAGE_KEY = 'sonecaz_auth_user';
const AUTH_EVENT = 'sonecaz_auth_change';

class LocalAuthService implements AuthProvider {
  private listeners: Set<(user: User | null) => void> = new Set();

  constructor() {
    // Escutar mudanças de storage (para múltiplas abas)
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          const user = this.getStoredUser();
          this.notifyListeners(user);
        }
      });
    }
  }

  private getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      const data = JSON.parse(stored);
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        lastLoginAt: new Date(data.lastLoginAt),
      };
    } catch {
      return null;
    }
  }

  private setStoredUser(user: User | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      // Disparar evento customizado para outras abas
      window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: user }));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: null }));
    }
    this.notifyListeners(user);
  }

  private notifyListeners(user: User | null): void {
    this.listeners.forEach((callback) => callback(user));
  }

  async signInWithEmail(credentials: SignInCredentials): Promise<User> {
    // Buscar usuário do localStorage
    const stored = this.getStoredUser();
    if (stored && stored.email === credentials.email) {
      // Simular verificação de senha (em produção, isso seria verificado no backend)
      const user: User = {
        ...stored,
        lastLoginAt: new Date(),
      };
      this.setStoredUser(user);
      return user;
    }
    throw new Error('Credenciais inválidas');
  }

  async signUpWithEmail(credentials: SignUpCredentials): Promise<User> {
    // Verificar se usuário já existe
    const existing = this.getStoredUser();
    if (existing && existing.email === credentials.email) {
      throw new Error('Usuário já existe');
    }

    const user: User = {
      id: `local_${Date.now()}`,
      email: credentials.email,
      name: credentials.name,
      photoURL: null,
      emailVerified: false,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      provider: 'email',
    };

    this.setStoredUser(user);
    return user;
  }

  async signInWithGoogle(): Promise<User> {
    // Simular login com Google (em produção, isso seria feito via OAuth)
    const user: User = {
      id: `google_${Date.now()}`,
      email: 'usuario@gmail.com',
      name: 'Usuário Google',
      photoURL: null,
      emailVerified: true,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      provider: 'google',
    };

    this.setStoredUser(user);
    return user;
  }

  async signInAnonymously(): Promise<User> {
    const user: User = {
      id: `anon_${Date.now()}`,
      email: null,
      name: 'Usuário Anônimo',
      photoURL: null,
      emailVerified: false,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      provider: 'anonymous',
    };

    this.setStoredUser(user);
    return user;
  }

  async signOut(): Promise<void> {
    this.setStoredUser(null);
  }

  async getCurrentUser(): Promise<User | null> {
    return this.getStoredUser();
  }

  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    this.listeners.add(callback);
    
    // Notificar imediatamente com o usuário atual
    const currentUser = this.getStoredUser();
    callback(currentUser);

    // Escutar eventos customizados
    const handleEvent = (e: Event) => {
      const customEvent = e as CustomEvent<User | null>;
      callback(customEvent.detail);
    };
    window.addEventListener(AUTH_EVENT, handleEvent);

    // Retornar função de limpeza
    return () => {
      this.listeners.delete(callback);
      window.removeEventListener(AUTH_EVENT, handleEvent);
    };
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    // Simular envio de email (em produção, isso seria feito no backend)
    console.log('Email de recuperação de senha enviado para:', email);
  }

  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    // Simular confirmação de reset (em produção, isso seria verificado no backend)
    console.log('Senha resetada com sucesso');
  }

  async updateProfile(updates: Partial<Pick<User, 'name' | 'photoURL'>>): Promise<void> {
    const user = this.getStoredUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    const updated: User = {
      ...user,
      ...updates,
    };
    this.setStoredUser(updated);
  }

  async updateEmail(email: string): Promise<void> {
    const user = this.getStoredUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    const updated: User = {
      ...user,
      email,
      emailVerified: false,
    };
    this.setStoredUser(updated);
  }

  async updatePassword(newPassword: string): Promise<void> {
    // Em produção, isso seria atualizado no backend
    console.log('Senha atualizada com sucesso');
  }

  async deleteAccount(): Promise<void> {
    this.setStoredUser(null);
  }
}

export const localAuthService = new LocalAuthService();



