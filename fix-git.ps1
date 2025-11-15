# Script para corrigir o problema do Git
# Execute este script NO TERMINAL DO CURSOR (no diretório do projeto)

Write-Host "=== Correção do Repositório Git ===" -ForegroundColor Cyan

# 1. Verificar diretório atual
$currentDir = Get-Location
Write-Host "Diretório atual: $currentDir" -ForegroundColor Yellow

# 2. Verificar se package.json existe
if (-not (Test-Path "package.json")) {
    Write-Host "ERRO: package.json não encontrado!" -ForegroundColor Red
    Write-Host "Certifique-se de estar no diretório do projeto:" -ForegroundColor Yellow
    Write-Host "C:\Users\newto\OneDrive\Área de Trabalho\Cursor\Sonecaz 2" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ package.json encontrado" -ForegroundColor Green

# 3. Remover variáveis de ambiente do Git que podem estar causando problemas
$env:GIT_DIR = $null
$env:GIT_WORK_TREE = $null
$env:GIT_COMMON_DIR = $null

# 4. Remover .git do diretório home (se existir e estiver causando problemas)
$homeGit = "C:\Users\newto\.git"
if (Test-Path $homeGit) {
    Write-Host "Removendo .git incorreto do diretório home..." -ForegroundColor Yellow
    try {
        Remove-Item -Path $homeGit -Recurse -Force -ErrorAction Stop
        Write-Host "✓ .git do diretório home removido" -ForegroundColor Green
    } catch {
        Write-Host "Aviso: Não foi possível remover .git do diretório home: $_" -ForegroundColor Yellow
    }
}

# 5. Remover .git do diretório do projeto (se existir)
if (Test-Path ".git") {
    Write-Host "Removendo .git existente do projeto..." -ForegroundColor Yellow
    Remove-Item -Path ".git" -Recurse -Force -ErrorAction SilentlyContinue
}

# 6. Inicializar Git no diretório atual (garantir que está no projeto)
Write-Host "Inicializando repositório Git..." -ForegroundColor Yellow
& git init
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao inicializar Git" -ForegroundColor Red
    exit 1
}

# 7. Verificar onde o Git foi inicializado
$gitDir = & git rev-parse --git-dir 2>&1
$gitTopLevel = & git rev-parse --show-toplevel 2>&1
Write-Host "Diretório Git: $gitTopLevel" -ForegroundColor Cyan

if ($gitTopLevel -ne $currentDir.ToString().Replace('\', '/')) {
    Write-Host "AVISO: O Git foi inicializado em um diretório diferente!" -ForegroundColor Red
    Write-Host "Git top level: $gitTopLevel" -ForegroundColor Red
    Write-Host "Diretório atual: $currentDir" -ForegroundColor Red
}

# 8. Configurar remote
Write-Host "Configurando remote..." -ForegroundColor Yellow
& git remote remove origin -ErrorAction SilentlyContinue
& git remote add origin https://github.com/Egeolabs1/stop-finder-alert.git

# 9. Renomear branch para main
Write-Host "Configurando branch main..." -ForegroundColor Yellow
& git branch -M main

# 10. Adicionar apenas arquivos do projeto (usando paths relativos explícitos)
Write-Host "Adicionando arquivos do projeto..." -ForegroundColor Yellow

# Arquivos na raiz
$filesToAdd = @(
    "package.json",
    "package-lock.json",
    "vercel.json",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "tailwind.config.ts",
    "postcss.config.js",
    "components.json",
    "index.html",
    "README.md",
    "SETUP_GOOGLE_MAPS.md",
    "capacitor.config.ts",
    "eslint.config.js",
    ".gitignore"
)

foreach ($file in $filesToAdd) {
    if (Test-Path $file) {
        & git add $file
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (não encontrado)" -ForegroundColor Yellow
    }
}

# Pastas
if (Test-Path "src") {
    & git add src/
    Write-Host "  ✓ src/" -ForegroundColor Green
}

if (Test-Path "public") {
    & git add public/
    Write-Host "  ✓ public/" -ForegroundColor Green
}

# 11. Verificar status
Write-Host "`nVerificando arquivos adicionados..." -ForegroundColor Cyan
$status = & git status --short
$fileCount = ($status | Measure-Object -Line).Lines
Write-Host "Total de arquivos: $fileCount" -ForegroundColor Cyan

if ($fileCount -eq 0) {
    Write-Host "ERRO: Nenhum arquivo foi adicionado!" -ForegroundColor Red
    Write-Host "Verifique se os arquivos existem no diretório atual." -ForegroundColor Yellow
    exit 1
}

# 12. Fazer commit
Write-Host "`nFazendo commit..." -ForegroundColor Yellow
& git commit -m "feat: adicionar sistema multilíngue, configuração do Vercel e todas as funcionalidades"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao fazer commit" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Commit realizado com sucesso" -ForegroundColor Green

# 13. Verificar se há commits no GitHub
Write-Host "`nVerificando repositório remoto..." -ForegroundColor Yellow
$remoteExists = & git ls-remote --heads origin main 2>&1

if ($remoteExists -and $remoteExists -notmatch "error") {
    Write-Host "Repositório remoto existe. Fazendo pull..." -ForegroundColor Yellow
    & git pull origin main --allow-unrelated-histories --no-edit
}

# 14. Fazer push
Write-Host "`nFazendo push para o GitHub..." -ForegroundColor Yellow
& git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓✓✓ SUCESSO! Arquivos enviados para o GitHub! ✓✓✓" -ForegroundColor Green
    Write-Host "O Vercel deve detectar automaticamente e fazer um novo deploy." -ForegroundColor Green
} else {
    Write-Host "`n✗ Erro ao fazer push. Verifique as mensagens acima." -ForegroundColor Red
    Write-Host "Possíveis causas:" -ForegroundColor Yellow
    Write-Host "  - Problemas de autenticação" -ForegroundColor Yellow
    Write-Host "  - Conflitos com o repositório remoto" -ForegroundColor Yellow
}

# Execute este script NO TERMINAL DO CURSOR (no diretório do projeto)

Write-Host "=== Correção do Repositório Git ===" -ForegroundColor Cyan

# 1. Verificar diretório atual
$currentDir = Get-Location
Write-Host "Diretório atual: $currentDir" -ForegroundColor Yellow

# 2. Verificar se package.json existe
if (-not (Test-Path "package.json")) {
    Write-Host "ERRO: package.json não encontrado!" -ForegroundColor Red
    Write-Host "Certifique-se de estar no diretório do projeto:" -ForegroundColor Yellow
    Write-Host "C:\Users\newto\OneDrive\Área de Trabalho\Cursor\Sonecaz 2" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ package.json encontrado" -ForegroundColor Green

# 3. Remover variáveis de ambiente do Git que podem estar causando problemas
$env:GIT_DIR = $null
$env:GIT_WORK_TREE = $null
$env:GIT_COMMON_DIR = $null

# 4. Remover .git do diretório home (se existir e estiver causando problemas)
$homeGit = "C:\Users\newto\.git"
if (Test-Path $homeGit) {
    Write-Host "Removendo .git incorreto do diretório home..." -ForegroundColor Yellow
    try {
        Remove-Item -Path $homeGit -Recurse -Force -ErrorAction Stop
        Write-Host "✓ .git do diretório home removido" -ForegroundColor Green
    } catch {
        Write-Host "Aviso: Não foi possível remover .git do diretório home: $_" -ForegroundColor Yellow
    }
}

# 5. Remover .git do diretório do projeto (se existir)
if (Test-Path ".git") {
    Write-Host "Removendo .git existente do projeto..." -ForegroundColor Yellow
    Remove-Item -Path ".git" -Recurse -Force -ErrorAction SilentlyContinue
}

# 6. Inicializar Git no diretório atual (garantir que está no projeto)
Write-Host "Inicializando repositório Git..." -ForegroundColor Yellow
& git init
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao inicializar Git" -ForegroundColor Red
    exit 1
}

# 7. Verificar onde o Git foi inicializado
$gitDir = & git rev-parse --git-dir 2>&1
$gitTopLevel = & git rev-parse --show-toplevel 2>&1
Write-Host "Diretório Git: $gitTopLevel" -ForegroundColor Cyan

if ($gitTopLevel -ne $currentDir.ToString().Replace('\', '/')) {
    Write-Host "AVISO: O Git foi inicializado em um diretório diferente!" -ForegroundColor Red
    Write-Host "Git top level: $gitTopLevel" -ForegroundColor Red
    Write-Host "Diretório atual: $currentDir" -ForegroundColor Red
}

# 8. Configurar remote
Write-Host "Configurando remote..." -ForegroundColor Yellow
& git remote remove origin -ErrorAction SilentlyContinue
& git remote add origin https://github.com/Egeolabs1/stop-finder-alert.git

# 9. Renomear branch para main
Write-Host "Configurando branch main..." -ForegroundColor Yellow
& git branch -M main

# 10. Adicionar apenas arquivos do projeto (usando paths relativos explícitos)
Write-Host "Adicionando arquivos do projeto..." -ForegroundColor Yellow

# Arquivos na raiz
$filesToAdd = @(
    "package.json",
    "package-lock.json",
    "vercel.json",
    "vite.config.ts",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "tailwind.config.ts",
    "postcss.config.js",
    "components.json",
    "index.html",
    "README.md",
    "SETUP_GOOGLE_MAPS.md",
    "capacitor.config.ts",
    "eslint.config.js",
    ".gitignore"
)

foreach ($file in $filesToAdd) {
    if (Test-Path $file) {
        & git add $file
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (não encontrado)" -ForegroundColor Yellow
    }
}

# Pastas
if (Test-Path "src") {
    & git add src/
    Write-Host "  ✓ src/" -ForegroundColor Green
}

if (Test-Path "public") {
    & git add public/
    Write-Host "  ✓ public/" -ForegroundColor Green
}

# 11. Verificar status
Write-Host "`nVerificando arquivos adicionados..." -ForegroundColor Cyan
$status = & git status --short
$fileCount = ($status | Measure-Object -Line).Lines
Write-Host "Total de arquivos: $fileCount" -ForegroundColor Cyan

if ($fileCount -eq 0) {
    Write-Host "ERRO: Nenhum arquivo foi adicionado!" -ForegroundColor Red
    Write-Host "Verifique se os arquivos existem no diretório atual." -ForegroundColor Yellow
    exit 1
}

# 12. Fazer commit
Write-Host "`nFazendo commit..." -ForegroundColor Yellow
& git commit -m "feat: adicionar sistema multilíngue, configuração do Vercel e todas as funcionalidades"

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao fazer commit" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Commit realizado com sucesso" -ForegroundColor Green

# 13. Verificar se há commits no GitHub
Write-Host "`nVerificando repositório remoto..." -ForegroundColor Yellow
$remoteExists = & git ls-remote --heads origin main 2>&1

if ($remoteExists -and $remoteExists -notmatch "error") {
    Write-Host "Repositório remoto existe. Fazendo pull..." -ForegroundColor Yellow
    & git pull origin main --allow-unrelated-histories --no-edit
}

# 14. Fazer push
Write-Host "`nFazendo push para o GitHub..." -ForegroundColor Yellow
& git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓✓✓ SUCESSO! Arquivos enviados para o GitHub! ✓✓✓" -ForegroundColor Green
    Write-Host "O Vercel deve detectar automaticamente e fazer um novo deploy." -ForegroundColor Green
} else {
    Write-Host "`n✗ Erro ao fazer push. Verifique as mensagens acima." -ForegroundColor Red
    Write-Host "Possíveis causas:" -ForegroundColor Yellow
    Write-Host "  - Problemas de autenticação" -ForegroundColor Yellow
    Write-Host "  - Conflitos com o repositório remoto" -ForegroundColor Yellow
}





