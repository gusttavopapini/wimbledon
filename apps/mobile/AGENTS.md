# AGENTS.md — apps/mobile

Complementa o `AGENTS.md` da raiz. Vale para app, PWA e painel de TV (mesmo projeto Expo).

## Regras de dados

- **Nunca importar `firebase/firestore`.** O Firebase JS SDK é usado só para login (Firebase Auth). Todo dado vem da API via Axios + TanStack Query.
- O painel de TV não usa Firebase Auth: token de dispositivo e SSE da API.
- Nenhuma regra de negócio no cliente; o cliente exibe e envia, a API decide.
- Variáveis públicas só com prefixo `EXPO_PUBLIC_`. Nunca expor credenciais do Admin SDK, `PAINEL_TOKEN_SECRET` ou chaves de API.
- Formulários: React Hook Form + Zod. Rotas com Expo Router, organizadas por perfil (`app/(paciente)`, `(recepcao)`, `(medico)`, `(manutencao)`, `(admin)`, `(painel)`).

## UX e acessibilidade (público idoso, WCAG 2.2 AA)

- Fonte base 18 px (22 px no modo letra grande); botões com altura mínima de 56 dp; alvos de 48 × 48 dp; contraste ≥ 4,5:1 (meta 7:1).
- Tokens vêm de `design-system/tokens.json` via `npm run tema` (gera `src/theme/tokens.ts`). Não escreva cores ou tamanhos soltos no componente; use os tokens. A identidade é o azul-petróleo (teal; primária `#015f68` no tema claro, amarelo `#ffd54f` no alto contraste), que substitui a paleta azul antiga do DAES. `sucesso`, `erro` e `atencao` vêm sempre com ícone e texto.
- Uma decisão por tela; agendamento em até 5 telas após o login; linguagem simples; datas por extenso; confirmação antes de ações irreversíveis.
- `accessibilityLabel` em todos os elementos interativos; layout testado com fonte a 200%.
- Painel de TV: legível a 5 m (nome ≥ 72 px, consultório ≥ 96 px, fundo #1A1A1A, texto #FFFFFF, destaque #FFD54F, contraste ≥ 7:1); alerta sonoro de ~1 s antes da voz; sem piscar; a exibição deve funcionar mesmo se o áudio falhar.

## Testes

`npm test -w @saude/mobile` e `npm run tipos -w @saude/mobile`. Teste máscaras, validações e tradução de erros da API para mensagens em linguagem simples.
