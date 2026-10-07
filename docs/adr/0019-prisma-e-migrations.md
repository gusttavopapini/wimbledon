# ADR 0019 — Prisma como camada de acesso, com migrations versionadas

- **Status:** aceita
- **Data:** 2026-10-06
- **Substitui:** o uso do Firebase Admin SDK nos repositories (ADR 0001 deste
  repositório e ADR-002 do DAES) e o Firebase Emulator Suite nos testes de
  integração ([ADR 0002](0002-monorepo-npm-workspaces.md), último item da
  decisão).

## Contexto

Com o PostgreSQL ([ADR 0018](0018-postgresql-no-neon.md)), a API precisa de uma
forma de acessar o banco que:

- seja tipada no TypeScript, para os repositories devolverem objetos de
  domínio sem conversões manuais espalhadas;
- versione o esquema no repositório, para cada pessoa da equipe, o CI e o Neon
  terem exatamente as mesmas tabelas;
- permita escrever SQL à mão quando o esquema declarativo não alcançar, como
  em índices parciais, `CHECK` e gatilhos.

## Decisão

- **Prisma ORM 7**, com `prisma` e `@prisma/client` na **mesma versão fixa**
  (sem `^`). Na data deste ADR, a tag `latest` do CLI no npm aponta para uma
  versão candidata do Prisma 8. Não usamos versões candidatas.
- **Esquema em `apps/api/prisma/schema.prisma`.** Os modelos ficam no singular
  em PascalCase, e os campos em camelCase, como o resto do código. Tabelas e
  colunas vão para o banco em `snake_case`, com `@@map` e `@map`.
- **Configuração em `apps/api/prisma.config.ts`.** O Prisma 7 tira a URL do
  `schema.prisma`: o CLI usa `DIRECT_URL` (ou `DATABASE_URL`, se a primeira
  não existir) para as migrations.
- **Driver:** `@prisma/adapter-pg` (driver `pg`, TCP). É o mesmo no Neon, no
  Docker local e no CI. Não usamos o adaptador serverless do Neon, porque a
  API é um servidor de longa duração e não uma função.
- **Cliente gerado** com o gerador `prisma-client` em
  `apps/api/src/generated/prisma`. A pasta fica fora do git e é recriada por
  `prisma generate`, que roda no `postinstall` da API e antes do build.
- **Só os repositories importam o cliente Prisma.** Services recebem
  repositories, como já era, e nunca importam `@prisma/client` nem o cliente
  gerado. Uma instância única de `PrismaClient` é criada em
  `src/integrations/banco.ts` e injetada em `criarApp`, do mesmo jeito que o
  Admin SDK era injetado.
- **Migrations versionadas** em `apps/api/prisma/migrations/`, sempre
  commitadas:
  - Desenvolvimento: `npm run banco:migrar -- --name <descricao>`
    (`prisma migrate dev`). Gera a migration a partir do schema e aplica no
    banco local.
  - CI, testes e Neon: `npm run banco:aplicar` (`prisma migrate deploy`). Só
    aplica as migrations que existem e nunca gera nada.
  - Uma migration publicada não é editada. Para corrigir, cria-se outra.
- **SQL à mão dentro da migration** para o que o Prisma não declara: o índice
  único parcial do anti-overbooking, os `CHECK` e o gatilho que protege a
  auditoria (ADR 0021). Gere com `prisma migrate dev --create-only`, acrescente
  o SQL e depois aplique.

## Consequências

- O tipo de cada tabela sai do schema. Se uma coluna mudar, o compilador
  aponta cada repository afetado.
- O Prisma não conhece o índice parcial escrito à mão. Toda migration nova deve
  ser revisada antes do commit: se o Prisma gerar
  `DROP INDEX "chamados_medico_horario"`, essa linha sai. Na versão 7.10 isso
  foi verificado: com o índice aplicado, `prisma migrate dev --create-only` sem
  mudança no schema gera uma migration vazia. A revisão continua obrigatória,
  porque o comportamento pode mudar numa versão futura. Um teste de integração
  confere que o índice existe e que ele barra o segundo agendamento no mesmo
  horário.
- `prisma generate` precisa rodar depois do `npm ci`. O `postinstall` da API
  cuida disso; em build, o script `build` gera antes do `tsc`.
- Os testes de integração precisam de um Postgres (`npm run banco:subir`). O
  setup global aplica as migrations no banco `saude_teste` antes da suíte.
- O Prisma Studio (`npm run banco:estudio`) mostra os dados do banco local
  pelo navegador, sem SQL.
