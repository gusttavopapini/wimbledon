# Mensagem

Retorno em texto depois de uma ação — sucesso, erro, atenção ou informação —, com ícone, título do que aconteceu e o que fazer.

*Adição intencional:* o princípio "feedback sempre em texto" precisa de um componente que carregue esse texto; é também o único uso de `sucesso` e `atencao` fora dos selos.

## O que você fornece
`tipo`, `titulo` (o que aconteceu, curto), `children` (o que fazer agora) e `acao` opcional (um `Botao`).

## Regras
- Fica na tela até a pessoa sair dela. Nada de mensagem que some sozinha (toast).
- Erro diz o que fazer: "Esse horário acabou de ser ocupado. Escolha outro horário." Nunca códigos ("Erro 500").
- `erro` é anunciado como alerta; os outros, como status.
