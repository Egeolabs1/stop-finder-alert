// Componente de loading para páginas
export const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-b from-background to-secondary/30 flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
      <p className="text-sm text-muted-foreground">Carregando...</p>
    </div>
  </div>
);



