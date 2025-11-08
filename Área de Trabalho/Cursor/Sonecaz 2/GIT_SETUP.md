# Configuração do Git para Push

## Passo 1: Adicionar arquivos ao Git

```bash
git add .
```

## Passo 2: Fazer o primeiro commit

```bash
git commit -m "Initial commit: Sonecaz app with Google Maps integration"
```

## Passo 3: Configurar repositório remoto

### Opção A: GitHub (Recomendado)

1. Crie um repositório no GitHub (https://github.com/new)
2. Copie a URL do repositório (ex: `https://github.com/seu-usuario/sonecaz.git`)
3. Execute:

```bash
git remote add origin https://github.com/seu-usuario/sonecaz.git
```

### Opção B: GitLab

```bash
git remote add origin https://gitlab.com/seu-usuario/sonecaz.git
```

### Opção C: Outro serviço

```bash
git remote add origin <URL_DO_SEU_REPOSITORIO>
```

## Passo 4: Verificar repositório remoto

```bash
git remote -v
```

## Passo 5: Fazer o push

```bash
git push -u origin master
```

Ou se você estiver usando a branch `main`:

```bash
git branch -M main
git push -u origin main
```

## Comandos úteis

- Ver status: `git status`
- Ver remotos: `git remote -v`
- Adicionar arquivos: `git add .`
- Fazer commit: `git commit -m "mensagem"`
- Fazer push: `git push`



