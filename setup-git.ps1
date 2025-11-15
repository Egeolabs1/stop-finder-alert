# Script para configurar Git no diretório correto do projeto
# Execute este script no PowerShell

# Definir o diretório do projeto
$projectPath = "C:\Users\newto\OneDrive\Área de Trabalho\Cursor\Sonecaz 2"

# Verificar se o diretório existe
if (-not (Test-Path $projectPath)) {
    Write-Host "Erro: Diretório do projeto não encontrado: $projectPath" -ForegroundColor Red
    Write-Host "Por favor, verifique o caminho do projeto." -ForegroundColor Yellow
    exit 1
}

# Navegar para o diretório do projeto
Set-Location $projectPath
Write-Host "Diretório atual: $(Get-Location)" -ForegroundColor Green

# Verificar se package.json existe
if (-not (Test-Path "package.json")) {
    Write-Host "Erro: package.json não encontrado no diretório do projeto!" -ForegroundColor Red
    exit 1
}

Write-Host "✓ package.json encontrado" -ForegroundColor Green

# Remover .git do diretório home (se existir)
$homeGit = "C:\Users\newto\.git"
if (Test-Path $homeGit) {
    Write-Host "Removendo .git do diretório home..." -ForegroundColor Yellow
    Remove-Item -Path $homeGit -Recurse -Force -ErrorAction SilentlyContinue
}

# Remover .git do diretório do projeto (se existir)
if (Test-Path ".git") {
    Write-Host "Removendo .git existente do projeto..." -ForegroundColor Yellow
    Remove-Item -Path ".git" -Recurse -Force -ErrorAction SilentlyContinue
}

# Inicializar Git
Write-Host "Inicializando repositório Git..." -ForegroundColor Yellow
git init

# Configurar remote
Write-Host "Configurando remote..." -ForegroundColor Yellow
git remote remove origin -ErrorAction SilentlyContinue
git remote add origin https://github.com/Egeolabs1/stop-finder-alert.git

# Renomear branch para main
Write-Host "Configurando branch main..." -ForegroundColor Yellow
git branch -M main

# Adicionar arquivos do projeto
Write-Host "Adicionando arquivos do projeto..." -ForegroundColor Yellow
git add package.json package-lock.json vercel.json vite.config.ts
git add tsconfig.json tsconfig.app.json tsconfig.node.json
git add tailwind.config.ts postcss.config.js components.json
git add index.html README.md SETUP_GOOGLE_MAPS.md
git add capacitor.config.ts eslint.config.js .gitignore
git add src/ public/

# Verificar status
Write-Host "`nArquivos adicionados:" -ForegroundColor Cyan
git status --short

# Fazer commit
Write-Host "`nFazendo commit..." -ForegroundColor Yellow
git commit -m "feat: adicionar sistema multilíngue, configuração do Vercel e todas as funcionalidades"

# Verificar se há commits no GitHub
Write-Host "`nVerificando repositório remoto..." -ForegroundColor Yellow
$remoteExists = git ls-remote --heads origin main 2>&1

if ($LASTEXITCODE -eq 0 -and $remoteExists) {
    Write-Host "Repositório remoto existe. Fazendo pull..." -ForegroundColor Yellow
    git pull origin main --allow-unrelated-histories --no-edit
}

# Fazer push
Write-Host "`nFazendo push para o GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Sucesso! Arquivos enviados para o GitHub." -ForegroundColor Green
    Write-Host "O Vercel deve detectar automaticamente e fazer um novo deploy." -ForegroundColor Green
} else {
    Write-Host "`n✗ Erro ao fazer push. Verifique as mensagens acima." -ForegroundColor Red
}



