import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Deduplicação mais agressiva para evitar múltiplas instâncias do React
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    // Garantir que o React seja sempre resolvido corretamente
    preserveSymlinks: false,
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-router-dom',
      '@tanstack/react-query',
    ],
    // Excluir Google Maps do optimizeDeps - será carregado dinamicamente
    exclude: ['@react-google-maps/api'],
    // Forçar re-otimização apenas em desenvolvimento
    force: mode === 'development',
    esbuildOptions: {
      jsx: 'automatic',
    },
  },
  build: {
    // Code splitting otimizado
    rollupOptions: {
      output: {
        // Garantir que React seja sempre carregado primeiro
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: (chunkInfo) => {
          // React sempre primeiro
          if (chunkInfo.name === 'react-vendor') {
            return 'assets/react-vendor-[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
        // DESABILITAR code splitting temporariamente para resolver erro React #306
        // Se isso resolver, então o problema está no code splitting
        // manualChunks: undefined, // Descomentar esta linha para desabilitar code splitting
        manualChunks: undefined, // DESABILITADO TEMPORARIAMENTE PARA RESOLVER ERRO REACT #306
        /* manualChunks(id) {
          // Vendor chunks principais - apenas para node_modules
          // Arquivos do projeto (src/) não devem ser separados em chunks
          // para evitar problemas com exports e imports
          if (!id.includes('node_modules')) {
            // Retornar undefined para arquivos do projeto - Vite tratará automaticamente
            return undefined;
          }

          // React core - verificação mais específica (incluir jsx-runtime)
          if (
            id.includes('node_modules/react/') ||
            id.includes('node_modules/react-dom/') ||
            id.includes('node_modules/react/index') ||
            id.includes('node_modules/react-dom/index') ||
            id.includes('node_modules/react/jsx-runtime') ||
            id.includes('node_modules/react/jsx-dev-runtime')
          ) {
            return 'react-vendor';
          }
          
          // React Router
          if (id.includes('react-router')) {
            return 'router-vendor';
          }
          
          // Google Maps (biblioteca grande - separar em chunks menores)
          if (id.includes('@react-google-maps')) {
            // Separar componentes do Google Maps em chunks menores
            if (id.includes('GoogleMap')) {
              return 'google-maps-core';
            }
            if (id.includes('Marker') || id.includes('Circle')) {
              return 'google-maps-markers';
            }
            if (id.includes('useJsApiLoader') || id.includes('LoadScript')) {
              return 'google-maps-loader';
            }
            // Outros componentes do Google Maps
            return 'google-maps-other';
          }
          // Google Maps API global (carregado externamente)
          if (id.includes('google.maps')) {
            return 'google-maps-api';
          }
          
          // TanStack Query
          if (id.includes('@tanstack/react-query')) {
            return 'query-vendor';
          }
          
          // Radix UI - separar em chunks menores por componente
          if (id.includes('@radix-ui')) {
            // Componentes UI mais usados (core)
            if (
              id.includes('react-dialog') ||
              id.includes('react-dropdown-menu') ||
              id.includes('react-select')
            ) {
              return 'radix-ui-core';
            }
            // Toast e Tooltip (usados frequentemente)
            if (id.includes('react-toast') || id.includes('react-tooltip')) {
              return 'radix-ui-notifications';
            }
            // Avatar e Checkbox
            if (id.includes('react-avatar') || id.includes('react-checkbox')) {
              return 'radix-ui-forms';
            }
            // Slider e Switch
            if (id.includes('react-slider') || id.includes('react-switch')) {
              return 'radix-ui-controls';
            }
            // Outros componentes Radix UI
            return 'radix-ui-other';
          }
          
          // Lucide icons (biblioteca de ícones - pode ser grande, separar por categoria)
          if (id.includes('lucide-react')) {
            // Ícones mais usados (core)
            if (
              id.includes('lucide-react/dist/esm/icons/bell') ||
              id.includes('lucide-react/dist/esm/icons/map') ||
              id.includes('lucide-react/dist/esm/icons/settings') ||
              id.includes('lucide-react/dist/esm/icons/user')
            ) {
              return 'icons-core';
            }
            // Outros ícones
            return 'icons-vendor';
          }
          
          // Date libraries
          if (id.includes('date-fns')) {
            return 'date-vendor';
          }
          
          // Form libraries - separar
          if (id.includes('react-hook-form')) {
            return 'form-hook-vendor';
          }
          if (id.includes('@hookform')) {
            return 'form-resolvers-vendor';
          }
          if (id.includes('zod')) {
            return 'form-validation-vendor';
          }
          
          // Capacitor (mobile - separar completamente para não carregar na web)
          if (id.includes('@capacitor')) {
            return 'capacitor-vendor';
          }
          
          // Sonner (toast notifications)
          if (id.includes('sonner')) {
            return 'toast-vendor';
          }
          
          // Chart libraries (se usado)
          if (id.includes('recharts')) {
            return 'charts-vendor';
          }
          
          // next-themes (theme provider)
          if (id.includes('next-themes')) {
            return 'theme-vendor';
          }
          
          // Utilities comuns
          if (
            id.includes('clsx') ||
            id.includes('tailwind-merge') ||
            id.includes('class-variance-authority')
          ) {
            return 'utils-vendor';
          }
          
          // Embla carousel
          if (id.includes('embla-carousel')) {
            return 'carousel-vendor';
          }
          
          // React day picker
          if (id.includes('react-day-picker')) {
            return 'date-picker-vendor';
          }
          
          // React resizable panels
          if (id.includes('react-resizable-panels')) {
            return 'panels-vendor';
          }
          
          // CMK (command menu)
          if (id.includes('cmdk')) {
            return 'command-vendor';
          }
          
          // Vaul (drawer)
          if (id.includes('vaul')) {
            return 'drawer-vendor';
          }
          
          // Input OTP
          if (id.includes('input-otp')) {
            return 'otp-vendor';
          }
          
          // Separar dependências restantes em chunks menores
          // Dependências de desenvolvimento não devem estar aqui, mas por segurança
          if (id.includes('@types/')) {
            return;
          }
          
          // Abordagem conservadora: mover TODAS as dependências não categorizadas
          // para react-vendor como fallback seguro
          // Isso garante que qualquer dependência que possa precisar do React
          // esteja no mesmo chunk, evitando erros de useLayoutEffect
          const moduleName = id.split('node_modules/')[1]?.split('/')[0];
          if (moduleName) {
            // Bibliotecas que dependem do React devem estar no react-vendor
            const reactDependentLibs = [
              'react-router',
              '@tanstack',
              '@radix-ui',
              'lucide-react',
              'sonner',
              'recharts',
              'next-themes',
              'react-hook-form',
              '@hookform',
              'react-day-picker',
              'react-resizable-panels',
              'cmdk',
              'vaul',
              'input-otp',
              'embla-carousel-react',
            ];
            
            // Se for uma biblioteca que depende do React, colocar no react-vendor
            if (reactDependentLibs.some(lib => moduleName.startsWith(lib))) {
              return 'react-vendor';
            }
            
            // Verificar se o arquivo importa React (análise mais agressiva)
            // Se o caminho contém referências a React, colocar no react-vendor
            if (
              id.includes('/react') ||
              id.includes('react-') ||
              id.includes('@react') ||
              id.includes('react/')
            ) {
              return 'react-vendor';
            }
            
            // ABORDAGEM CONSERVADORA: Mover TODAS as dependências não categorizadas
            // para react-vendor como fallback seguro
            // Isso garante que qualquer dependência que possa precisar do React
            // esteja no mesmo chunk, evitando completamente erros de useLayoutEffect
            return 'react-vendor';
          }
          
          // Fallback final: também colocar em react-vendor
          return 'react-vendor';
        }, */
      },
    },
    // Otimizações de build
    chunkSizeWarningLimit: 1000, // Aumentado significativamente - Google Maps é grande mas carregado sob demanda
    sourcemap: mode === 'development',
    // Minificação DESABILITADA temporariamente para resolver erro React #306
    // minify: 'esbuild',
    minify: false, // DESABILITADO para debug - reativar após resolver erro
    // Otimizar assets
    assetsInlineLimit: 4096, // 4kb
    // Reportar tamanhos de chunks
    reportCompressedSize: true,
    // Limite de tamanho para avisos
    target: 'esnext',
  },
  // Service Worker
  worker: {
    format: 'es',
  },
}));


