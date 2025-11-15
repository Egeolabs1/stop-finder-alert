# Configuração do Firebase

Este guia explica como configurar o Firebase para autenticação e banco de dados no Sonecaz.

## 1. Criar Projeto no Firebase

1. Acesse o [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Preencha o nome do projeto (ex: "sonecaz")
4. (Opcional) Configure o Google Analytics
5. Clique em "Criar projeto"

## 2. Configurar Autenticação

1. No Firebase Console, vá para "Authentication" > "Get started"
2. Clique em "Sign-in method"
3. Habilite os seguintes provedores:
   - **Email/Password**: Clique em "Email/Password" e habilite
   - **Google**: Clique em "Google" e habilite (configure o email de suporte)
   - **Anonymous**: Clique em "Anonymous" e habilite (opcional)

## 3. Configurar Firestore Database

1. No Firebase Console, vá para "Firestore Database" > "Create database"
2. Escolha "Start in test mode" (para desenvolvimento) ou configure as regras de segurança
3. Escolha a localização do banco de dados (ex: us-central1)
4. Clique em "Enable"

### Regras de Segurança do Firestore

Configure as regras de segurança no Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuários podem ler/escrever apenas seus próprios dados
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Favoritos do usuário
    match /favorites/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Listas do usuário
    match /lists/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Alarmes do usuário
    match /alarms/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Histórico do usuário
    match /history/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 4. Obter Credenciais do Firebase

1. No Firebase Console, vá para "Project settings" (ícone de engrenagem)
2. Role até "Your apps" e clique no ícone da Web (</>)
3. Preencha o nome do app (ex: "Sonecaz Web")
4. Copie as credenciais do Firebase (não marque "Also set up Firebase Hosting")

## 5. Configurar no Projeto

1. Crie um arquivo `.env` na raiz do projeto (se não existir)
2. Adicione as seguintes variáveis de ambiente:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=sua_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
VITE_FIREBASE_MEASUREMENT_ID=seu_measurement_id (opcional)
```

3. Substitua os valores pelas suas credenciais do Firebase

## 6. Instalar Dependências do Firebase

Execute o seguinte comando para instalar o Firebase SDK:

```bash
npm install firebase
```

## 7. Reiniciar o Servidor

Após configurar as variáveis de ambiente, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

## 8. Implementar Firebase Auth e Firestore

Após instalar o Firebase, você precisará implementar:

1. **Firebase Auth**: Atualizar `src/services/auth/firebaseAuth.ts` com a implementação real
2. **Firestore**: Atualizar `src/services/database/firebaseDatabase.ts` com a implementação real

Exemplo de inicialização do Firebase:

```typescript
// src/config/firebase.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app: FirebaseApp = getApps().length === 0 
  ? initializeApp(firebaseConfig) 
  : getApps()[0];

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export default app;
```

## Modo Offline

O app funcionará em modo offline usando autenticação local quando o Firebase não estiver configurado. Os dados serão armazenados no `localStorage` e podem ser sincronizados quando o Firebase for configurado.

## Solução de Problemas

- **Erro "Firebase não está configurado"**: Verifique se todas as variáveis de ambiente estão configuradas corretamente
- **Erro de autenticação**: Verifique se os provedores de autenticação estão habilitados no Firebase Console
- **Erro de permissões**: Verifique as regras de segurança do Firestore
- **Dados não sincronizam**: Verifique se o Firebase está configurado e se o usuário está autenticado



