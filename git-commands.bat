@echo off
REM Script batch para executar comandos git sem erros do PowerShell
REM Uso: git-commands.bat <comando>
REM Exemplos:
REM   git-commands.bat status
REM   git-commands.bat "add ."
REM   git-commands.bat "commit -m \"mensagem\""
REM   git-commands.bat "push origin main"

cd /d "%~dp0"

if "%~1"=="" (
    echo Uso: git-commands.bat ^<comando^>
    echo Exemplos:
    echo   git-commands.bat status
    echo   git-commands.bat "add ."
    echo   git-commands.bat "commit -m \"mensagem\""
    echo   git-commands.bat "push origin main"
    exit /b 1
)

echo.
echo Executando: git %*
echo.

git %*

