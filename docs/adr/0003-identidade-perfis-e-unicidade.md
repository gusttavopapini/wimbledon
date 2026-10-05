# ADR 0003 — Identidade: perfis em custom claims e unicidade por documentos-trava

- **Status:** aceita
- **Data:** 2026-10-04

## Contexto

O login é do Firebase Auth (e-mail e senha). A API precisa saber, a cada
requisição, quem é a pessoa, qual o seu perfil e em que unidade ela trabalha,
sem ir ao banco toda vez. CPF e e-mail têm de ser únicos, e o Firestore não tem
restrição de unicidade.

## Decisão

### Perfil e unidade nas custom claims

- Perfis: `paciente`, `recepcionista`, `medico`, `manutencao`, `administrativo`.
- As claims (`perfil`, `unidadeId`, `unidadeIds`) são definidas **só pela API**
  com o Admin SDK. Nenhum cliente consegue alterá-las.
- O middleware `autenticar` valida o ID token com `verifyIdToken(token, true)`:
  token de conta desativada ou com sessão revogada é recusado (401).
- `exigirPerfil(...)` libera por perfil; `exigirUnidade` restringe à unidade da
  claim (recepção/manutenção: `unidadeId`; médico: `unidadeIds`;
  administrativo: todas; paciente: nenhuma).
- O documento `usuarios/{uid}` repete perfil e unidades para consulta e
  auditoria. A claim é a fonte para autorização.
- Mudança de perfil ou unidade (segunda entrega) precisa atualizar a claim **e**
  revogar os tokens (`revokeRefreshTokens`), para valer na hora.

### Unicidade de CPF e e-mail

- Coleção `unicidades` com documentos de id determinístico:
  `cpf_<11 dígitos>` e `email_<sha256 do e-mail em minúsculas>`.
- O cadastro cria, **numa única transação**, as duas travas e o
  `usuarios/{uid}`. Se uma trava já existe, a transação não grava nada e a API
  responde 409. Duas requisições simultâneas disputam o mesmo documento: o
  Firestore deixa só uma transação vencer (teste em
  `tests/integracao/auth.test.ts`).
- Uma consulta seguida de escrita (`where('cpf', '==', …)` e depois `set`) foi
  descartada: duas requisições passariam pela consulta antes de qualquer escrita.
- A conta do Auth é criada depois, com o mesmo uid. Se falhar, a API desfaz o
  que gravou (compensação). Se o Auth já tiver o e-mail (conta criada pelo
  console, sem trava), a resposta também é 409 `EMAIL_JA_CADASTRADO`.

### Primeira conta administrativa

Nenhuma tela cria conta de equipe sem um administrativo. O seed
`infra/seed/criar-administrador.ts` cria a primeira pelo mesmo service da API
(mesmas travas) e não cria uma segunda se já houver uma com o mesmo e-mail ou CPF.

## Consequências

- Claims chegam ao app só no próximo token: depois de mudar um perfil, o app
  precisa renovar o token (`getIdToken(true)`) ou entrar de novo.
- As claims têm limite de 1.000 bytes; `unidadeIds` de médico deve continuar curto.
- Desativar uma conta (DELETE lógico, segunda entrega) desativa no Auth, revoga
  os tokens e marca `status: inativo` — as travas continuam, então o CPF não
  pode ser reaproveitado em outra conta.
