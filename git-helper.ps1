# Script auxiliar para comandos Git
# Uso: .\git-helper.ps1 <comando-git>
# Exemplo: .\git-helper.ps1 "status"
# Exemplo: .\git-helper.ps1 "add ."
# Exemplo: .\git-helper.ps1 "commit -m 'mensagem'"
# Exemplo: .\git-helper.ps1 "push origin main"

param(
    [Parameter(Mandatory=$true)]
    [string]$GitCommand
)

# Encontrar o diretório do projeto
$projectPath = Get-ChildItem "C:\Users\newto\OneDrive" | 
    Where-Object {$_.Name -match 'rea'} | 
    Select-Object -First 1 | 
    ForEach-Object { Join-Path $_.FullName "Cursor\Sonecaz 2" }

if (-not (Test-Path $projectPath)) {
    Write-Error "Projeto não encontrado!"
    exit 1
}

Write-Host "Executando: git $GitCommand" -ForegroundColor Cyan
Write-Host "No diretório: $projectPath" -ForegroundColor Gray
Write-Host ""

# Executar comando git
$output = git -C $projectPath $GitCommand.Split(' ') 2>&1

# Mostrar apenas a saída relevante do git (filtrar avisos do PowerShell)
$output | Where-Object { $_ -notmatch 'Set-Location' -and $_ -notmatch 'CategoryInfo' -and $_ -notmatch 'FullyQualifiedErrorId' } | ForEach-Object {
    Write-Host $_
}

# Retornar código de saída do git
exit $LASTEXITCODE

