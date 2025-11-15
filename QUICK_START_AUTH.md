# Guia Rápido - Autenticação e Banco de Dados

## ✅ O que já está funcionando

### 1. Autenticação Local (Modo Offline)

O app já funciona **completamente sem Firebase**:

- ✅ Login anônimo
- ✅ Login com Email/Senha (armazenado localmente)
- ✅ Registro de usuários
- ✅ Proteção de rotas
- ✅ Perfil de usuário
- ✅ Logout
- ✅ Dados salvos no localStorage

### 2. Estrutura Pronta para Firebase

A estrutura está pronta para quando você configurar o Firebase:

- ✅ Tipos de autenticação definidos
- ✅ Serviços de autenticação (Firebase e Local)
- ✅ Serviços de banco de dados (Firestore e Local)
- ✅ Hook de sincronização
- ✅ Integração com perfil

## 🚀 Como usar agora (sem Firebase)

### 1. Iniciar o App

```bash
npm run dev
```

### 2. Fazer Login

1. O app redirecionará para `/login`
2. Você pode:
   - **Fazer login anônimo**: Clique em "Continuar sem conta"
   - **Criar conta**: Preencha nome, email e senha
   - **Fazer login**: Use email e senha (após criar conta)

### 3. Usar o App

Após o login, você terá acesso a:
- ✅ Mapa e alarmes
- ✅ Listas (tarefas e compras)
- ✅ Favoritos
- ✅ Histórico
- ✅ Configurações
- ✅ Perfil

## 📦 Configurar Firebase (Opcional)

Se você quiser sincronização em nuvem:

### 1. Instalar Firebase

```bash
npm install firebase
```

### 2. Configurar Firebase

Siga o guia em `SETUP_FIREBASE.md`

### 3. Adicionar Variáveis de Ambiente

Crie um arquivo `.env`:

```env
VITE_FIREBASE_API_KEY=sua_chave
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

### 4. Implementar Serviços Firebase

Atualize os arquivos:
- `src/services/auth/firebaseAuth.ts`
- `src/services/database/firebaseDatabase.ts`

Veja `IMPLEMENTATION_GUIDE.md` para detalhes.

## 🔐 Métodos de Autenticação

### Modo Local (Atual)

1. **Anônimo**: Login sem criar conta
2. **Email/Senha**: Criação de conta e login
3. **Google**: Simulado (será real quando Firebase for configurado)

### Modo Firebase (Quando configurado)

1. **Google OAuth**: Login real com Google
2. **Email/Senha**: Autenticação Firebase
3. **Anônimo**: Autenticação anônima Firebase

## 📊 Estrutura de Dados

### Local (localStorage)

- `sonecaz_auth_user`: Dados do usuário autenticado
- `sonecaz_profile`: Perfil do usuário
- `sonecaz_favorites`: Favoritos
- `sonecaz_lists`: Listas
- `sonecaz_recurring_alarms`: Alarmes recorrentes
- `sonecaz_alarm_history`: Histórico de alarmes

### Firebase (Quando configurado)

- `users/{userId}`: Dados do usuário
- `favorites/{userId}`: Favoritos do usuário
- `lists/{userId}`: Listas do usuário
- `alarms/{userId}`: Alarmes do usuário
- `history/{userId}`: Histórico do usuário

## 🎯 Próximos Passos

1. **Testar autenticação local**: Faça login e teste as funcionalidades
2. **Configurar Firebase** (opcional): Para sincronização em nuvem
3. **Implementar serviços Firebase**: Quando Firebase for configurado
4. **Testar sincronização**: Verificar se dados sincronizam entre dispositivos

## 📝 Notas

- O app funciona **perfeitamente sem Firebase**
- Todos os dados são salvos localmente
- Quando Firebase for configurado, os dados serão sincronizados automaticamente
- A migração de dados é automática na primeira sincronização

## 🐛 Solução de Problemas

### App não carrega

- Verifique se todas as dependências estão instaladas: `npm install`
- Verifique o console do navegador para erros

### Login não funciona

- Verifique se o AuthContext está configurado corretamente
- Verifique o console para mensagens de erro

### Dados não salvam

- Verifique se o localStorage está habilitado no navegador
- Verifique o console para erros de salvamento

### Rotas protegidas não funcionam

- Verifique se o ProtectedRoute está envolvendo as rotas corretamente
- Verifique se o AuthProvider está no App.tsx



