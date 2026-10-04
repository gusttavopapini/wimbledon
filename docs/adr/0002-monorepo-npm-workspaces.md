# ADR 0002 — Monorepo com npm workspaces

- **Status:** aceita
- **Data:** 2026-10-04

## Contexto

API e app são entregues juntos, pelo mesmo grupo, e precisam de lint,
formatação, versão de TypeScript e CI iguais.

## Decisão

- Um repositório, com `apps/api` (`@saude/api`) e `apps/mobile` (`@saude/mobile`)
  como workspaces do npm. Sem Turborepo, Nx ou pnpm: o npm já resolve.
- Configuração compartilhada na raiz: `tsconfig.base.json` (estrito, com
  `noUncheckedIndexedAccess`), `eslint.config.mjs`, `.prettierrc.json`.
- TypeScript 6.0. O 7.0 (compilador nativo) ainda não é suportado pelo
  `typescript-eslint`, que aceita até `<6.1`.
- Node 24 LTS (`.nvmrc`), usado também no CI.
- O app nunca importa código da API (regra do ESLint). Os dois conversam só
  por HTTP; o contrato é o `apps/api/openapi.yaml`.
- Testes de integração usam o projeto `demo-saude-palma` no Firebase Emulator
  Suite. Projetos `demo-` não aceitam credenciais reais, então nenhum teste
  alcança o projeto de produção.

## Consequências

- Um `npm ci` na raiz instala tudo; o CI roda lint, tipos e testes de uma vez.
- Se o app e a API precisarem compartilhar esquemas Zod no futuro, cria-se um
  workspace `packages/` — e um ADR novo.
