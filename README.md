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

### Rotas

| Método            | Rota                                                        | Acesso                                                  |
| ----------------- | ----------------------------------------------------------- | ------------------------------------------------------- |
| GET               | `/health`                                                   | público                                                 |
| POST              | `/api/v1/auth/cadastro`                                     | público (10 por IP a cada 15 min)                       |
| GET               | `/api/v1/auth/me`                                           | autenticado                                             |
| PUT               | `/api/v1/usuarios/me`                                       | autenticado                                             |
| GET               | `/api/v1/especialidades`, `/{id}`                           | público                                                 |
| POST, PUT, DELETE | `/api/v1/especialidades`, `/{id}`                           | administrativo                                          |
| GET               | `/api/v1/unidades?busca=&bairro=&especialidadeId=`, `/{id}` | público                                                 |
| POST, PUT, DELETE | `/api/v1/unidades`, `/{id}`                                 | administrativo                                          |
| GET               | `/api/v1/medicos?unidadeId=&especialidadeId=`, `/{id}`      | público                                                 |
| POST, PUT, DELETE | `/api/v1/medicos`, `/{id}`                                  | administrativo (a manutenção não cadastra médico, RN24) |
| POST              | `/api/v1/medicos/{id}/unidades`                             | administrativo ou manutenção da própria unidade         |
| DELETE            | `/api/v1/medicos/{id}/unidades/{unidadeId}`                 | administrativo ou manutenção da própria unidade         |

DELETE nunca apaga: desativa (`ativa`/`ativo = false`).

Contrato completo, com exemplos e códigos de resposta, em `/api/docs`.

Para desenvolver só com os emuladores, descomente `FIRESTORE_EMULATOR_HOST` e
`FIREBASE_AUTH_EMULATOR_HOST` no `.env` e use `FIREBASE_PROJECT_ID=demo-saude-palma`.

**Credenciais:** o JSON da conta de serviço nunca entra no repositório
(o `.gitignore` bloqueia). Copie só `client_email` e `private_key` para o `.env`.

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
