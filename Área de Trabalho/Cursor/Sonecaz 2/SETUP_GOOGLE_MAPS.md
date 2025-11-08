# Configuração do Google Maps

Este projeto usa o Google Maps para exibir mapas interativos. Siga os passos abaixo para configurar:

## 1. Obter Chave de API

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. Vá para "APIs & Services" > "Library"
4. Habilite as seguintes APIs (clique em "Enable" para cada uma):
   - **Maps JavaScript API** (para exibir o mapa)
   - **Places API** (para busca de endereços com autocomplete)
   - **Geocoding API** (para conversão de endereços em coordenadas)
5. Vá para "APIs & Services" > "Credentials"
6. Clique em "Create Credentials" > "API Key"
7. Copie a chave gerada

## 2. Configurar no Projeto

1. Crie um arquivo `.env` na raiz do projeto
2. Adicione a seguinte linha:
   ```
   VITE_GOOGLE_MAPS_API_KEY=sua_chave_aqui
   ```
3. Substitua `sua_chave_aqui` pela chave que você copiou

## 3. Restrições de API (Recomendado)

Para segurança, configure restrições na sua chave de API:

1. No Google Cloud Console, vá para "APIs & Services" > "Credentials"
2. Clique na sua chave de API
3. Em "API restrictions", selecione "Restrict key"
4. Selecione "Maps JavaScript API"
5. Em "Website restrictions", adicione os domínios onde o app será usado
6. Salve as alterações

## 4. Reiniciar o Servidor

Após configurar a chave, reinicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Solução de Problemas

- **Erro "Erro ao carregar o mapa"**: Verifique se a chave de API está correta e se a Maps JavaScript API está habilitada
- **Mapa não aparece**: Verifique o console do navegador para mensagens de erro
- **Chave inválida**: Certifique-se de que a chave está no formato correto e sem espaços

## Limites e Custos

O Google Maps oferece um crédito mensal gratuito. Consulte a [página de preços](https://developers.google.com/maps/billing-and-pricing/pricing) para mais informações.

