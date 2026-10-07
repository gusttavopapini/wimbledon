# ADR 0020 — Autenticação própria com JWT e refresh token

- **Status:** aceita
- **Data:** 2026-10-06
- **Substitui:** ADR-004 do DAES (Firebase Auth como provedor de identidade)
  e, no [ADR 0003](0003-identidade-perfis-e-unicidade.md) deste repositório, a
  parte de perfis em custom claims. A unicidade, que também estava no ADR 0003,
  passa para o [ADR 0021](0021-integridade-por-constraint.md).

## Contexto

Com o Firebase Auth, a identidade ficava fora do nosso banco. Isso trazia três
problemas:

- **Cadastro em dois sistemas.** A conta era criada no Firestore e depois no
  Auth, sem transação entre os dois. O resultado era código de compensação e
  um risco aceito: uma conta "meio criada", com CPF e e-mail bloqueados.
- **Perfil e unidade em dois lugares.** Eles ficavam nas custom claims e eram
  copiados em `usuarios/{uid}`. A cada alocação, a API tinha de sincronizar os
  dois.
- **Dependência do SDK do Firebase no app** para entrar, renovar a sessão e
  recuperar a senha, que usava a página padrão do Firebase.

Com o PostgreSQL ([ADR 0018](0018-postgresql-no-neon.md)), credencial e perfil
podem morar na mesma linha de `usuarios`, gravados na mesma transação.

## Decisão

### Senha

- Hash com **bcrypt, custo 12**, guardado em `usuarios.senha_hash`.
- A senha e o hash **nunca** vão para o log. O logger remove `senha`,
  `novaSenha` e `senhaHash`, e os repositories nunca devolvem o hash fora do
  fluxo de login.
- No login com um e-mail que não existe, a API compara a senha com um hash
  fixo de mesmo custo. Assim, o tempo de resposta não revela quais e-mails têm
  conta.
- **A ordem das verificações no `POST /entrar` é fixa:**
  1. Busca a conta pelo e-mail.
  2. Compara a senha com o bcrypt, contra o hash fixo se a conta não existir ou
     ainda não tiver senha (pré-cadastro).
  3. Se a senha não confere, responde 401 `CREDENCIAIS_INVALIDAS`.
  4. **Só depois**, se a conta estiver `inativo`, responde 403
     `CONTA_DESATIVADA`.

  Quem não sabe a senha recebe sempre a mesma resposta, exista a conta ou não,
  esteja ela ativa ou desativada. Responder `CONTA_DESATIVADA` antes de
  conferir a senha revelaria a qualquer pessoa que aquele e-mail tem uma conta
  desativada. Um teste de integração cobre esse caso: conta desativada com
  senha errada recebe 401 `CREDENCIAIS_INVALIDAS`, e com a senha certa recebe
  403 `CONTA_DESATIVADA`.

### Tokens

- **Access token:** JWT HS256 assinado com `JWT_SEGREDO` (mínimo de 32
  caracteres), válido por **15 minutos**.
  - Payload: `sub` (id do usuário), `perfil` e `unidadeId`
    (recepcionista/manutenção) **ou** `unidadeIds` (médico), além de `iat`,
    `exp`, `iss` e `aud`.
  - Vai no cabeçalho `Authorization: Bearer <token>`, como antes.
- **Refresh token:** 32 bytes aleatórios (`crypto.randomBytes`) em base64url,
  opaco, válido por **7 dias**.
  - O banco guarda só o SHA-256, em `sessoes.token_hash` (UNIQUE). Um vazamento
    da tabela não entrega tokens utilizáveis. Como o token tem 256 bits de
    entropia, um hash rápido basta e o bcrypt não é necessário.
- **Perfil e unidades são lidos do banco** a cada `entrar` e `renovar`. As
  unidades do médico vêm de `medicos_unidades`, pelo médico ligado à conta.
  Não existe mais cópia para sincronizar.

### Rotas (em `/api/v1/auth`)

| Rota                        | O que faz                                                                                                                                                                       |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `POST /entrar`              | E-mail e senha → `{tokenAcesso, tokenRenovacao, tipo, expiraEm}`. Credencial errada: 401 `CREDENCIAIS_INVALIDAS`. Conta inativa, **com a senha certa**: 403 `CONTA_DESATIVADA`. |
| `POST /renovar`             | Recebe o refresh token, **revoga-o e emite um par novo** (rotação a cada uso). Token desconhecido, expirado ou revogado: 401 `NAO_AUTENTICADO`.                                 |
| `POST /sair`                | Revoga a sessão do refresh token informado. Responde 204 sempre, inclusive se o token já não valer: sair é idempotente.                                                         |
| `POST /esqueci-senha`       | Responde **204 sempre**, exista a conta ou não. O e-mail é enviado fora do ciclo da resposta, para o tempo não revelar nada.                                                    |
| `POST /redefinir-senha`     | Token do link + nova senha. Troca o hash, marca o token como usado e **revoga todas as sessões** da conta.                                                                      |
| `POST /cadastro`, `GET /me` | Continuam como estavam. O cadastro passa a gravar o `senha_hash` na mesma transação do usuário.                                                                                 |

Todas as rotas acima, menos `/me`, têm limite de requisições por IP, como o
cadastro já tinha.

### Detecção de reúso

Cada linha de `sessoes` é um refresh token. Quando ele é rotacionado, a linha
recebe `revogada_em` e aponta para a nova em `substituida_por_id`. Se um token
**já rotacionado** for apresentado de novo, a API conclui que ele vazou: quem
tem o token legítimo é a pessoa ou o atacante, e não há como saber qual. A API
então **revoga todas as sessões ativas daquele usuário** e responde 401. A
pessoa precisa entrar de novo em todos os aparelhos.

### Recuperação de senha

- Tabela `redefinicoes_senha`: guarda o SHA-256 do token (32 bytes aleatórios),
  com validade de **1 hora** e **uso único** (`usado_em`). Pedir um link novo
  invalida os anteriores ainda não usados.
- O link segue o formato `APP_URL/redefinir-senha?token=…` e abre a tela
  `(publico)/redefinir-senha.tsx`, onde a pessoa digita a nova senha.
- **O token não fica no endereço.** Na web, a tela lê o token da URL e, logo
  em seguida, tira-o da barra de endereço com
  `history.replaceState(null, '', '/redefinir-senha')`. Assim ele não fica no
  histórico do navegador, não aparece num print da tela e não é copiado por
  quem compartilhar o endereço. O token passa a viver só no estado da tela até
  o envio.
- **O token não vaza por `Referer`.** O Firebase Hosting envia
  `Referrer-Policy: no-referrer` em todas as respostas do PWA (`firebase.json`),
  então nenhuma requisição saindo da página leva o endereço com o token. A API
  já envia o mesmo cabeçalho pelo Helmet.
- O envio fica atrás da interface `EnviadorEmail`, escolhida por
  `EMAIL_PROVEDOR`:
  - `log`: só desenvolvimento e testes. Registra o link no log da API.
    **Proibido em produção**: a API não sobe com essa combinação, porque o
    link no log é uma credencial.
  - `resend`: API HTTP do Resend (`RESEND_API_KEY`).
  - `smtp`: qualquer servidor SMTP (`SMTP_HOST`, `SMTP_PORTA`, `SMTP_USUARIO`,
    `SMTP_SENHA`).

### Middleware

- `middlewares/autenticar.ts` verifica a assinatura, a expiração, o `iss` e o
  `aud` do JWT e monta `req.usuario` a partir do payload.
- `exigirPerfil` e `exigirUnidade` não mudam: continuam lendo `perfil`,
  `unidadeId` e `unidadeIds` de `req.usuario`.

### No app (React Native e PWA)

- O pacote `firebase` sai do app.
- O access token fica **só em memória**.
- O refresh token fica no `expo-secure-store` (Keychain/Keystore) no Android e
  no iOS, e no `localStorage` na web.
- Quando a API responde 401, o cliente renova uma única vez e repete a
  requisição. Várias requisições que falham juntas esperam a **mesma**
  renovação: duas renovações paralelas com o mesmo token seriam tomadas por
  reúso e derrubariam a sessão.
- **Na web, a renovação também é serializada entre abas.** Todas as abas do
  PWA compartilham o mesmo refresh token no `localStorage`, mas cada uma tem o
  seu access token em memória. Sem coordenação, duas abas que recebem 401 ao
  mesmo tempo mandariam o mesmo refresh token para `/renovar`. A segunda seria
  tomada por reúso e derrubaria todas as sessões da pessoa: um **falso reúso**.
  Por isso:
  1. A renovação roda dentro de `navigator.locks.request('saude-palma:renovacao', …)`
     ([Web Locks API](https://developer.mozilla.org/docs/Web/API/Web_Locks_API)),
     um lock exclusivo do navegador para aquela origem, compartilhado entre
     abas e janelas.
  2. **Depois de obter o lock**, a aba relê o refresh token do `localStorage`,
     em vez de usar o valor que tinha quando recebeu o 401. Se outra aba
     renovou enquanto ela esperava, a releitura traz o token novo e a
     renovação usa esse token, sem reúso.
  3. Se o `localStorage` estiver vazio depois do lock (outra aba saiu da
     conta), a aba também sai, sem chamar a API.
  4. Navegadores sem Web Locks ficam só com a serialização dentro da aba. No
     pior caso, a pessoa precisa entrar de novo; nenhum dado é exposto.

  A lógica fica num módulo puro do app, com o armazenamento, o lock e a
  chamada à API injetados, e é testada com duas "abas" simuladas que dividem
  o mesmo armazenamento. No Android e no iOS há uma só instância do app, e
  basta a serialização interna.

## Consequências

- **Variáveis de ambiente.** O `JWT_SEGREDO` passa a ser obrigatório e é
  validado por Zod na inicialização. Trocá-lo derruba todos os access tokens
  em até 15 minutos; os refresh tokens continuam válidos, porque não dependem
  dele. As variáveis de e-mail também são validadas: com `EMAIL_PROVEDOR=resend`
  sem `RESEND_API_KEY`, por exemplo, a API não sobe.
- **Revogação não é imediata.** O access token não é consultado no banco a cada
  requisição. Desativar uma conta ou tirar um médico de uma unidade revoga as
  sessões na hora, mas um access token já emitido continua válido por **até
  15 minutos**. Com o Firebase, `verifyIdToken(token, true)` recusava na hora,
  então este é um risco aceito e conhecido. Se for preciso derrubar alguém
  imediatamente, o caminho é trocar o `JWT_SEGREDO`, o que derruba todo mundo.
- **Mudança de perfil ou unidade vale na próxima renovação** (até 15 minutos),
  sem `revokeRefreshTokens` nem `setCustomUserClaims`.
- **As contas do Firebase Auth não migram.** As senhas estão com o Google e o
  banco novo começa vazio ([ADR 0018](0018-postgresql-no-neon.md)). A primeira
  conta administrativa sai do seed, e quem tinha conta de teste se cadastra de
  novo.
- **Refresh token no `localStorage` (web) fica exposto a XSS.** Qualquer script
  que rode no PWA, seja uma dependência comprometida ou uma injeção, consegue
  ler o token e renová-lo em outro lugar por até 7 dias. A rotação com
  detecção de reúso limita o estrago: assim que o PWA legítimo renovar, o
  token roubado vira reúso e a família inteira cai. Mas a exposição existe.
  - **A alternativa correta** é um cookie `HttpOnly; Secure; SameSite=Strict`
    com o refresh token, que nenhum JavaScript lê. Isso exige servir o PWA e a
    API pelo **mesmo site**, por exemplo `app.dominio` e `app.dominio/api` atrás
    de um proxy reverso, ou `app.` e `api.` no mesmo domínio registrável.
  - Hoje, o PWA está em `*.web.app` e a API em `*.onrender.com`, que são sites
    diferentes. Um cookie entre eles precisaria de `SameSite=None` e esbarraria
    no bloqueio de cookies de terceiros dos navegadores. Fica para quando o
    projeto tiver domínio próprio, num ADR novo.
- **No celular**, o `expo-secure-store` guarda o refresh token no armazenamento
  seguro do sistema, fora do alcance de outros apps.
