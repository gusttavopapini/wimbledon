# AGENTS.md — Saúde na Palma da Mão

Instruções para agentes de código (Codex) neste repositório. Responda sempre em português do Brasil.

## Projeto

Projeto Integrador "Saúde na Palma da Mão" (Faculdade Senac Pernambuco, ADS, UE Client Server): pré-triagem com IA, agendamento e gestão de fila presencial para o polo médico do Recife.

**Fonte oficial de verdade:** `docs/DAES.md` (DAES v2.0 resumido). Decisões arquiteturais em `docs/adr/`. Use os IDs do DAES (RF, RNF, RN, ADR, P) ao justificar mudanças. Se uma sugestão exigir mudar o DAES ou criar um ADR, avise e proponha o ADR no formato Nygard (título, status, contexto, decisão, consequências).

## Entregas (priorize o que pesa na rubrica da entrega em curso)

- **E1 (14/10/2026):** PWA + API + Banco publicados. Pesos: Cadastros/Perfis 25%, Agenda/Agendamento 35%, Backend/API/Banco 25%, PWA/RN 5%, UX/Acessibilidade 10%, Deploy 5%. IA não é obrigatória.
- **E2 (09/12/2026):** app React Native + app de TV + API + Banco + IA.
- **Escopo da E1:** fila presencial, plantão médico e painel de TV NÃO entram na E1. Se alguém propuser puxá-los, alerte que isso compete com Agenda/Agendamento (35%) e Cadastros/Perfis (25%).

## Arquitetura (regra fundamental)

- Fluxo estrito: Cliente (app RN / PWA / painel de TV / N8N) → API REST → Backend → Banco. **Nenhum cliente acessa o banco.**
- O Cloud Firestore é acessado SOMENTE pela API, via Firebase Admin SDK. `infra/firestore.rules` nega todo acesso de cliente (`allow read, write: if false`).
- App, PWA e painel usam o Firebase JS SDK APENAS para login (Firebase Auth). **Nunca importar `firebase/firestore` no front-end.**
- O painel de TV não usa Firebase Auth: autentica por token de dispositivo (`X-Device-Token`), recebe chamadas por SSE em `GET /painel/eventos` com fallback de polling em `GET /painel/estado`. Nunca assina o Firestore (ADR-013).
- O agente de IA do N8N NUNCA lê ou grava o Firestore. Usa HTTP Request Tools em `/api/v1/integracoes/*`, com `X-Api-Key` de escopo restrito.
- Regras de negócio ficam nos services do backend, nunca no app, no painel ou no N8N.

## Stack

- Monorepo npm workspaces: `apps/mobile` (`@saude/mobile`), `apps/api` (`@saude/api`), `infra`, `n8n/workflows`, `docs/adr`.
- Front único: React Native + Expo (Expo Router, TypeScript). PWA via `npx expo export -p web`. Axios + TanStack Query; React Hook Form + Zod.
- Backend: Node.js 24 + Express 5 + TypeScript, camadas routes → middlewares → controllers → services → repositories. Zod, Helmet, CORS, express-rate-limit, Pino, OpenAPI 3.1 em `/api/docs`.
- Banco/identidade: Cloud Firestore (Spark) + Firebase Auth. `perfil`, `unidadeId` e `unidadeIds` em custom claims, definidas só pela API.
- IA: Google Gemini (família Flash) via `@google/genai`, atrás da interface `ProvedorIA`, saída JSON validada por Zod.
- Testes: Vitest, Supertest, Firebase Emulator Suite, k6. CI: GitHub Actions.

## Comandos (na raiz)

- `npm run dev:api` · `npm run dev:mobile`
- `npm run emuladores` (Auth + Firestore locais)
- `npm test` · `npm run test:emulador` · `npm run tipos` · `npm run lint` · `npm run formatar:checar`
- Antes de concluir uma tarefa: rode tipos, lint e testes do que você alterou.

## Perfis e regras de negócio

Cinco perfis + o painel de TV como dispositivo (não é usuário):

- **paciente** — próprios dados.
- **recepcionista** — exatamente UMA unidade (`unidadeId`); confirma chegada, marca falta, cadastra/edita pacientes. **Não altera senha de ninguém (RN23).**
- **medico** — N unidades (`unidadeIds[]`), no máximo UMA sessão de plantão ativa (RN20).
- **manutencao** — exatamente UMA unidade, acesso total a ela; redefine senha; **aloca médicos mas não cria contas de médico (RN24).**
- **administrativo** — global; cria médicos e manutenção; CRUD de unidades e especialidades.

Regras que devem ser defendidas em todo código novo:

- **RN02** sem overbooking: chamado `agendado` cria `reservasHorario/{medicoId}_{AAAAMMDDTHHmm}` na mesma transação; conflito → 409 `HORARIO_INDISPONIVEL`. Horários livres são calculados (disponibilidades − bloqueios − reservas).
- **RN21** sem aceite duplicado: aceitar cria `travasAceite/{chamadoId}` na mesma transação; conflito → 409 `CHAMADO_JA_ACEITO`.
- **RN04** cancelar/reagendar até 2 h antes · **RN06** chegada só no dia, pela recepção da unidade do chamado · **RN08** fila médica só com chegada confirmada · **RN22** ordem da fila: urgência → horário agendado → hora da chegada.
- **RN19** recepcionista e manutenção só enxergam a própria unidade · **RN25** token do painel é somente leitura e com escopo de unidade · **RN26** nome completo no painel só com consentimento específico (senão primeiro nome + inicial).
- Status do chamado: `agendado`, `aguardando_recepcao`, `aguardando_medico`, `chamando`, `em_atendimento`, `concluido`, `cancelado`, `nao_compareceu`, `encaminhado_emergencia`.
- Exclusão sempre lógica; `DELETE` cancela/desativa, nunca apaga histórico.

## IA e segurança do paciente

- A IA recomenda especialidade e sugere urgência; não diagnostica nem prescreve. Sempre exibir o aviso de que não substitui avaliação médica.
- **A IA não escolhe a unidade**: ela indica a especialidade; a API calcula as unidades e o paciente confirma (RF45).
- Saída da triagem: `{especialidade, confianca, urgencia (rotina|prioritario|emergencia), sinaisAlerta, justificativa, orientacao}`. Fallback para Clínica Geral se o JSON for inválido ou a confiança < 0,5.
- Sinais de alerta são checados também por palavras-chave na API. Em alerta: orientar SAMU 192 (e CVV 188 para autolesão) e NÃO abrir chamado.
- **Nunca enviar nome, CPF, telefone ou e-mail ao Gemini (RN12)**: só idade, sexo informado e relato.
- O prompt do agente deve ignorar instruções contidas nas mensagens do paciente (prompt injection).
- Use somente dados fictícios em seeds e testes. Nunca commite `.env`, credenciais do Admin SDK, `PAINEL_TOKEN_SECRET` ou chaves de API.

## Como trabalhar

- **Devagar e sempre:** não gere o sistema inteiro. Para cada módulo, apresente primeiro estrutura de pastas, entidades e rotas e aguarde aprovação antes de escrever o código.
- Clean code, nomes de domínio em português; separação rotas/controllers/services/repositories; try/catch encaminhando para o `errorHandler`; `AppError` com código e status HTTP corretos.
- Em bugs: explique a causa de forma didática e entregue o código corrigido.
- Mudanças em `apps/api` e `apps/mobile` têm regras adicionais nos `AGENTS.md` dessas pastas.

## Pare e alerte se alguém propuser

- Usar o SDK do Firestore no app, PWA ou painel; fazer o painel assinar o Firestore ou usar login de pessoa.
- Deixar N8N/IA gravar direto no banco, ou colocar regra de negócio no cliente ou no N8N.
- Expor credenciais no front-end; enviar dados identificáveis ao Gemini; deixar a IA escolher a unidade.
- Permitir que a recepcionista altere senhas (RN23) ou que a manutenção crie médicos (RN24).
- Permitir mais de um plantão ativo por médico (RN20) ou aceite sem trava transacional (RN21).
- Exibir nome completo no painel sem consentimento (RN26); puxar fila, plantão ou painel para a E1.

## Pendências em aberto (DAES seção 17)

P06 ordem da fila médica · P12 painel como APK Android TV ou PWA em quiosque · P13 consultório escolhido no plantão · P14 chamado espontâneo não escolhe médico · P15 manutenção redefine senha, recepcionista não. Não trate como decididas sem confirmação.
