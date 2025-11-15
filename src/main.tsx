import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Gerenciar Service Worker
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    // Em produção: registrar Service Worker (apenas se o arquivo existir)
    window.addEventListener('load', () => {
      fetch('/sw.js', { method: 'HEAD' })
        .then((response) => {
          if (response.ok) {
            return navigator.serviceWorker.register('/sw.js');
          }
          console.warn('Service Worker não encontrado, pulando registro');
          return null;
        })
        .then((registration) => {
          if (registration) {
            console.log('Service Worker registered:', registration);
          }
        })
        .catch((error) => {
          // Silenciar erro se Service Worker não estiver disponível
          console.warn('Service Worker não disponível:', error.message);
        });
    });
  } else {
    // Em desenvolvimento: desregistrar Service Workers existentes
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().then((success) => {
          if (success) {
            console.log('Service Worker unregistered in development mode');
          }
        });
      });
    });
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

console.log('[Main] Iniciando aplicação...');

try {
  console.log('[Main] Renderizando App...');
  createRoot(rootElement).render(<App />);
  console.log('[Main] App renderizado com sucesso');
} catch (error) {
  console.error("[Main] Erro ao renderizar aplicação:", error);
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; text-align: center; font-family: system-ui;">
      <div>
        <h1 style="color: #ef4444; margin-bottom: 16px;">Erro ao carregar aplicação</h1>
        <p style="color: #6b7280; margin-bottom: 24px;">Ocorreu um erro ao inicializar a aplicação. Por favor, recarregue a página.</p>
        <pre style="background: #f3f4f6; padding: 16px; border-radius: 8px; text-align: left; font-size: 12px; margin-bottom: 24px; overflow: auto;">${error instanceof Error ? error.stack : String(error)}</pre>
        <button onclick="window.location.reload()" style="padding: 12px 24px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
          Recarregar Página
        </button>
      </div>
    </div>
  `;
}




