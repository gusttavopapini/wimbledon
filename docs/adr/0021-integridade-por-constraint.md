# ADR 0021 — Integridade por constraint do banco em vez de documento-trava

- **Status:** aceita
- **Data:** 2026-10-06
- **Substitui:**
  - a parte do ADR-005 do DAES que descrevia `reservasHorario`. A regra RN02
    (sem overbooking) continua valendo, mas muda de mecanismo;
  - a parte de unicidade do [ADR 0003](0003-identidade-perfis-e-unicidade.md)
    deste repositório (coleção `unicidades`).
- **Não substitui:** a parte do ADR-005 sobre `travasAceite` (RN21). O
  mecanismo do aceite em PostgreSQL será registrado num ADR próprio quando o
  aceite for implementado, na E2. A regra RN21 continua valendo.

## Contexto

O Firestore não tem `UNIQUE`, chave estrangeira nem índice parcial. Para
garantir unicidade e evitar dois agendamentos no mesmo horário, a API criava,
na mesma transação, um documento de id determinístico: `unicidades/cpf_<…>`,
`unicidades/email_<sha256>`, `unicidades/cnpj_<…>`,
`unicidades/crm_<UF>_<…>` e `reservasHorario/{medicoId}_{AAAAMMDDTHHmm}`.
Funcionava, mas:

- a regra ficava no código. Bastava esquecer a trava num caminho novo, como um
  script ou uma rota de edição, para a regra quebrar sem nenhum erro;
- trocar um CNPJ ou um CRM exigia apagar uma trava e criar outra na mesma
  transação, conferindo o "dono" da trava;
- a trava não aparecia no esquema. Quem lia o banco não sabia que a regra
  existia.

## Decisão

O banco passa a garantir as regras de integridade. O código deixa de fazer
isso por conta própria.

### Unicidade (`UNIQUE`)

| Regra                                  | Constraint                                                     | Resposta                          |
| -------------------------------------- | -------------------------------------------------------------- | --------------------------------- |
| Um CPF por conta                       | `usuarios.cpf` UNIQUE                                          | 409 `CPF_JA_CADASTRADO`           |
| Um e-mail por conta                    | `usuarios.email` UNIQUE (gravado em minúsculas, com `CHECK`)   | 409 `EMAIL_JA_CADASTRADO`         |
| Um CNPJ por unidade                    | `unidades.cnpj` UNIQUE                                         | 409 `CNPJ_JA_CADASTRADO`          |
| Um registro no conselho por médico     | `medicos (conselho_tipo, conselho_uf, conselho_numero)` UNIQUE | 409 `CONSELHO_JA_CADASTRADO`      |
| Uma conta ligada a no máximo um médico | `medicos.usuario_id` UNIQUE                                    | (validado antes no service)       |
| Especialidade pelo id derivado do nome | chave primária `especialidades.id`                             | 409 `ESPECIALIDADE_JA_CADASTRADA` |

O repository faz o `INSERT` ou o `UPDATE` direto. Se o Postgres recusar por
violação de unicidade (Prisma `P2002`), o repository identifica **qual**
constraint falhou e devolve o mesmo `{ conflito }` que os services já
consumiam. Os códigos e as mensagens de erro não mudam.

Dois cadastros simultâneos com o mesmo CPF disputam o mesmo índice: o Postgres
deixa exatamente um `INSERT` passar. O outro recebe a violação e vira 409. O
teste de concorrência do cadastro continua cobrindo esse caso.

### Anti-overbooking (RN02): índice único parcial

```sql
CREATE UNIQUE INDEX chamados_medico_horario
  ON chamados (medico_id, inicio)
  WHERE status NOT IN ('cancelado', 'nao_compareceu');
```

- O próprio chamado é a reserva. A coleção `reservasHorario` deixa de existir.
- Agendar é um `INSERT` em `chamados`. Se o índice recusar, a resposta é 409
  `HORARIO_INDISPONIVEL`.
- Cancelar ou marcar falta muda o `status` e libera o horário na hora, sem
  apagar nada.
- Os horários livres continuam calculados: disponibilidades, menos bloqueios,
  menos chamados que ocupam horário.
- O Prisma não declara índice parcial no schema, então ele é escrito em SQL na
  migration ([ADR 0019](0019-prisma-e-migrations.md)).

### Um plantão ativo por médico (RN20)

Quando a tabela de plantões existir (E2), ela segue o mesmo padrão: um índice
único parcial em `medico_id` para as sessões não encerradas. Conflito → 409
`PLANTAO_JA_ATIVO`.

### Chaves estrangeiras e `CHECK`

- Toda referência é uma chave estrangeira com `ON DELETE RESTRICT`. Como a
  exclusão é sempre lógica, nenhuma linha referenciada é apagada.
- `CHECK` escritos na migration:
  - CPF com 11 dígitos e CNPJ com 14;
  - e-mail em minúsculas;
  - `unidade_id` preenchido **se e somente se** o perfil for `recepcionista`
    ou `manutencao` (RN19);
  - fim depois do início em bloqueios, disponibilidades e chamados.
- A tabela `auditoria` é só de inserção: um gatilho recusa `UPDATE` e `DELETE`.

## Consequências

- Somem a coleção `unicidades` e as funções `idTravaCpf`, `idTravaEmail`,
  `idTravaCnpj`, `idTravaConselho` e `removerCriacao`, além de todo o código
  que trocava travas.
- A regra vale para qualquer caminho que escreva no banco: rota, seed, script
  ou SQL direto no console do Neon.
- O índice de RN02 compara o **início exato**. Ele pressupõe que os horários
  oferecidos saem da grade da disponibilidade do médico, com duração fixa. O
  service de agendamento deve aceitar só um início que seja um horário livre
  calculado. Se a agenda passar a ter durações variáveis que possam se
  sobrepor com inícios diferentes, a proteção terá de ser uma _exclusion
  constraint_ sobre o intervalo, em outro ADR.
- Pelo índice, `concluido` e `encaminhado_emergencia` continuam ocupando o
  horário; só `cancelado` e `nao_compareceu` o liberam.
- Chamado sem médico (chamado espontâneo, P14) tem `medico_id` nulo e não
  disputa o índice: no Postgres, nulos não colidem em índice único.
