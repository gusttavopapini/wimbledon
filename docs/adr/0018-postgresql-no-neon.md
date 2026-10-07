# ADR 0018 — PostgreSQL no Neon substitui o Cloud Firestore

- **Status:** aceita
- **Data:** 2026-10-06
- **Substitui:** ADR-002 do DAES (Cloud Firestore como banco de dados). Também
  substitui, no [ADR 0001](0001-api-unico-acesso-ao-banco.md) deste repositório,
  as partes que descrevem o Firestore, o Admin SDK e `firestore.rules`. A regra
  do ADR 0001 (a API é o único caminho até o banco) continua valendo.

## Contexto

O banco era o Cloud Firestore (plano Spark, `southamerica-east1`), acessado só
pela API com o Firebase Admin SDK. Até aqui, três problemas apareceram:

1. **O domínio é relacional.** Unidades atendem especialidades, médicos atendem
   em unidades e têm especialidades, e chamados ligam paciente, médico, unidade
   e horário. No Firestore, isso virou arrays (`unidadeIds`,
   `especialidadeIds`) copiados entre documentos e sincronizados à mão no
   service, como em `usuarios.definirUnidades` e `sincronizarConta`. O banco
   não impedia um médico de apontar para uma unidade que não existe.
2. **O Firestore não garante integridade.** Ele não tem `UNIQUE` nem chave
   estrangeira. Cada regra de unicidade (CPF, e-mail, CNPJ, CRM) e o
   anti-overbooking (RN02) dependiam de um "documento-trava" criado na mesma
   transação: a coleção `unicidades` e o `reservasHorario` (ADR 0003 e ADR-005
   do DAES). Isso deixou código de compensação e um risco aceito documentado:
   o cadastro com conta no Auth sem documento, ou o contrário.
3. **Os dados não podiam ser inspecionados diretamente.** Conferir um cadastro
   ou corrigir um dado exigia o console do Firebase, sem consultas com junção,
   e o emulador precisava de Java. Para a banca e para a equipe, ver os dados
   com SQL é mais simples e mais verificável.

## Decisão

- O banco passa a ser **PostgreSQL**, hospedado no **Neon** (plano gratuito).
- A regra fundamental não muda: o fluxo é **cliente → API → backend → banco**.
  Só a API tem a string de conexão. Nenhum cliente (app, PWA, painel de TV,
  N8N) recebe credencial do banco.
- **Região:** AWS São Paulo (`aws-sa-east-1`). Os dados continuam no Brasil,
  como no Firestore. A API segue no Render (Virgínia), com a mesma distância
  até o banco que já tinha antes.
- **Duas URLs de conexão:**
  - `DATABASE_URL`: em tempo de execução, aponta para o _pooler_ do Neon (host
    com `-pooler`). Ele aguenta as reconexões de um servidor que dorme e acorda.
  - `DIRECT_URL`: só para as migrations, com conexão direta, sem _pooler_. O
    `prisma migrate` precisa de _advisory locks_, e o PgBouncer em modo de
    transação não oferece isso.

  Na máquina de cada pessoa e no CI, as duas apontam para o mesmo Postgres
  local.

- **Postgres local para desenvolvimento e testes:** `infra/docker-compose.yml`
  sobe a mesma versão principal usada no Neon (17), com um banco para
  desenvolvimento (`saude`) e outro para testes (`saude_teste`). No CI, o
  serviço `postgres` do GitHub Actions cumpre esse papel.
- **Modelagem:**
  - Tabelas e colunas em `snake_case`.
  - Todo instante em `timestamptz`, gravado em UTC e apresentado pela API com o
    deslocamento `-03:00` (America/Recife), como antes.
  - Chaves estrangeiras com integridade referencial.
  - Exclusão sempre lógica, por `ativo`/`ativa` ou `status`.
  - Detalhes do esquema no [ADR 0019](0019-prisma-e-migrations.md) e no
    [ADR 0021](0021-integridade-por-constraint.md).
- **Os dados atuais não migram.** O Firestore guarda só o seed fictício e
  contas de teste. O banco novo nasce das migrations e é populado pelo seed.

## Consequências

- Unicidade, referências e anti-overbooking passam a ser garantidos pelo banco
  (ADR 0021). Somem a coleção `unicidades`, o código de compensação do
  cadastro e o risco aceito descrito no README.
- Os dados podem ser consultados com SQL no console do Neon, com `psql` ou
  com o Prisma Studio (`npm run banco:estudio`).
- Os testes de integração rodam contra um Postgres real, em Docker. O Java e o
  Firebase Emulator Suite deixam de ser necessários.
- A partir do merge, saem do projeto `infra/firestore.rules`,
  `infra/firestore.indexes.json`, a seção `firestore` e os emuladores do
  `firebase.json`, além do `firebase-admin`. O Firebase Hosting continua
  servindo o PWA, que é só arquivos estáticos.
- O plano gratuito do Neon suspende o banco depois de alguns minutos sem uso.
  A primeira consulta depois disso leva algumas centenas de milissegundos a
  mais. O Render gratuito já tem o mesmo comportamento na API, e o risco é
  aceito para o escopo do projeto.
- Cada consulta da API, que fica em Virgínia, vai até São Paulo. Para manter a
  latência baixa, uma requisição deve fazer poucas idas ao banco, com junções
  e `include` em vez de consultas em laço. Se a API mudar de região, o banco
  muda junto, em outro ADR.
- A atualização em tempo real da fila não vem do banco. Isso já era verdade
  com o Firestore (ADR-013 do DAES: SSE na API) e não muda.
