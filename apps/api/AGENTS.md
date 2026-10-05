# AGENTS.md — apps/api

Complementa o `AGENTS.md` da raiz. Vale para tudo em `apps/api`.

## Convenções da API

- Base `/api/v1`; recursos no plural em português; JSON em camelCase; datas ISO 8601 com `-03:00` (gravadas em UTC, fuso America/Recife).
- Auth: `Authorization: Bearer <ID token>` para pessoas; `X-Device-Token` em `/painel/*`; `X-Api-Key` em `/integracoes/*`.
- Erro padrão: `{"erro": {"codigo", "mensagem", "detalhes", "requestId"}}`.
- Status e códigos: 400 `DADOS_INVALIDOS` · 401 · 403 (`ACESSO_NEGADO`, `FORA_DA_UNIDADE`) · 404 · 409 (`HORARIO_INDISPONIVEL`, `CHAMADO_JA_ACEITO`, `PLANTAO_JA_ATIVO`) · 422 (`SEM_PLANTAO_ATIVO`, `CHEGADA_FORA_DO_PRAZO`, `MEDICO_NAO_CADASTRADO`) · 429 · 500 · 503 `IA_INDISPONIVEL`.

## Camadas

Ordem fixa: middlewares (helmet, cors, rate limit, `autenticar`, `autenticarDispositivo`, `autenticarIntegracao`, `exigirPerfil`, `exigirUnidade`, `validar` com Zod) → routes → controllers → services → repositories.

- Services contêm regras e transações, sem HTTP. Repositories falam com o Firestore. Controllers só traduzem HTTP e usam try/catch → `next(erro)`.
- Integrações isoladas: `GeminiClient` (atrás de `ProvedorIA`), `ExpoPushClient`, `PdfGenerator` (PDFKit), `PainelEventBus`.
- O Firestore só é acessado aqui, via Admin SDK.

## Checklist para toda rota nova

1. Atualizar `openapi.yaml` com os códigos de resposta possíveis.
2. Entregar um payload JSON de exemplo (para Postman/Insomnia).
3. Se a rota lê ou escreve dado de unidade: usar `exigirUnidade` e escrever um teste 403 cruzando unidades.
4. Validar entrada com Zod; erros via `AppError`.
5. Testes com Vitest/Supertest e o emulador (`npm run test:emulador` na raiz).
6. Se houver concorrência (agendar, aceitar): transação com documento-trava e teste de requisições simultâneas.

## Variáveis de ambiente

Qualquer variável nova entra no `.env.example` da raiz. Nunca commitar `.env`.
