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

| Pasta           | O quê                                                                             |
| --------------- | --------------------------------------------------------------------------------- |
| `apps/api`      | API REST em Node 24 + Express 5 + TypeScript. Documentação em `/api/docs`.        |
| `apps/mobile`   | App Expo (Expo Router). O PWA sai de `npm run exportar:web -w @saude/mobile`.     |
| `infra`         | Regras e índices do Firestore e o seed (cadastros base e contas de demonstração). |
| `api`           | Função serverless da Vercel que monta a API de `apps/api`.                        |
| `design-system` | Fonte do tema, das regras de acessibilidade e do glossário de linguagem.          |
| `docs/adr`      | Decisões de arquitetura.                                                          |

## Como rodar

Pré-requisitos: Node 24 (`nvm use`), Java 21+ (para o emulador do Firestore).

```bash
npm install
cp .env.example .env               # variáveis da API
cp .env.example apps/mobile/.env   # o Expo lê as EXPO_PUBLIC_* desta pasta

npm run emuladores   # Firebase Auth + Firestore locais (UI em http://localhost:4000)
npm run dev:api      # API em http://localhost:3333 — /health e /api/docs
npm run dev:mobile   # app Expo (w abre o PWA no navegador)
```

### Seed: primeira conta administrativa e cadastros base

Nenhuma tela cria contas de equipe: a primeira conta `administrativo` sai do seed.
O seed também cria os cadastros base **fictícios** do polo médico do Recife: as
13 especialidades com ícone no design system, 4 unidades (Ilha do Leite, Derby,
Boa Vista e Paissandu) e 8 médicos. Nomes de instituições e de profissionais são
inventados.

```bash
npm run seed -- --emulador   # no emulador, com dados fictícios
npm run seed                 # no projeto real: defina ADMIN_NOME, ADMIN_EMAIL, ADMIN_CPF (e opcionalmente ADMIN_SENHA) no .env
npm run seed:admin           # só a conta administrativa
```

Sem `ADMIN_SENHA`, uma senha forte é gerada e mostrada uma única vez. Rodar de
novo não duplica nada.

### Contas de demonstração

O `npm run seed` também cria 3 consultórios por unidade, a agenda semanal dos
8 médicos (seg a sex, 8h–12h e 14h–17h) e **uma conta fictícia por perfil**.
A senha de todas é `SENHA_DEMO` (padrão `SaudePalma@2026`):

| Perfil                                | E-mail                        |
| ------------------------------------- | ----------------------------- |
| Paciente                              | `paciente@saude-palma.test`   |
| Recepcionista (Hospital Aurora)       | `recepcao@saude-palma.test`   |
| Médica (Dra. Helena, Aurora e Lume)   | `medica@saude-palma.test`     |
| Médico (Dr. Henrique, Aurora e Ponte) | `medico@saude-palma.test`     |
| Manutenção (Hospital Aurora)          | `manutencao@saude-palma.test` |
| Administrativo                        | `admin@saude-palma.test`      |

Sem `ADMIN_EMAIL` no `.env`, o seed pula a conta administrativa "real" e a de
demonstração cumpre o papel. Use `npm run seed -- --sem-demo` para não criar as
contas de teste. Em produção com dados reais, desative essas contas.

## Perfis e telas

O app abre na área do perfil de quem entrou (o perfil vem das custom claims,
definidas só pela API):

| Perfil         | O que faz no app                                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Paciente       | Pré-triagem com IA, marcar consulta (especialidade → unidade → médico → dia e hora → revisão), acompanhar a fila, cancelar/trocar até 2 h antes, receitas e exames |
| Recepcionista  | Agenda do dia da unidade, confirmar chegada (só no dia), marcar falta, paciente sem horário (fila direta), pré-cadastro                                            |
| Médico         | Abrir plantão escolhendo o consultório, sala de espera ordenada (RN22), chamar na TV, chamar de novo, atender, concluir com receita/exames/atestado                |
| Manutenção     | Números do dia, equipe (recepcionistas, nova senha, desativar), agenda dos médicos, consultórios, ligar TVs                                                        |
| Administrativo | Tudo da manutenção em qualquer unidade + especialidades, médicos e acesso dos médicos ao app                                                                       |
| Painel de TV   | Sem login: pareado por código de 6 números; mostra e fala o nome e o consultório ([ADR 0024](docs/adr/0024-painel-de-tv-pareamento.md))                            |

## Rotas da API

Contrato completo, com exemplos e códigos de resposta, em `/api/docs`
(`apps/api/openapi.yaml`). Resumo:

| Grupo           | Rotas                                                                                                                                     | Acesso                                   |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Acesso          | `POST /auth/cadastro`, `GET /auth/me`, `PUT /usuarios/me`                                                                                 | público / autenticado                    |
| Cadastros       | `/especialidades`, `/unidades`, `/medicos` (+ `/medicos/{id}/unidades`)                                                                   | leitura pública; escrita administrativo  |
| Agenda          | `GET /medicos/{id}/horarios`, `/medicos/{id}/disponibilidades`, `/bloqueios`, `/unidades/{id}/consultorios`                               | público (horários) / gestão              |
| Chamados        | `POST /chamados`, `GET /chamados/me`, `/chamados/{id}/cancelar`, `/reagendar`, `/documentos/me`                                           | paciente (e recepção em nome dele)       |
| Fila e plantão  | `/chamados/{id}/chegada`, `/falta`, `/chamados/espontaneos`, `/plantoes`, `/plantoes/atual/fila`, `/aceitar`, `/atendimento`, `/concluir` | recepção / médico                        |
| Pré-triagem     | `POST /pretriagens`                                                                                                                       | paciente                                 |
| Gestão          | `/equipe/contas`, `/unidades/{id}/equipe`, `/usuarios/{id}/redefinir-senha`, `/pacientes`, `/indicadores`                                 | manutenção / administrativo (+ recepção) |
| Painel de TV    | `/painel/pareamentos`, `GET /painel/estado` (polling), `GET /painel/eventos` (SSE)                                                        | `X-Device-Token`                         |
| Integrações N8N | `/integracoes/triagem`, `/horarios`, `/agendamentos`, `/pacientes/{telefone}/consultas`                                                   | `X-Api-Key`                              |

DELETE nunca apaga: desativa. Todas as rotas ficam sob `/api/v1`.

## Publicar na Vercel (PWA + API)

Um projeto da Vercel publica o PWA e a API juntos ([ADR 0023](docs/adr/0023-hospedagem-na-vercel.md)).

1. Na Vercel, **Add New → Project**, importe este repositório e deixe a raiz
   (`./`) como diretório. O `vercel.json` já define instalação, build, saída e
   a função `api/index.mjs`.
2. Em **Settings → Environment Variables**, cadastre:
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`
     (a chave com as quebras de linha como `\n`, entre aspas)
   - `NODE_ENV=production`, `TZ_PADRAO=America/Recife`
   - `ANTHROPIC_API_KEY` (pré-triagem com Claude) e, se quiser, `ANTHROPIC_MODEL`
   - `INTEGRACAO_API_KEY` (para o N8N; `openssl rand -base64 32`)
   - `EXPO_PUBLIC_API_URL=/api/v1` e as três `EXPO_PUBLIC_FIREBASE_*` (usadas no build do PWA)
   - `CORS_ORIGINS` só se outro domínio for chamar a API
3. **Deploy.** Teste `https://SEU-PROJETO.vercel.app/health` e `/api/docs`.
4. Publique as regras e os índices do Firestore uma vez: `npm run deploy:firestore`.
5. Rode o seed apontando para o projeto real (com o `.env` preenchido): `npm run seed`.

## Gerar os aplicativos

Os builds nativos usam o **EAS Build** (gratuito com uma conta Expo):

```bash
npm install -g eas-cli
cd apps/mobile
eas login
eas init                                   # cria o projeto na sua conta Expo
# Edite eas.json: EXPO_PUBLIC_API_URL = https://SEU-PROJETO.vercel.app/api/v1
#                 EXPO_PUBLIC_FIREBASE_API_KEY = a Web API key do Firebase
eas build -p android --profile celular     # APK do app (paciente e equipe)
eas build -p android --profile tv          # APK do painel para Android TV
```

Cada build termina com um link para baixar o `.apk`.

- **Celular Android:** abra o link no celular e instale (permita "fontes desconhecidas").
- **TV TCL (Android TV / Google TV):** instale o app **Downloader** na TV,
  abra o link do APK da TV e instale. Ative "Fontes desconhecidas" para o
  Downloader em Configurações → Privacidade/Segurança. O app aparece no launcher
  como "Painel Saúde na Palma" e mostra um código: no celular, entre como
  Manutenção → **TVs** → digite o código.
- **iPhone com Expo Go:** `npm run dev:mobile` no computador e leia o QR code
  com a câmera (o celular precisa estar na mesma rede, ou use `npx expo start --tunnel`).
  Com `EXPO_PUBLIC_API_URL` apontando para a Vercel, o app usa a API publicada.
- **Painel num navegador** (alternativa ao APK): abra `https://SEU-PROJETO.vercel.app/painel`
  em tela cheia e toque uma vez para liberar o som.

## Limitações conhecidas

### Cadastro: janela entre o Firestore e o Firebase Auth (risco aceito)

O cadastro grava, numa única transação do Firestore, o documento
`usuarios/{uid}` e as duas travas de unicidade (`unicidades/cpf_<dígitos>` e
`unicidades/email_<sha256>`). Só depois cria a conta no Firebase Auth, com o
mesmo uid. As duas operações não podem estar numa mesma transação.

Se a criação no Auth **falhar**, a API desfaz o que gravou. Mas se o
**processo cair** entre o commit da transação e a criação no Auth (queda do
servidor, deploy no meio da requisição), sobra um usuário sem conta no Auth e
com o CPF e o e-mail bloqueados pelas travas. A pessoa vê "Já existe uma conta
com esse CPF" e não consegue entrar nem se cadastrar de novo.

A janela é de poucos milissegundos e depende de uma queda exatamente nesse
ponto. Registramos como **risco aceito** para o escopo do projeto.

**Como reconhecer:** existe `usuarios/{uid}`, mas não há conta com esse uid no
Firebase Auth (console → Authentication → procure pelo uid ou e-mail).

**Como recuperar** (uma pessoa administrativa, pelo console do Firebase):

1. Anote o `cpf` e o `email` do documento `usuarios/{uid}`.
2. Confirme que o uid **não** existe no Authentication. Se existir, pare: a
   conta está íntegra.
3. Apague o documento `usuarios/{uid}`.
4. Apague as duas travas em `unicidades`: `cpf_<cpf>` e
   `email_<sha256 do e-mail em minúsculas>`. Confira que o campo `uid` de cada
   trava é o mesmo uid do passo 1 antes de apagar. Para calcular o hash:
   `node -e "console.log(require('crypto').createHash('sha256').update('EMAIL'.trim().toLowerCase()).digest('hex'))"`.
5. Peça para a pessoa fazer o cadastro de novo.

## Qualidade

| Comando                   | O quê                                                       |
| ------------------------- | ----------------------------------------------------------- |
| `npm run lint`            | ESLint em todo o monorepo                                   |
| `npm run formatar:checar` | Prettier                                                    |
| `npm run tipos`           | `tsc --noEmit` em cada workspace                            |
| `npm run test:emulador`   | Testes de unidade e de integração sobre o Firebase Emulator |
| `npm run test:ci`         | O mesmo, com cobertura (mínimo de 60% nos services)         |

O CI (`.github/workflows/ci.yml`) roda tudo isso a cada pull request.
