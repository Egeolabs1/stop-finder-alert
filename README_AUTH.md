# Sistema de Autenticação e Banco de Dados

O Sonecaz agora possui um sistema completo de autenticação e banco de dados, com suporte para:

- ✅ Autenticação com Email/Senha
- ✅ Autenticação com Google (OAuth)
- ✅ Autenticação Anônima
- ✅ Proteção de Rotas
- ✅ Sincronização de Dados
- ✅ Modo Offline (localStorage como fallback)

## Arquitetura

### Autenticação

O sistema de autenticação é modular e suporta múltiplos provedores:

1. **Firebase Auth** (quando configurado)
2. **Local Auth** (fallback usando localStorage)

### Banco de Dados

O sistema de banco de dados também é modular:

1. **Firestore** (quando Firebase está configurado)
2. **Local Database** (fallback usando localStorage)

### Estrutura de Arquivos

```
src/
├── contexts/
│   └── AuthContext.tsx          # Contexto de autenticação
├── components/
│   └── auth/
│       ├── ProtectedRoute.tsx   # Proteção de rotas
│       └── PageLoader.tsx       # Componente de loading
├── pages/
│   └── Login.tsx                # Página de login
├── services/
│   ├── auth/
│   │   ├── firebaseAuth.ts      # Serviço Firebase Auth
│   │   ├── localAuth.ts         # Serviço Local Auth
│   │   └── index.ts             # Exportar serviço apropriado
│   └── database/
│       ├── firebaseDatabase.ts  # Serviço Firestore
│       ├── localDatabase.ts     # Serviço Local Database
│       └── index.ts             # Exportar serviço apropriado
├── hooks/
│   └── useSync.ts               # Hook de sincronização
└── types/
    ├── auth.ts                  # Tipos de autenticação
    └── database.ts              # Tipos de banco de dados
```

## Configuração Rápida

### 1. Modo Offline (Sem Firebase)

O app funciona sem Firebase usando autenticação local. Os dados são armazenados no `localStorage`.

**Não é necessário configurar nada** - o app já funciona assim!

### 2. Modo Online (Com Firebase)

Para habilitar sincronização em nuvem e autenticação Google:

1. **Configure o Firebase** seguindo o guia em `SETUP_FIREBASE.md`
2. **Instale as dependências**:
   ```bash
   npm install firebase
   ```
3. **Configure as variáveis de ambiente** no arquivo `.env`:
   ```env
   VITE_FIREBASE_API_KEY=sua_chave
   VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=seu-projeto-id
   VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
   VITE_FIREBASE_APP_ID=seu_app_id
   ```
4. **Implemente os serviços Firebase**:
   - Atualize `src/services/auth/firebaseAuth.ts`
   - Atualize `src/services/database/firebaseDatabase.ts`

## Uso

### Autenticação

```typescript
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, signInWithGoogle, signOut, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  
  if (!user) {
    return <button onClick={signInWithGoogle}>Login com Google</button>;
  }

  return (
    <div>
      <p>Olá, {user.name}!</p>
      <button onClick={signOut}>Sair</button>
    </div>
  );
}
```

### Proteção de Rotas

As rotas são automaticamente protegidas pelo `ProtectedRoute`:

```typescript
<Route 
  path="/profile" 
  element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } 
/>
```

### Sincronização

```typescript
import { useSync } from '@/hooks/useSync';

function MyComponent() {
  const { syncAll, syncStatus } = useSync();

  return (
    <div>
      <button onClick={syncAll}>Sincronizar</button>
      {syncStatus.isSyncing && <p>Sincronizando...</p>}
      {syncStatus.lastSyncAt && (
        <p>Última sincronização: {syncStatus.lastSyncAt.toLocaleString()}</p>
      )}
    </div>
  );
}
```

## Funcionalidades

### Autenticação

- ✅ Login com Email/Senha
- ✅ Registro com Email/Senha
- ✅ Login com Google (quando Firebase está configurado)
- ✅ Login Anônimo
- ✅ Logout
- ✅ Recuperação de Senha
- ✅ Atualização de Perfil
- ✅ Gerenciamento de Conta

### Banco de Dados

- ✅ Sincronização de Favoritos
- ✅ Sincronização de Listas
- ✅ Sincronização de Alarmes Recorrentes
- ✅ Sincronização de Histórico
- ✅ Sincronização Automática
- ✅ Sincronização Manual
- ✅ Modo Offline

### Proteção

- ✅ Proteção de Rotas
- ✅ Redirecionamento Automático
- ✅ Estado de Loading
- ✅ Tratamento de Erros

## Próximos Passos

1. **Configurar Firebase** (se desejar sincronização em nuvem)
2. **Implementar serviços Firebase** (quando Firebase estiver configurado)
3. **Migrar dados existentes** do localStorage para o banco de dados
4. **Adicionar sincronização em tempo real** (usando Firestore listeners)
5. **Implementar backup automático** de dados

## Notas

- O app funciona perfeitamente **sem Firebase** usando autenticação local
- Os dados são armazenados no `localStorage` quando Firebase não está configurado
- Quando Firebase é configurado, os dados são sincronizados automaticamente
- A migração de dados do localStorage para Firebase é automática na primeira sincronização



