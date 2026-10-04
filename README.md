# Saúde na Palma da Mão

Pré-triagem com IA, agendamento e gestão de fila presencial para hospitais e
clínicas do polo médico do Recife. Projeto Integrador de Análise e
Desenvolvimento de Sistemas — Faculdade Senac PE, unidade curricular
Client-Server.

## Arquitetura

```
app React Native / PWA / painel de TV / N8N
        │  HTTPS + ID token do Firebase Auth
        ▼
API REST (Express 5)  routes → middlewares → controllers → services → repositories
        │  Firebase Admin SDK
        ▼
Cloud Firestore   (regras: nega todo acesso de cliente)
```

**Nenhum cliente acessa o banco.** Ver [ADR 0001](docs/adr/0001-api-unico-acesso-ao-banco.md).

| Pasta           | O quê                                                                         |
| --------------- | ----------------------------------------------------------------------------- |
| `apps/api`      | API REST em Node 24 + Express 5 + TypeScript. Documentação em `/api/docs`.    |
| `apps/mobile`   | App Expo (Expo Router). O PWA sai de `npm run exportar:web -w @saude/mobile`. |
| `infra`         | Regras e índices do Firestore, seed da primeira conta administrativa.         |
| `design-system` | Fonte do tema, das regras de acessibilidade e do glossário de linguagem.      |
| `docs/adr`      | Decisões de arquitetura.                                                      |

## Como rodar

Pré-requisitos: Node 24 (`nvm use`), Java 21+ (para o emulador do Firestore).

```bash
npm install
cp .env.example .env               # variáveis da API
cp .env.example apps/mobile/.env   # o Expo lê as EXPO_PUBLIC_* desta pasta

npm run emuladores   # Firebase Auth + Firestore locais (UI em http://localhost:4000)
npm run dev:api      # API em http://localhost:3333 — /health e /api/docs
npm run dev:mobile   # app Expo
```

Para desenvolver só com os emuladores, descomente `FIRESTORE_EMULATOR_HOST` e
`FIREBASE_AUTH_EMULATOR_HOST` no `.env` e use `FIREBASE_PROJECT_ID=demo-saude-palma`.

**Credenciais:** o JSON da conta de serviço nunca entra no repositório
(o `.gitignore` bloqueia). Copie só `client_email` e `private_key` para o `.env`.

## Qualidade

| Comando                   | O quê                                                       |
| ------------------------- | ----------------------------------------------------------- |
| `npm run lint`            | ESLint em todo o monorepo                                   |
| `npm run formatar:checar` | Prettier                                                    |
| `npm run tipos`           | `tsc --noEmit` em cada workspace                            |
| `npm run test:emulador`   | Testes de unidade e de integração sobre o Firebase Emulator |
| `npm run test:ci`         | O mesmo, com cobertura (mínimo de 60% nos services)         |

O CI (`.github/workflows/ci.yml`) roda tudo isso a cada pull request.
