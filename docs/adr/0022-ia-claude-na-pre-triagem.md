# ADR 0022 — Claude (Anthropic) na pré-triagem, atrás de `ProvedorIA`

- **Status:** aceita
- **Data:** 2026-11-22
- **Substitui:** a escolha do Google Gemini (família Flash) no DAES v2.0, seção IA

## Contexto

O DAES v2.0 previa o Gemini via `@google/genai`. A equipe tem créditos da API
da Anthropic e quer usar o Claude também no agente do WhatsApp (N8N), para ter
um só fornecedor. A arquitetura já isolava a IA atrás da interface `ProvedorIA`.

## Decisão

- A pré-triagem usa o **Claude** pela Messages API (`fetch` direto, sem SDK),
  modelo configurável em `ANTHROPIC_MODEL` (padrão `claude-haiku-5-5`, o mais
  barato e rápido). A chave fica só no servidor: `ANTHROPIC_API_KEY`.
- O contrato não muda: a saída `{especialidade, confianca, urgencia,
sinaisAlerta, justificativa, orientacao}` é validada com Zod; JSON inválido ou
  confiança < 0,5 vira Clínico geral.
- Os **sinais de alerta** continuam checados por palavras-chave na API antes da
  IA. Em alerta: SAMU 192 (e CVV 188 em autolesão) e nenhum chamado aberto.
- **RN12:** só idade, sexo informado e relato vão para a IA. O relato vai
  dentro de `<relato_do_paciente>` e o prompt manda ignorar instruções nele.
- Sem chave (ou com a IA fora do ar), a API usa o provedor de palavras-chave
  (`integrations/ia/palavrasChave.ts`): o paciente nunca fica travado.

## Consequências

- Trocar de fornecedor de novo é escrever outro `ProvedorIA`.
- Dados reais de saúde exigem contrato e política de retenção com o
  fornecedor. Na demonstração, só dados fictícios.
- O DAES precisa ser atualizado na seção de IA (Gemini → Claude).
