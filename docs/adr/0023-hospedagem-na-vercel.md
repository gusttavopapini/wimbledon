# ADR 0023 — API e PWA na Vercel

- **Status:** aceita
- **Data:** 2026-11-22
- **Substitui:** API no Render Free e PWA no Firebase Hosting (DAES v2.0, seção Hospedagem)

## Contexto

O Render Free hiberna após 15 minutos e a primeira requisição demora até 1
minuto, o que atrapalha a demonstração. A equipe quer um só lugar para publicar.

## Decisão

- Um projeto na Vercel publica o **PWA** (`apps/mobile/dist`, gerado por
  `expo export -p web`) e a **API** como função serverless (`api/index.mjs`,
  que monta o mesmo `criarApp` de `apps/api`).
- `vercel.json` reescreve `/api/*` e `/health` para a função e o resto para o
  `index.html`. O PWA chama a API no mesmo domínio (`EXPO_PUBLIC_API_URL=/api/v1`):
  sem CORS.
- O banco continua no Firestore, só pela API (ADR 0001).
- **Painel de TV:** função serverless não segura conexão longa. O SSE em
  `/painel/eventos` existe (ADR-013 do DAES), mas fecha em ~50 s e o
  `EventSource` reconecta; o app da TV usa o **polling** de `/painel/estado` a
  cada 3 s, que é o fallback previsto no ADR-013.

## Consequências

- Sem hibernação; o cold start é de poucos segundos.
- O rate limit em memória vale por instância da função (limite aproximado).
- O `render.yaml` fica no repositório como alternativa, mas deixa de ser o
  caminho oficial. O DAES precisa ser atualizado na seção de hospedagem.
