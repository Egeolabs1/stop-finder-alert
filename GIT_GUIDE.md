# Guia de Uso do Git - Sonecaz 2

## ⚠️ Problemas Comuns Resolvidos

Este guia documenta as soluções para os erros repetitivos do Git.

## ✅ Configurações Aplicadas

### 1. Configuração de Line Endings
- `core.autocrlf = true`: Converte automaticamente CRLF ↔ LF
- `core.safecrlf = false`: Desabilita avisos de conversão de line endings
- Arquivo `.gitattributes` criado para definir comportamento consistente

### 2. Aliases Criados
- `git st` → `git status`
- `git cm "mensagem"` → `git commit -m "mensagem"`
- `git ps` → `git push origin main`
- `git pl` → `git pull origin main`

## 🚀 Como Usar o Git (3 Métodos)

### Método 1: Script Batch (Recomendado - Sem Erros!)
```batch
# Ver status
git-commands.bat status

# Adicionar arquivos
git-commands.bat "add ."

# Fazer commit
git-commands.bat "commit -m \"sua mensagem aqui\""

# Fazer push
git-commands.bat "push origin main"
```

### Método 2: PowerShell Helper
```powershell
# Ver status
.\git-helper.ps1 "status"

# Adicionar arquivos
.\git-helper.ps1 "add ."

# Fazer commit
.\git-helper.ps1 "commit -m 'sua mensagem aqui'"

# Fazer push
.\git-helper.ps1 "push origin main"
```

### Método 3: Git Direto (via Terminal Cursor)
Abra o terminal integrado do Cursor e use os comandos normalmente:
```bash
git status
git add .
git commit -m "sua mensagem"
git push origin main
```

## 📝 Fluxo de Trabalho Padrão

### Atualização Simples
```batch
git-commands.bat "add ."
git-commands.bat "commit -m \"descrição das alterações\""
git-commands.bat "push origin main"
```

### Com Verificação de Status
```batch
# 1. Ver o que foi modificado
git-commands.bat status

# 2. Adicionar arquivos
git-commands.bat "add ."

# 3. Verificar o que será commitado
git-commands.bat status

# 4. Fazer commit
git-commands.bat "commit -m \"feat: descrição da funcionalidade\""

# 5. Enviar para GitHub
git-commands.bat "push origin main"
```

## 🔄 Sincronização com GitHub

### Pull (Baixar alterações)
```batch
git-commands.bat "pull origin main"
```

### Push (Enviar alterações)
```batch
git-commands.bat "push origin main"
```

### Push Forçado (usar com cuidado!)
```batch
git-commands.bat "push --force origin main"
```

## ❌ Resolver Conflitos

Se houver conflitos ao fazer pull:

1. Abortar merge/rebase atual:
```batch
git-commands.bat "merge --abort"
# ou
git-commands.bat "rebase --abort"
```

2. Fazer backup das alterações locais:
```batch
git-commands.bat "stash"
```

3. Baixar alterações remotas:
```batch
git-commands.bat "pull origin main"
```

4. Aplicar alterações locais de volta:
```batch
git-commands.bat "stash pop"
```

## 📋 Comandos Úteis

### Ver histórico de commits
```batch
git-commands.bat "log --oneline -10"
```

### Ver diferenças
```batch
git-commands.bat diff
```

### Desfazer último commit (mantendo alterações)
```batch
git-commands.bat "reset --soft HEAD~1"
```

### Descartar todas as alterações locais
```batch
git-commands.bat "reset --hard HEAD"
```

### Ver branch atual e remotos
```batch
git-commands.bat branch -a
```

## 🎯 Convenções de Commit

Use prefixos para organizar commits:
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação de código
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Manutenção

Exemplo:
```batch
git-commands.bat "commit -m \"feat: adicionar seleção de sons de alarme\""
```

## 🔧 Solução de Problemas

### Erro: "Set-Location não encontrado"
**Solução**: Use o script `git-commands.bat` em vez de comandos PowerShell diretos.

### Avisos de CRLF/LF
**Solução**: Já configurado! O `.gitattributes` resolve isso automaticamente.

### Conflitos de merge repetidos
**Solução**: Use push forçado se você tem certeza que suas alterações locais são as corretas:
```batch
git-commands.bat "push --force origin main"
```

### Repositório "desincronizado"
**Solução**: Reset para o estado remoto:
```batch
git-commands.bat "fetch origin"
git-commands.bat "reset --hard origin/main"
```

## 📱 Repositório Remoto

- **URL**: https://github.com/Egeolabs1/stop-finder-alert.git
- **Branch principal**: main
- **Owner**: Egeolabs1

## 💡 Dicas

1. **Sempre verifique o status antes de commitar**
   ```batch
   git-commands.bat status
   ```

2. **Faça commits pequenos e frequentes**
   - Mais fácil de reverter se necessário
   - Histórico mais claro

3. **Use mensagens descritivas**
   - Não: "atualização"
   - Sim: "feat: adicionar validação de email no formulário de login"

4. **Faça pull antes de push**
   ```batch
   git-commands.bat "pull origin main"
   git-commands.bat "push origin main"
   ```

5. **Use o terminal integrado do Cursor**
   - Ctrl + ` abre/fecha o terminal
   - Já está no diretório correto
   - Sem problemas de encoding

## 🆘 Suporte

Se encontrar problemas:
1. Verifique este guia
2. Use `git-commands.bat status` para ver o estado
3. Em caso de dúvida, faça backup antes de qualquer comando destrutivo

