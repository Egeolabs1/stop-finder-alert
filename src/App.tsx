import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PageLoader } from "@/components/auth/PageLoader";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Import direto (sem lazy loading) para evitar erro React #306
// O code splitting será feito pelo Vite automaticamente via manualChunks
// Usar extensão .tsx explícita para garantir que o Vite encontre o arquivo
import Index from "./pages/Index.tsx";
import Lists from "./pages/Lists";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import History from "./pages/History";
import RecurringAlarms from "./pages/RecurringAlarms";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});


const App = () => {
  console.log('[App] Renderizando App...');
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <ErrorBoundary>
                <Routes>
                  {/* Rotas públicas */}
                  <Route 
                    path="/login" 
                    element={
                      <ProtectedRoute requireAuth={false} redirectAuthenticatedTo="/">
                        <Login />
                      </ProtectedRoute>
                    } 
                  />
                  
                  {/* Rotas protegidas */}
                  <Route 
                    path="/" 
                    element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } 
                  />
              <Route 
                path="/lists" 
                element={
                  <ProtectedRoute>
                    <Lists />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/history" 
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/recurring-alarms" 
                element={
                  <ProtectedRoute>
                    <RecurringAlarms />
                  </ProtectedRoute>
                } 
              />
              
                  {/* Rota de fallback */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
