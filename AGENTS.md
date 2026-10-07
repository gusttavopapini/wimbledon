# AGENTS.md — Saúde na Palma da Mão

Este é o **único arquivo de contexto** do projeto. Ele vale para qualquer pessoa
e para qualquer agente de código (Claude Code, Codex, Copilot, Cursor):
`CLAUDE.md`, `.github/copilot-instructions.md` e `.cursorrules` só apontam para
cá. Se algo aqui estiver desatualizado, corrija **aqui**, no mesmo PR da
mudança.

**Responda sempre em português do Brasil.**

## 1. O projeto

O "Saúde na Palma da Mão" é o Projeto Integrador da Faculdade Senac Pernambuco
(Análise e Desenvolvimento de Sistemas, unidade curricular Client-Server). Ele
faz pré-triagem com IA, agendamento de consultas e gestão da fila presencial
para hospitais e clínicas do polo médico do Recife. O público principal inclui
pessoas idosas, por isso acessibilidade e linguagem simples são requisitos, e
não acabamento.

Onde está cada decisão:

| Fonte                               | O que contém                                                                                                                   |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `docs/DAES.md` (DAES v2.0 resumido) | Fonte oficial dos requisitos. Use os IDs dele (RF, RNF, RN, ADR, P) para justificar mudanças.                                  |
| `docs/adr/`                         | Decisões de arquitetura no formato Nygard. Os ADRs 0018 a 0021 descrevem a stack atual: PostgreSQL, Prisma, JWT e constraints. |
| `apps/api/openapi.yaml`             | Contrato da API, publicado em `/api/docs`.                                                                                     |
| `design-system/`                    | Tokens, componentes, contraste e glossário de linguagem (`linguagem.md`).                                                      |

### Entregas

Priorize o que pesa na rubrica da entrega em curso.

- **E1 (14/10/2026):** PWA, API e banco publicados. Pesos: Cadastros/Perfis
  25%, Agenda/Agendamento 35%, Backend/API/Banco 25%, PWA/RN 5%,
  UX/Acessibilidade 10%, Deploy 5%. A IA não é obrigatória.
- **E2 (09/12/2026):** app React Native, app de TV, API, banco e IA.
- **Fora da E1:** fila presencial, plantão médico e painel de TV. Se alguém
  propuser puxá-los para a E1, alerte que isso compete com
  Agenda/Agendamento (35%) e Cadastros/Perfis (25%).

## 2. Regra fundamental

```
app React Native / PWA / painel de TV / N8N
        │  HTTPS + Authorization: Bearer <JWT>   (painel: X-Device-Token · N8N: X-Api-Key)
        ▼
API REST (Express 5)   routes → middlewares → controllers → services → repositories
        │  Prisma (@prisma/adapter-pg)
        ▼
PostgreSQL (Neon em produção · Docker na máquina de cada pessoa · serviço postgres no CI)
```

- **Nenhum cliente acessa o banco.** O fluxo é sempre
  cliente → API → backend → banco. Só a API tem a string de conexão.
- **O app não tem driver de banco nem ORM.** Os pacotes `@prisma/*`, `pg` e
  `firebase` são bloqueados pelo ESLint em `apps/mobile`. Todo dado vem da API,
  via Axios e TanStack Query.
- **O painel de TV não faz login de pessoa.** Ele se autentica por token de
  dispositivo (`X-Device-Token`) e recebe as chamadas por SSE em
  `GET /painel/eventos`, com fallback de polling em `GET /painel/estado`
  (ADR-013 do DAES). O token é somente leitura e vale para uma unidade (RN25).
- **O agente de IA do N8N nunca acessa o banco.** Ele usa HTTP Request Tools
  em `/api/v1/integracoes/*`, com `X-Api-Key` de escopo restrito.
- **Regras de negócio ficam nos services do backend**, e nunca no app, no
  painel ou no N8N. O cliente exibe e envia; a API decide.

## 3. Stack

| Camada            | Tecnologia                                                                                                                                                                                      |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monorepo          | npm workspaces: `apps/api` (`@saude/api`) e `apps/mobile` (`@saude/mobile`). Node 24 (`.nvmrc`) e TypeScript 6.                                                                                 |
| App, PWA e painel | React Native + Expo (Expo Router, TypeScript). PWA via `npx expo export -p web`, publicado no Firebase Hosting, que só serve arquivos estáticos. Axios e TanStack Query; React Hook Form e Zod. |
| API               | Express 5 + TypeScript, com Zod, Helmet, CORS, express-rate-limit, Pino e OpenAPI 3.1 em `/api/docs`. Publicada no Render.                                                                      |
| Banco             | PostgreSQL 17: Neon (`aws-sa-east-1`) em produção e Docker localmente ([ADR 0018](docs/adr/0018-postgresql-no-neon.md)).                                                                        |
| Acesso ao banco   | Prisma ORM 7 com `@prisma/adapter-pg` e migrations versionadas ([ADR 0019](docs/adr/0019-prisma-e-migrations.md)).                                                                              |
| Autenticação      | Própria. Senha com bcrypt (custo 12), access token JWT de 15 min e refresh token opaco de 7 dias, com rotação ([ADR 0020](docs/adr/0020-autenticacao-propria-jwt.md)).                          |
| E-mail            | Interface `EnviadorEmail`: `log` em desenvolvimento; `resend` ou `smtp` em produção.                                                                                                            |
| IA (E2)           | Google Gemini (família Flash) via `@google/genai`, atrás da interface `ProvedorIA`, com saída JSON validada por Zod.                                                                            |
| Testes            | Vitest e Supertest contra um Postgres real. k6 para carga. CI no GitHub Actions.                                                                                                                |

## 4. Estrutura do repositório

| Pasta             | O que tem                                                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/api/src`    | `routes/`, `middlewares/`, `controllers/`, `services/`, `repositories/`, `schemas/` (Zod), `integrations/` (banco, e-mail, IA), `errors/`, `config/` |
| `apps/api/prisma` | `schema.prisma` e `migrations/` (SQL versionado)                                                                                                     |
| `apps/api/tests`  | `unidade/` (sem banco) e `integracao/` (Supertest + Postgres)                                                                                        |
| `apps/mobile`     | App Expo: `app/` (rotas do Expo Router) e `src/` (api, auth, components, hooks, theme)                                                               |
| `infra/`          | `docker-compose.yml` (Postgres local) e `seed/` (dados fictícios)                                                                                    |
| `design-system/`  | Fonte do tema e das regras de UI. **Não edite**: o `tokens.ts` do app é gerado daqui.                                                                |
| `docs/adr/`       | Decisões de arquitetura                                                                                                                              |

## 5. Como rodar

**Pré-requisitos:** Node 24 (`nvm use`) e Docker. O Docker só serve para
subir o Postgres local; qualquer Postgres 17 acessível também funciona.

### Primeira vez

```bash
npm install                         # também gera o cliente Prisma (postinstall da API)
cp .env.example .env                # variáveis da API (o padrão já aponta para o Docker)
cp .env.example apps/mobile/.env    # o Expo lê as EXPO_PUBLIC_* desta pasta
npm run banco:subir                 # Postgres 17 em localhost:5432 (bancos saude e saude_teste)
npm run banco:aplicar               # aplica as migrations no banco de desenvolvimento
npm run seed                        # conta administrativa + cadastros base fictícios
```

### No dia a dia

```bash
npm run banco:subir      # se o contêiner não estiver no ar
npm run dev:api          # API em http://localhost:3333 · /health · /api/docs
npm run dev:mobile       # app Expo (tecla w abre o PWA no navegador)
```

No celular, com o Expo Go, o app troca `localhost` pelo IP do computador que
roda o Expo. Não é preciso editar o `.env`.

### Banco e migrations

| Comando                                      | O que faz                                                                                                 |
| -------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `npm run banco:subir` / `banco:parar`        | Sobe ou para o Postgres do `infra/docker-compose.yml`. Os dados ficam num volume.                         |
| `npm run banco:migrar -- --name <descricao>` | Gera uma migration a partir do `schema.prisma` e a aplica no banco local (`prisma migrate dev`).          |
| `npm run banco:aplicar`                      | Aplica as migrations pendentes (`prisma migrate deploy`). Use no Neon, no CI e no banco de testes.        |
| `npm run banco:estudio`                      | Abre o Prisma Studio para ver e editar os dados locais pelo navegador.                                    |
| `npm run seed`                               | Cria a primeira conta administrativa e os cadastros base fictícios. Pode rodar de novo sem duplicar nada. |
| `npm run seed:admin`                         | Cria só a conta administrativa.                                                                           |

O passo a passo para criar o banco no Neon e publicar está no `README.md`.

### Testes e qualidade

| Comando                                    | O que faz                                                                                                                                                                   |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm test`                                 | Testes de unidade e de integração. Os de integração precisam do Postgres no ar (`npm run banco:subir`); o setup aplica as migrations no banco `saude_teste` antes de rodar. |
| `npm run test:ci`                          | O mesmo, com cobertura (mínimo de 60% nos services).                                                                                                                        |
| `npm run tipos`                            | `tsc --noEmit` em cada workspace.                                                                                                                                           |
| `npm run lint` · `npm run formatar:checar` | ESLint e Prettier.                                                                                                                                                          |
| `npm run tema` · `npm run icones`          | Regeneram `tokens.ts` e o módulo de ícones a partir do design system.                                                                                                       |

## 6. Convenções de código

- **Nomes de domínio em português** (`criarConta`, `unidadeId`, `chamados`),
  em camelCase no TypeScript e snake_case no banco (`@map`/`@@map` no Prisma).
- **Camadas da API, em ordem fixa:** middlewares (helmet, cors, rate limit,
  `autenticar`, `autenticarDispositivo`, `autenticarIntegracao`,
  `exigirPerfil`, `exigirUnidade`, `validar`) → routes → controllers →
  services → repositories.
  - **Controllers** só traduzem HTTP. Cada handler tem try/catch e chama
    `next(erro)`.
  - **Services** guardam as regras de negócio e não conhecem HTTP nem o
    Prisma: recebem os repositories por injeção (`criarXService({ ... })`).
  - **Repositories** são os únicos que importam o cliente Prisma. Eles
    traduzem erros do banco, como a violação de UNIQUE, em resultados que o
    service entende (`{ conflito }`), e devolvem objetos de domínio, com
    datas em `Date`.
- **Erros esperados** saem como `AppError`, com código e status HTTP. A
  mensagem vai direto para a pessoa: diz o que fazer, não o que deu errado
  (`design-system/linguagem.md`). Erro inesperado vira 500 sem vazar detalhe;
  o detalhe vai só para o log.
- **Integrações ficam isoladas atrás de interfaces:** `EnviadorEmail`,
  `ProvedorIA`/`GeminiClient`, `ExpoPushClient`, `PdfGenerator` (PDFKit) e
  `PainelEventBus`.
- **Variáveis de ambiente** são validadas por Zod em `config/env.ts`. Sem
  configuração válida, a API não sobe. Toda variável nova entra no
  `.env.example` com um valor de exemplo que não seja segredo.
- **Logs** saem em JSON (Pino), com `requestId`. Senha, hash de senha e
  tokens nunca vão para o log, e CPF aparece mascarado.
- **Exclusão é sempre lógica** (`ativo`/`ativa`/`status`). `DELETE` desativa
  ou cancela e nunca apaga histórico.
- **Mensagens de commit** seguem o Conventional Commits, em português:
  `feat(api): …`, `fix(mobile): …`, `test(api): …`, `docs: …`, `ci: …`.

## 7. Convenções da API

- **Formato:** base `/api/v1`, recursos no plural em português e JSON em
  camelCase. Datas em ISO 8601 com o deslocamento local
  (`2026-10-14T09:30:00.000-03:00`), gravadas em `timestamptz` (UTC), no fuso
  America/Recife.
- **Autenticação:**
  - Pessoas: `Authorization: Bearer <tokenAcesso>`, renovado por
    `POST /auth/renovar`.
  - Painel de TV: `X-Device-Token` em `/painel/*`.
  - N8N: `X-Api-Key` em `/integracoes/*`.
- **Erro padrão:** `{"erro": {"codigo", "mensagem", "detalhes", "requestId"}}`.
- **Status e códigos:**
  - 400 `DADOS_INVALIDOS`
  - 401 `NAO_AUTENTICADO`, `CREDENCIAIS_INVALIDAS`
  - 403 `ACESSO_NEGADO`, `FORA_DA_UNIDADE`, `CONTA_DESATIVADA`
  - 404 `NAO_ENCONTRADO`
  - 409 `CPF_JA_CADASTRADO`, `EMAIL_JA_CADASTRADO`, `CNPJ_JA_CADASTRADO`,
    `CONSELHO_JA_CADASTRADO`, `ESPECIALIDADE_JA_CADASTRADA`,
    `HORARIO_INDISPONIVEL`, `CHAMADO_JA_ACEITO`, `PLANTAO_JA_ATIVO`
  - 422 `LINK_INVALIDO`, `SEM_PLANTAO_ATIVO`, `CHEGADA_FORA_DO_PRAZO`,
    `MEDICO_NAO_CADASTRADO`, `MEDICO_INATIVO`, `UNIDADE_NAO_CADASTRADA`,
    `ESPECIALIDADE_NAO_CADASTRADA`, `USUARIO_NAO_E_MEDICO`
  - 429 `LIMITE_EXCEDIDO`
  - 500 `ERRO_INTERNO`
  - 503 `IA_INDISPONIVEL`
- **Contrato estável:** rotas, nomes de campos, códigos de erro e o formato
  de erro existentes não mudam sem ADR. Acrescentar é permitido; quebrar, não.

### Checklist para toda rota nova

1. Validar a entrada com Zod (`validar`) e lançar erros via `AppError`.
2. Atualizar o `openapi.yaml` com todos os códigos de resposta possíveis e um
   payload JSON de exemplo.
3. Se a rota lê ou escreve dado de unidade, usar `exigirUnidade` e escrever um
   teste 403 cruzando unidades.
4. Se a rota escreve dado de pessoa (usuário, médico, chamado), registrar na
   `auditoria` (RF34): ator, perfil, unidade, ação, recurso, id do recurso,
   instante e IP.
5. Se houver disputa (agendar, aceitar, abrir plantão), a garantia vem de
   constraint do banco (UNIQUE ou índice único parcial), nunca de "consultar
   e depois gravar". Escreva um teste com requisições simultâneas.
6. Escrever testes com Vitest e Supertest contra o Postgres.

## 8. App, PWA e painel (`apps/mobile`)

- **Dados:** todo dado vem da API (`src/api`). Variáveis públicas só com o
  prefixo `EXPO_PUBLIC_`, porque vão para dentro do pacote do app. Nunca
  coloque segredo nelas.
- **Sessão:**
  - O access token fica só em memória.
  - O refresh token fica no `expo-secure-store` (nativo) ou no `localStorage`
    (web; risco registrado no ADR 0020).
  - Uma resposta 401 dispara **uma** renovação compartilhada, e a requisição
    é repetida.
- **Formulários:** React Hook Form + Zod. **Rotas:** Expo Router, com
  `(publico)` para quem não entrou e `(app)` para o paciente. As telas de
  equipe e o painel ganham grupos próprios (`(recepcao)`, `(medico)`,
  `(manutencao)`, `(admin)`, `(painel)`) quando forem criadas.
- **UX e acessibilidade** (público idoso, WCAG 2.2 AA):
  - Fonte base de 18 px (22 px no modo letra grande); botões com no mínimo
    56 dp de altura; alvos de toque de 48 × 48 dp; contraste ≥ 4,5:1, com meta
    de 7:1.
  - Os tokens vêm de `design-system/tokens.json` via `npm run tema`, que gera
    `src/theme/tokens.ts`. Não escreva cor nem tamanho solto no componente; o
    ESLint barra cor literal.
  - A identidade é o azul-petróleo (teal): primária `#015f68` no tema claro e
    amarelo `#ffd54f` no alto contraste. Ela substitui a paleta azul antiga do
    DAES. `sucesso`, `erro` e `atencao` vêm sempre com ícone e texto.
  - Uma decisão por tela; agendamento em até 5 telas depois do login;
    linguagem simples; datas por extenso; confirmação antes de qualquer ação
    irreversível.
  - `accessibilityLabel` em todo elemento interativo; layout testado com a
    fonte a 200%.
- **Painel de TV** (E2):
  - Legível a 5 m: nome ≥ 72 px, consultório ≥ 96 px; fundo `#1A1A1A`, texto
    `#FFFFFF` e destaque `#FFD54F` (contraste ≥ 7:1).
  - Alerta sonoro de cerca de 1 s antes da voz, sem piscar. A exibição
    funciona mesmo se o áudio falhar.
- **Testes:** `npm test -w @saude/mobile` cobre máscaras, validações e a
  tradução dos erros da API para linguagem simples.

## 9. Perfis

Há cinco perfis de pessoa, mais o painel de TV, que é um dispositivo e não um
usuário. Perfil e unidades viajam no JWT e são **lidos do banco** a cada login
e a cada renovação. Só a API os define.

| Perfil           | Escopo                                                | Pode                                                                    | Não pode                              |
| ---------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------- |
| `paciente`       | os próprios dados                                     | se cadastrar, agendar, cancelar e reagendar                             | ver dados de outra pessoa             |
| `recepcionista`  | **uma** unidade (`unidadeId`)                         | confirmar chegada, marcar falta, cadastrar e editar pacientes           | **alterar a senha de ninguém (RN23)** |
| `medico`         | **N** unidades (`unidadeIds`, por `medicos_unidades`) | atender nas unidades onde está alocado                                  | ter mais de um plantão ativo (RN20)   |
| `manutencao`     | **uma** unidade, com acesso total a ela               | redefinir senhas, alocar e desalocar médicos na sua unidade             | **criar conta de médico (RN24)**      |
| `administrativo` | global                                                | criar médicos e contas de manutenção; CRUD de unidades e especialidades | —                                     |

## 10. Regras de negócio

Defenda estas regras em todo código novo.

**Agenda e chamados**

- **RN02, sem overbooking:** o índice único parcial `chamados_medico_horario`,
  em `(medico_id, inicio)` para chamados que não estão `cancelado` nem
  `nao_compareceu`, barra dois chamados no mesmo horário. A violação vira 409
  `HORARIO_INDISPONIVEL`. Os horários livres são calculados: disponibilidades,
  menos bloqueios, menos chamados ativos
  ([ADR 0021](docs/adr/0021-integridade-por-constraint.md)).
- **RN04:** cancelar ou reagendar só até 2 h antes do horário.
- **RN06:** a chegada só é confirmada no dia, pela recepção da unidade do
  chamado.
- **RN08:** só entra na fila médica quem teve a chegada confirmada.
- **RN22:** a fila é ordenada por urgência, depois pelo horário agendado,
  depois pela hora da chegada.
- **Status do chamado:** `agendado`, `aguardando_recepcao`,
  `aguardando_medico`, `chamando`, `em_atendimento`, `concluido`, `cancelado`,
  `nao_compareceu`, `encaminhado_emergencia`.

**Acesso e unidades**

- **RN19:** recepcionista e manutenção só enxergam a própria unidade. O banco
  reforça com `CHECK`: `unidade_id` é preenchido se e somente se o perfil for
  um desses dois.
- **RN20:** um único plantão ativo por médico, garantido por índice único
  parcial quando a tabela de plantões existir.
- **RN21:** sem aceite duplicado de chamado. A regra continua valendo; o
  mecanismo em Postgres será definido num ADR na E2.
- **RN23:** a recepcionista não altera senhas.
- **RN24:** a manutenção aloca médicos, mas não cria contas de médico.

**Painel de TV**

- **RN25:** o token do painel é somente leitura e vale para uma unidade.
- **RN26:** o nome completo só aparece no painel com consentimento específico
  (`usuarios.consentimento_exibicao_painel`). Sem ele, aparecem o primeiro
  nome e a inicial do sobrenome.

**Unicidade e auditoria**

- **Unicidade:** CPF, e-mail, CNPJ e registro no conselho são UNIQUE no
  banco. Não existe documento-trava nem "consultar antes de gravar".
- **RF34, auditoria:** toda escrita em dado de pessoa grava uma linha em
  `auditoria`. A tabela é só de inserção: um gatilho recusa `UPDATE` e
  `DELETE`.

## 11. IA e segurança do paciente

- A IA recomenda a especialidade e sugere a urgência. Ela **não** diagnostica
  nem prescreve. Exiba sempre o aviso de que a IA não substitui avaliação
  médica.
- **A IA não escolhe a unidade.** Ela indica a especialidade; a API calcula as
  unidades possíveis e o paciente confirma (RF45).
- **Saída da triagem:** `{especialidade, confianca, urgencia
(rotina|prioritario|emergencia), sinaisAlerta, justificativa, orientacao}`.
  Se o JSON for inválido ou a confiança for menor que 0,5, o fallback é
  Clínica Geral.
- **Sinais de alerta** também são checados por palavras-chave na API. Em
  alerta, oriente a ligar para o SAMU 192 (e o CVV 188 em caso de autolesão)
  e **não** abra chamado.
- **Nunca envie nome, CPF, telefone ou e-mail ao Gemini (RN12).** Vão só a
  idade, o sexo informado e o relato.
- O prompt do agente deve ignorar instruções que venham dentro das mensagens
  do paciente (prompt injection).

## 12. Segurança e dados pessoais

- Seeds e testes usam **somente dados fictícios**: CPFs e CNPJs gerados com
  dígitos válidos e e-mails `@saude-palma.test`. Nenhuma instituição ou pessoa
  real.
- **Nunca commite** `.env`, `DATABASE_URL`, `DIRECT_URL`, `JWT_SEGREDO`,
  `RESEND_API_KEY`, senha de SMTP, `PAINEL_TOKEN_SECRET` ou chaves de API. O
  `.gitignore` já bloqueia `.env` e `.env.*`.
- O banco guarda a senha só como hash bcrypt e o refresh token e o token de
  redefinição só como SHA-256.
- `POST /auth/esqueci-senha` responde 204 sempre, para não revelar quais
  e-mails têm conta.

## 13. Proibido mexer sem antes escrever um ADR

Para mudar qualquer item abaixo, escreva antes um ADR em `docs/adr/` no
formato Nygard (título, status, contexto, decisão, consequências), com o
próximo número livre, e diga qual ADR ele substitui:

1. **A regra fundamental:** qualquer acesso de cliente ao banco, driver ou ORM
   no app, ou o N8N ou a IA gravando direto no banco.
2. **Banco, ORM, driver, hospedagem ou região** do banco e da API.
3. **O modelo de autenticação:** algoritmo e validade dos tokens, onde o
   refresh token é guardado, rotação e reúso, custo do bcrypt.
4. **Constraints de integridade:** remover ou afrouxar um UNIQUE, o índice
   `chamados_medico_horario`, um `CHECK`, uma chave estrangeira ou o gatilho
   da auditoria, ou trocar qualquer um deles por verificação em código.
5. **O contrato público da API:** rota, nome de campo, código de erro ou
   formato de erro existentes.
6. **Exclusão física** de qualquer dado de negócio.
7. **Uma migration já commitada.** Para corrigir, crie outra; não edite a que
   existe.

## 14. Pare e alerte se alguém propuser

- Acessar o banco a partir do app, do PWA, do painel ou do N8N, ou colocar
  regra de negócio no cliente ou no N8N.
- Fazer o painel usar login de pessoa ou ler o banco.
- Expor credenciais no front-end, enviar dados identificáveis ao Gemini ou
  deixar a IA escolher a unidade.
- Permitir que a recepcionista altere senhas (RN23) ou que a manutenção crie
  médicos (RN24).
- Permitir mais de um plantão ativo por médico (RN20), aceite sem garantia
  contra corrida (RN21) ou agendamento sem o índice de RN02.
- Exibir o nome completo no painel sem consentimento (RN26).
- Puxar fila, plantão ou painel para a E1.

## 15. Pendências em aberto (DAES, seção 17)

Não trate estes itens como decididos sem confirmação:

- **P06:** ordem da fila médica.
- **P12:** painel como APK de Android TV ou PWA em quiosque.
- **P13:** consultório escolhido no plantão.
- **P14:** chamado espontâneo não escolhe médico.
- **P15:** a manutenção redefine senha, a recepcionista não.

## 16. Como trabalhar

- **Devagar e sempre.** Não gere o sistema inteiro. Para cada módulo,
  apresente primeiro a estrutura de pastas, as entidades e as rotas, e espere
  a aprovação antes de escrever o código.
- **Clean code e nomes de domínio em português.** Cada camada no seu lugar:
  rotas, controllers, services e repositories.
- **Em bug,** explique a causa de forma didática e entregue o código
  corrigido.
- **Se uma sugestão exigir mudar o DAES ou algo da seção 13,** avise e
  proponha o ADR antes de mudar o código.

## 17. Antes de abrir PR

- [ ] O trabalho está numa branch a partir da `main`. Nada é commitado direto
      na `main`.
- [ ] `npm run formatar:checar`, `npm run lint` e `npm run tipos` passam.
- [ ] `npm test` passa com o Postgres no ar (`npm run banco:subir`).
- [ ] `npm run build -w @saude/api` e `npm run exportar:web -w @saude/mobile`
      passam.
- [ ] Se o `schema.prisma` mudou, a migration foi gerada, **revisada** (sem
      `DROP INDEX "chamados_medico_horario"` nem perda de dados) e commitada
      junto.
- [ ] Rota nova ou alterada: o `openapi.yaml` está atualizado e o checklist da
      seção 7 foi cumprido.
- [ ] Variável de ambiente nova: está no `.env.example` e em `config/env.ts`.
- [ ] Nenhum segredo e nenhum dado pessoal real no diff.
- [ ] Se tocou em algo da seção 13, o ADR está no mesmo PR.
- [ ] Se o `AGENTS.md` ficou desatualizado, foi corrigido no mesmo PR.
- [ ] A descrição do PR diz o que mudou, cita os IDs do DAES (RF, RN, P) e
      explica **como foi verificado**.
