// Componente para proteger rotas que exigem autenticação
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from './PageLoader';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  redirectAuthenticatedTo?: string;
}

export const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/login',
  redirectAuthenticatedTo 
}: ProtectedRouteProps) => {
  // useAuth deve ser chamado incondicionalmente (regra dos hooks)
  const { user, loading, initialized } = useAuth();

  console.log('[ProtectedRoute] Estado:', { requireAuth, hasUser: !!user, loading, initialized });

  // Aguardar inicialização
  if (!initialized || loading) {
    console.log('[ProtectedRoute] Aguardando inicialização...');
    return <PageLoader />;
  }

  // Se requer autenticação e usuário não está autenticado, redirecionar
  if (requireAuth && !user) {
    console.log('[ProtectedRoute] Redirecionando para login (requer autenticação)');
    return <Navigate to={redirectTo} replace />;
  }

  // Se não requer autenticação e usuário está autenticado, redirecionar (se especificado)
  if (!requireAuth && user && redirectAuthenticatedTo) {
    console.log('[ProtectedRoute] Redirecionando usuário autenticado');
    return <Navigate to={redirectAuthenticatedTo} replace />;
  }

  console.log('[ProtectedRoute] Renderizando children');
  // Garantir que children seja um elemento React válido
  if (!children) {
    console.error('[ProtectedRoute] Children é undefined ou null');
    return <div>Erro: componente não disponível</div>;
  }
  
  // Validar se children é um elemento React válido
  try {
    const childrenElement = children as React.ReactElement;
    if (!childrenElement || typeof childrenElement !== 'object' || !('type' in childrenElement)) {
      console.error('[ProtectedRoute] Children não é um elemento React válido:', typeof children, children);
      return <div>Erro: componente inválido</div>;
    }
    return <>{children}</>;
  } catch (error) {
    console.error('[ProtectedRoute] Erro ao renderizar children:', error);
    return <div>Erro ao renderizar componente</div>;
  }
};

