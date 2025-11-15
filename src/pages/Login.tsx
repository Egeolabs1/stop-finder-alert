// Página de login
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Lock, LogIn, UserPlus, Chrome, Bell } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const { signInWithEmail, signUpWithEmail, signInWithGoogle, signInAnonymously, error, loading } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    try {
      if (isSignUp) {
        if (!name.trim()) {
          setLocalError('Nome é obrigatório');
          return;
        }
        await signUpWithEmail(email, password, name);
        toast.success('Conta criada com sucesso!');
      } else {
        await signInWithEmail(email, password);
        toast.success('Login realizado com sucesso!');
      }
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login';
      setLocalError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLocalError(null);
      await signInWithGoogle();
      toast.success('Login com Google realizado com sucesso!');
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login com Google';
      setLocalError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      setLocalError(null);
      await signInAnonymously();
      toast.success('Login anônimo realizado com sucesso!');
      navigate('/');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao fazer login anônimo';
      setLocalError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          {/* Logo e Nome do App */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="relative group">
              {/* Efeito de brilho animado */}
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl animate-pulse"></div>
              {/* Container do logo */}
              <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-5 rounded-full border-2 border-primary/40 shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Bell 
                  className="w-14 h-14 text-primary group-hover:animate-bounce" 
                  fill="currentColor"
                  strokeWidth={1.5}
                />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent tracking-tight">
                Sonecaz
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Alarmes inteligentes de localização
              </p>
            </div>
          </div>
          
          {/* Título do Formulário */}
          <div className="space-y-1 pt-4 border-t">
            <CardTitle className="text-xl font-semibold text-center">
              {isSignUp ? 'Criar Conta' : 'Entrar'}
            </CardTitle>
            <CardDescription className="text-center">
              {isSignUp 
                ? 'Crie uma conta para sincronizar seus dados'
                : 'Faça login para acessar seu perfil'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Sign In */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <Chrome className="w-4 h-4 mr-2" />
            Continuar com Google
          </Button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Ou continue com</span>
            </div>
          </div>

          {/* Error Alert */}
          {displayError && (
            <Alert variant="destructive">
              <AlertDescription>{displayError}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                    required={isSignUp}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? 'Carregando...' : isSignUp ? 'Criar Conta' : 'Entrar'}
            </Button>
          </form>

          {/* Toggle Sign Up/In */}
          <div className="text-center text-sm">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setLocalError(null);
              }}
              className="text-primary hover:underline"
            >
              {isSignUp 
                ? 'Já tem uma conta? Faça login'
                : 'Não tem uma conta? Criar conta'}
            </button>
          </div>

          {/* Anonymous Sign In */}
          <div className="pt-4 border-t">
            <Button
              type="button"
              variant="ghost"
              className="w-full"
              onClick={handleAnonymousSignIn}
              disabled={loading}
            >
              Continuar sem conta (modo offline)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

