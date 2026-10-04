# ListaFila

Fila de atendimento com a posição em número grande, o nome abreviado e o status de cada pessoa; a linha da própria pessoa é destacada.

## O que você fornece
`titulo`, `itens` (`posicao`, `nome`, `status`, `voce`) e `previsao` opcional ("Previsão: cerca de 20 minutos.").

## Destaque da sua posição
Resumo no alto em `primaria` ("Você é o 3º da fila" + quantas pessoas antes) e, na lista, a linha com borda de 3px, fundo `teal50`, negrito, posição preenchida e a palavra "Você".

## Privacidade
Mostre só primeiro nome e inicial do sobrenome ("Ana S."). Nunca CPF nem nome completo de outras pessoas.

## Regras
- A previsão é sempre "cerca de", nunca um horário exato.
- O resumo é anunciado ao mudar (`role="status"`). Não atualize a lista com animação.
