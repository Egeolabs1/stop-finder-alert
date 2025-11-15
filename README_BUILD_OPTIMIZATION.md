# Otimizações de Build e Code Splitting

Este documento descreve as otimizações implementadas para reduzir o tamanho dos chunks JavaScript e melhorar o desempenho da aplicação.

## Estratégias Implementadas

### 1. Code Splitting Manual (manualChunks)

As dependências foram separadas em chunks menores para permitir carregamento paralelo e cache mais eficiente:

- **react-vendor**: React e React DOM
- **router-vendor**: React Router
- **google-maps-vendor**: Google Maps API (biblioteca grande, carregada sob demanda)
- **query-vendor**: TanStack Query
- **radix-ui-core**: Componentes UI mais usados (Dialog, Dropdown, Select, Toast, Tooltip)
- **radix-ui-other**: Outros componentes Radix UI
- **icons-vendor**: Lucide React (biblioteca de ícones)
- **date-vendor**: date-fns
- **form-vendor**: React Hook Form, Zod, Hookform Resolvers
- **capacitor-vendor**: Capacitor (apenas para builds mobile)
- **toast-vendor**: Sonner
- **charts-vendor**: Recharts (se usado)
- **theme-vendor**: next-themes
- **vendor**: Outras dependências pequenas

### 2. Lazy Loading de Páginas

Todas as páginas são carregadas dinamicamente usando `React.lazy()`:

```typescript
const Index = lazy(() => import("./pages/Index"));
const Lists = lazy(() => import("./pages/Lists"));
const Settings = lazy(() => import("./pages/Settings"));
// etc...
```

Isso significa que cada página só é carregada quando o usuário navega para ela.

### 3. Otimizações de Build

- **Minificação**: Usa esbuild (mais rápido que terser)
- **Source Maps**: Apenas em desenvolvimento
- **Assets Inline**: Arquivos menores que 4KB são inlineados
- **Target**: ESNext para melhor tree-shaking
- **Compressed Size Report**: Relatório de tamanhos comprimidos

### 4. Otimizações de Dependências

- **Dedupe**: React e React DOM são deduplicados
- **OptimizeDeps**: Dependências principais são pré-otimizadas
- **Tree Shaking**: Imports não utilizados são removidos automaticamente

## Limites de Tamanho

- **chunkSizeWarningLimit**: 500 KB (padrão do Vite)
- Chunks maiores que 500 KB geram avisos no build

## Como Reduzir Ainda Mais

### 1. Otimizar Imports do Lucide React

Ao invés de:
```typescript
import { Icon1, Icon2, Icon3 } from 'lucide-react';
```

Considere usar imports dinâmicos para ícones raramente usados.

### 2. Lazy Load do Google Maps

O Google Maps já é carregado apenas quando necessário através do `useJsApiLoader`, mas pode ser otimizado ainda mais usando dynamic imports.

### 3. Remover Dependências Não Utilizadas

Verifique se todas as dependências em `package.json` estão sendo usadas:
```bash
npx depcheck
```

### 4. Usar Bundle Analyzer

Para visualizar o tamanho de cada chunk:
```bash
npm run build -- --analyze
```

## Resultados Esperados

Com essas otimizações, você deve ver:
- Chunks menores que 500 KB
- Carregamento mais rápido da página inicial
- Cache mais eficiente (chunks raramente alterados são cacheados separadamente)
- Melhor desempenho em conexões lentas

## Monitoramento

Após cada build, verifique:
1. Tamanho dos chunks no console do build
2. Tamanho total do bundle
3. Avisos de chunks grandes
4. Tempo de carregamento no navegador (Network tab)

## Próximos Passos

1. Implementar lazy loading para componentes pesados
2. Usar dynamic imports para funcionalidades raramente usadas
3. Considerar usar CDN para bibliotecas grandes (Google Maps, etc.)
4. Implementar Service Worker para cache mais agressivo



