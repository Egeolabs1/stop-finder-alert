// Contexto de autenticação
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthState } from '@/types/auth';
import { authService } from '@/services/auth';

interface AuthContextType extends AuthState {
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'photoURL'>>) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log('[AuthContext] Inicializando autenticação...');
    // Escutar mudanças no estado de autenticação
    let unsubscribe: (() => void) | undefined;
    
    try {
      unsubscribe = authService.onAuthStateChanged((authUser) => {
        console.log('[AuthContext] Estado de autenticação mudou:', authUser ? 'Usuário autenticado' : 'Usuário não autenticado');
        setUser(authUser);
        setLoading(false);
        setInitialized(true);
        setError(null);
      });
      console.log('[AuthContext] Listener de autenticação registrado');
    } catch (err) {
      console.error('[AuthContext] Erro ao inicializar autenticação:', err);
      setError('Erro ao inicializar autenticação');
      setLoading(false);
      setInitialized(true);
      // Garantir que sempre inicialize, mesmo em caso de erro
      console.log('[AuthContext] AuthContext inicializado com erro, mas continuando...');
    }

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe();
        } catch (err) {
          console.error('[AuthContext] Erro ao desinscrever do auth state:', err);
        }
      }
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const authUser = await authService.signInWithEmail({ email, password });
      setUser(authUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      setLoading(true);
      setError(null);
      const authUser = await authService.signUpWithEmail({ email, password, name });
      setUser(authUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar conta';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      const authUser = await authService.signInWithGoogle();
      setUser(authUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login com Google';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInAnonymously = async () => {
    try {
      setLoading(true);
      setError(null);
      const authUser = await authService.signInAnonymously();
      setUser(authUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login anônimo';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signOut();
      setUser(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer logout';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Pick<User, 'name' | 'photoURL'>>) => {
    try {
      setError(null);
      await authService.updateProfile(updates);
      if (user) {
        setUser({ ...user, ...updates });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar perfil';
      setError(errorMessage);
      throw err;
    }
  };

  const sendPasswordResetEmail = async (email: string) => {
    try {
      setError(null);
      await authService.sendPasswordResetEmail(email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar email de recuperação';
      setError(errorMessage);
      throw err;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    initialized,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInAnonymously,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

