# EstadoTela

Estado de tela inteira para carregando, vazio e erro, sempre com um título e uma frase em linguagem simples.

## O que você fornece
`tipo` e, se quiser trocar o padrão, `titulo`, `mensagem`, `icone`, `rotuloAcao` e `aoAgir`.

| tipo | Título padrão | Ação |
|---|---|---|
| carregando | Carregando suas consultas | nenhuma ("Não precisa fazer nada.") |
| vazio | Você ainda não tem consultas marcadas | Marcar consulta |
| erro | Não conseguimos carregar suas consultas | Tentar de novo |

## Regras
- Diga o que está carregando, nunca só "Carregando…".
- Vazio explica o que vai aparecer ali e como fazer aparecer.
- Erro tranquiliza ("Suas consultas continuam marcadas") e diz o que fazer.
- O indicador gira devagar e para se o sistema pedir menos movimento.
