# 🔄 Como Forçar Atualização do Service Worker

## ⚠️ Problema

O erro `chrome-extension` ainda aparece porque o navegador está usando a **versão antiga** do service worker em cache.

## ✅ Solução: Forçar Atualização

### Método 1: DevTools (RECOMENDADO)

1. **Abra o DevTools** (F12)
2. Vá na aba **Application** (ou **Aplicativo**)
3. No menu lateral, clique em **Service Workers**
4. Você verá o service worker registrado
5. Clique em **Unregister** (Desregistrar) ou **Update** (Atualizar)
6. **Recarregue a página** (F5 ou Ctrl+R)

### Método 2: Limpar Cache e Recarregar

1. **Abra o DevTools** (F12)
2. Clique com botão direito no botão de **Recarregar** (ao lado da barra de endereço)
3. Selecione **"Limpar cache e recarregar forçado"** (ou **"Empty Cache and Hard Reload"**)

### Método 3: Limpar Cache Manualmente

1. **Chrome/Edge:**
   - Pressione `Ctrl + Shift + Delete`
   - Selecione "Imagens e arquivos em cache"
   - Marque "Desde sempre"
   - Clique em "Limpar dados"

2. **Recarregue a página** com `Ctrl + Shift + R`

### Método 4: Modo Anônimo

1. Abra uma **janela anônima** (`Ctrl + Shift + N`)
2. Acesse o site
3. O service worker será registrado com a versão nova

## 🔍 Verificar se Funcionou

Após atualizar:

1. Abra o **Console** (F12)
2. Procure por mensagens do Service Worker:
   - ✅ `[Service Worker] Installing...`
   - ✅ `[Service Worker] Activating...`
   - ✅ Versão do cache: `sonecaz-v2` (não mais v1)

3. **Não deve mais aparecer** o erro:
   - ❌ `Failed to execute 'put' on 'Cache': Request scheme 'chrome-extension' is unsupported`

## 📝 O Que Foi Corrigido

### Versão v2 do Service Worker:

1. ✅ **Verificação no início** - Ignora requisições de extensões antes de processar
2. ✅ **Try-catch robusto** - Captura erros de cache silenciosamente
3. ✅ **Verificação de protocolo** - Só tenta cachear http/https
4. ✅ **Versão atualizada** - Força atualização do cache antigo

### Código Adicionado:

```javascript
// Ignorar completamente requisições de extensões
const unsupportedSchemes = ['chrome-extension:', 'moz-extension:', ...];
if (unsupportedSchemes.some(scheme => url.protocol.startsWith(scheme))) {
  return; // Não processar
}
```

## 🚀 Após Atualizar

O service worker agora:
- ✅ Ignora requisições de extensões do navegador
- ✅ Não tenta fazer cache de esquemas não suportados
- ✅ Loga warnings ao invés de erros
- ✅ Funciona normalmente com http/https

## ⚡ Solução Rápida

**Mais rápido:** 
1. F12 → Application → Service Workers
2. Clique em **Unregister**
3. Recarregue a página (F5)

**Pronto!** O service worker será registrado novamente com a versão corrigida.

---

**💡 Dica:** Se o erro persistir, feche todas as abas do site e abra novamente.

