# BannerEmergencia

Aviso vermelho de emergência com orientação de ligar 192 — o componente mais crítico do sistema e impossível de ignorar.

## Quando aparece
Quando a pré-triagem identifica sinais de alarme. Ele substitui o conteúdo da tela: aparece no topo, antes de qualquer outra coisa, e a conversa com a IA para.

## O que você fornece
Nada é obrigatório. `titulo`, `mensagem`, `telefone` (padrão "192") e `complemento` podem ser trocados, mas o padrão já está em linguagem simples:
> Procure atendimento de emergência agora. Pelo que você contou, seus sintomas podem ser graves. Ligue para o SAMU no 192 ou peça para alguém levar você ao pronto-socorro mais próximo.

## Como ele se impõe
- Fundo `erro`, texto `textoSobreStatus` (6,5:1), anel duplo vermelho em volta, ícone de sirene de 40px num círculo branco.
- Botão "Ligar para o 192" de 64px, largura total, que abre o discador (`tel:192`).
- `role="alert"`: o leitor de tela anuncia na hora.
- Sem botão de fechar, sem tempo para sumir, sem piscar, sem som obrigatório.

## Regras
- Nunca use este componente para outra coisa. Vermelho cheio fica reservado para ele, para o botão destrutivo e para o selo de emergência.
- No React Native: `accessibilityRole="alert"`, `AccessibilityInfo.announceForAccessibility` ao montar e `Linking.openURL('tel:192')`.
