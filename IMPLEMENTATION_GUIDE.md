# Guia de Implementação - Autenticação e Banco de Dados

## Status da Implementação

### ✅ Implementado

1. **Estrutura de Autenticação**
   - Tipos de autenticação (`src/types/auth.ts`)
   - Contexto de autenticação (`src/contexts/AuthContext.tsx`)
   - Serviços de autenticação (Firebase e Local)
   - Hook `useAuth` para acesso ao estado de autenticação

2. **Componentes de Autenticação**
   - Página de Login (`src/pages/Login.tsx`)
   - Proteção de Rotas (`src/components/auth/ProtectedRoute.tsx`)
   - Componente de Loading (`src/components/auth/PageLoader.tsx`)

3. **Estrutura de Banco de Dados**
   - Tipos de banco de dados (`src/types/database.ts`)
   - Serviços de banco de dados (Firestore e Local)
   - Hook `useSync` para sincronização de dados

4. **Integração**
   - App.tsx atualizado com AuthProvider
   - Rotas protegidas
   - Integração com perfil de usuário
   - Logout funcional

### ⚠️ Pendente de Configuração

1. **Firebase Auth** - Implementação completa
   - Instalar Firebase: `npm install firebase`
   - Configurar variáveis de ambiente
   - Implementar métodos em `src/services/auth/firebaseAuth.ts`

2. **Firestore Database** - Implementação completa
   - Configurar Firestore
   - Implementar métodos em `src/services/database/firebaseDatabase.ts`
   - Configurar regras de segurança

3. **Sincronização de Dados**
   - Migrar dados do localStorage para Firestore
   - Implementar sincronização em tempo real
   - Adicionar tratamento de conflitos

## Como Funciona Atualmente

### Modo Offline (Padrão)

O app funciona **sem Firebase** usando:
- **Autenticação Local**: Usuários podem fazer login anônimo ou com email/senha (armazenado no localStorage)
- **Banco de Dados Local**: Todos os dados são armazenados no localStorage
- **Sem Sincronização**: Dados são locais ao dispositivo

### Modo Online (Quando Firebase for Configurado)

Quando Firebase for configurado:
- **Autenticação Firebase**: Login com Google, Email/Senha, etc.
- **Firestore Database**: Dados sincronizados em nuvem
- **Sincronização Automática**: Dados sincronizados entre dispositivos

## Próximos Passos

### 1. Instalar Firebase (Opcional)

```bash
npm install firebase
```

### 2. Configurar Firebase

1. Siga o guia em `SETUP_FIREBASE.md`
2. Adicione as variáveis de ambiente no arquivo `.env`
3. Reinicie o servidor

### 3. Implementar Firebase Auth

Atualize `src/services/auth/firebaseAuth.ts` com a implementação real do Firebase:

```typescript
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
} from 'firebase/auth';
import { auth } from '@/config/firebase'; // Criar este arquivo
```

### 4. Implementar Firestore Database

Atualize `src/services/database/firebaseDatabase.ts` com a implementação real do Firestore:

```typescript
import { 
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
} from 'firebase/firestore';
import { db } from '@/config/firebase'; // Criar este arquivo
```

### 5. Criar Arquivo de Configuração Firebase

Crie `src/config/firebase.ts`:

```typescript
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getFirebaseConfig } from './firebase';

const config = getFirebaseConfig();
if (!config) {
  throw new Error('Firebase não está configurado');
}

const app: FirebaseApp = getApps().length === 0 
  ? initializeApp(config) 
  : getApps()[0];

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export default app;
```

## Estrutura de Dados no Firestore

### Coleções

```
users/{userId}
  - id: string
  - email: string | null
  - name: string
  - photoURL: string | null
  - createdAt: timestamp
  - updatedAt: timestamp
  - lastLoginAt: timestamp
  - settings: object
  - preferences: object

favorites/{userId}
  - userId: string
  - favorites: array
  - createdAt: timestamp
  - updatedAt: timestamp

lists/{userId}
  - userId: string
  - lists: array
  - createdAt: timestamp
  - updatedAt: timestamp

alarms/{userId}
  - userId: string
  - recurringAlarms: array
  - createdAt: timestamp
  - updatedAt: timestamp

history/{userId}
  - userId: string
  - history: array
  - createdAt: timestamp
  - updatedAt: timestamp
```

## Testes

Para testar a autenticação:

1. **Modo Offline**: O app já funciona sem Firebase
2. **Modo Online**: Configure Firebase e teste a sincronização

## Notas Importantes

- O app funciona **perfeitamente sem Firebase**
- Os dados são salvos localmente quando Firebase não está configurado
- A migração de dados é automática quando Firebase é configurado
- A sincronização acontece automaticamente quando o usuário está autenticado



