# ADR 0001 — A API é o único caminho até o banco

- **Status:** aceita
- **Data:** 2026-10-04

## Contexto

O projeto é avaliado na unidade curricular Client-Server. Vários clientes vão
consumir os mesmos dados: o app React Native, o PWA, o painel de TV da recepção
e automações no N8N. O Firebase permite que clientes leiam e escrevam no
Firestore direto, protegidos só por regras de segurança. Isso espalharia regra
de negócio pelos clientes e quebraria a separação cliente → servidor.

## Decisão

- O fluxo é sempre **cliente → API REST → backend (services) → banco**.
- O Cloud Firestore (projeto `wimbledon-90871`, região `southamerica-east1`,
  plano Spark) é acessado **somente** pela API, com o Firebase Admin SDK.
- `infra/firestore.rules` nega tudo (`allow read, write: if false` em
  `/{document=**}`) desde o primeiro commit e não muda. O Admin SDK ignora as
  regras; qualquer outro SDK é recusado.
- No app e no PWA, o Firebase JS SDK serve **só** para o login (`firebase/auth`).
  O ID token vai no cabeçalho `Authorization` de cada chamada à API.
- O perfil da pessoa fica em custom claims, definidas só pela API.
- Regras de negócio ficam nos services do backend, nunca no cliente.

## Como isso é garantido

- **ESLint** (`eslint.config.mjs`): `no-restricted-imports` bloqueia
  `firebase/firestore`, `firebase/database`, `firebase/storage` e
  `firebase-admin` em `apps/mobile`.
- **Teste de integração** (`apps/api/tests/integracao/regras-firestore.test.ts`):
  age como cliente no emulador, sem login, como paciente e como administrativo,
  e confirma que toda leitura e escrita é negada.
- **CI**: um passo falha se `firestore.rules` deixar de negar acesso.

## Consequências

- Toda tela depende da API estar no ar; o app trata "sem conexão" com a
  mensagem do glossário e o botão "Tentar de novo".
- Sem Cloud Functions (plano Spark): tudo que seria gatilho do Firestore vira
  código na API ou automação no N8N chamando a API.
- Não há atualização em tempo real via `onSnapshot`. Quando a fila precisar
  disso (segunda entrega), a decisão será registrada em outro ADR.
