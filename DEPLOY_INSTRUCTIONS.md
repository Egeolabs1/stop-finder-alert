# Instruções para Deploy no Vercel

## Problema Atual
O repositório Git está no diretório home do usuário, não no diretório do projeto. Isso impede o commit e push dos arquivos corretos.

## Solução Manual

### Passo 1: Abrir o Terminal no Cursor
1. No Cursor, pressione `Ctrl + '` (Ctrl + aspas simples) para abrir o terminal
2. **IMPORTANTE**: Certifique-se de que o terminal está no diretório do projeto:
   ```
   C:\Users\newto\OneDrive\Área de Trabalho\Cursor\Sonecaz 2
   ```

### Passo 2: Verificar o Diretório
Execute:
```bash
pwd
# Deve mostrar: C:\Users\newto\OneDrive\Área de Trabalho\Cursor\Sonecaz 2

# Verificar se package.json existe
Test-Path package.json
# Deve retornar: True
```

### Passo 3: Remover Git Incorreto (se houver)
```bash
# Se houver um .git no diretório home, remova-o
# Primeiro, verifique onde está o .git:
git rev-parse --show-toplevel

# Se mostrar C:/Users/newto, você precisa remover esse .git
# E inicializar um novo no diretório do projeto
```

### Passo 4: Inicializar Git no Diretório do Projeto
```bash
# Remover .git do diretório home (se existir)
Remove-Item -Path "C:\Users\newto\.git" -Recurse -Force -ErrorAction SilentlyContinue

# Certificar que está no diretório do projeto
cd "C:\Users\newto\OneDrive\Área de Trabalho\Cursor\Sonecaz 2"

# Inicializar Git no diretório do projeto
git init

# Adicionar remote
git remote add origin https://github.com/Egeolabs1/stop-finder-alert.git

# Renomear branch para main
git branch -M main
```

### Passo 5: Adicionar Arquivos do Projeto
```bash
# Adicionar arquivos de configuração
git add package.json package-lock.json vercel.json vite.config.ts
git add tsconfig.json tsconfig.app.json tsconfig.node.json
git add tailwind.config.ts postcss.config.js components.json
git add index.html README.md SETUP_GOOGLE_MAPS.md
git add capacitor.config.ts eslint.config.js .gitignore

# Adicionar pastas do projeto
git add src/ public/

# Verificar o que será commitado
git status
```

### Passo 6: Fazer Commit
```bash
git commit -m "feat: adicionar sistema multilíngue, configuração do Vercel e todas as funcionalidades"
```

### Passo 7: Push para o GitHub
```bash
# Se o repositório no GitHub já tiver commits:
git pull origin main --allow-unrelated-histories

# Depois, fazer push:
git push -u origin main
```

### Passo 8: Verificar no Vercel
Após o push bem-sucedido:
1. O Vercel detectará automaticamente o novo commit
2. Um novo deploy será iniciado
3. O build deve funcionar agora que o `package.json` está no repositório

## Solução Alternativa: Usar GitHub Desktop

Se os comandos Git estiverem complicados, você pode:

1. **Instalar GitHub Desktop**: https://desktop.github.com/
2. **Abrir o repositório** no GitHub Desktop
3. **Adicionar os arquivos** do projeto
4. **Fazer commit e push** através da interface gráfica

## Configuração do Vercel

Após o push, no painel do Vercel:

1. **Settings → General → Build & Development Settings**
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Environment Variables**: Adicione `VITE_GOOGLE_MAPS_API_KEY` com sua chave

## Verificação Final

Após o deploy:
- ✅ O repositório no GitHub contém `package.json`
- ✅ O Vercel consegue fazer `npm install`
- ✅ O build é executado com `npm run build`
- ✅ O app está disponível no domínio do Vercel


## Problema Atual
O repositório Git está no diretório home do usuário, não no diretório do projeto. Isso impede o commit e push dos arquivos corretos.

## Solução Manual

### Passo 1: Abrir o Terminal no Cursor
1. No Cursor, pressione `Ctrl + '` (Ctrl + aspas simples) para abrir o terminal
2. **IMPORTANTE**: Certifique-se de que o terminal está no diretório do projeto:
   ```
   C:\Users\newto\OneDrive\Área de Trabalho\Cursor\Sonecaz 2
   ```

### Passo 2: Verificar o Diretório
Execute:
```bash
pwd
# Deve mostrar: C:\Users\newto\OneDrive\Área de Trabalho\Cursor\Sonecaz 2

# Verificar se package.json existe
Test-Path package.json
# Deve retornar: True
```

### Passo 3: Remover Git Incorreto (se houver)
```bash
# Se houver um .git no diretório home, remova-o
# Primeiro, verifique onde está o .git:
git rev-parse --show-toplevel

# Se mostrar C:/Users/newto, você precisa remover esse .git
# E inicializar um novo no diretório do projeto
```

### Passo 4: Inicializar Git no Diretório do Projeto
```bash
# Remover .git do diretório home (se existir)
Remove-Item -Path "C:\Users\newto\.git" -Recurse -Force -ErrorAction SilentlyContinue

# Certificar que está no diretório do projeto
cd "C:\Users\newto\OneDrive\Área de Trabalho\Cursor\Sonecaz 2"

# Inicializar Git no diretório do projeto
git init

# Adicionar remote
git remote add origin https://github.com/Egeolabs1/stop-finder-alert.git

# Renomear branch para main
git branch -M main
```

### Passo 5: Adicionar Arquivos do Projeto
```bash
# Adicionar arquivos de configuração
git add package.json package-lock.json vercel.json vite.config.ts
git add tsconfig.json tsconfig.app.json tsconfig.node.json
git add tailwind.config.ts postcss.config.js components.json
git add index.html README.md SETUP_GOOGLE_MAPS.md
git add capacitor.config.ts eslint.config.js .gitignore

# Adicionar pastas do projeto
git add src/ public/

# Verificar o que será commitado
git status
```

### Passo 6: Fazer Commit
```bash
git commit -m "feat: adicionar sistema multilíngue, configuração do Vercel e todas as funcionalidades"
```

### Passo 7: Push para o GitHub
```bash
# Se o repositório no GitHub já tiver commits:
git pull origin main --allow-unrelated-histories

# Depois, fazer push:
git push -u origin main
```

### Passo 8: Verificar no Vercel
Após o push bem-sucedido:
1. O Vercel detectará automaticamente o novo commit
2. Um novo deploy será iniciado
3. O build deve funcionar agora que o `package.json` está no repositório

## Solução Alternativa: Usar GitHub Desktop

Se os comandos Git estiverem complicados, você pode:

1. **Instalar GitHub Desktop**: https://desktop.github.com/
2. **Abrir o repositório** no GitHub Desktop
3. **Adicionar os arquivos** do projeto
4. **Fazer commit e push** através da interface gráfica

## Configuração do Vercel

Após o push, no painel do Vercel:

1. **Settings → General → Build & Development Settings**
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Environment Variables**: Adicione `VITE_GOOGLE_MAPS_API_KEY` com sua chave

## Verificação Final

Após o deploy:
- ✅ O repositório no GitHub contém `package.json`
- ✅ O Vercel consegue fazer `npm install`
- ✅ O build é executado com `npm run build`
- ✅ O app está disponível no domínio do Vercel





