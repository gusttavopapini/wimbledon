# DialogoConfirmacao

Diálogo para ações que não têm volta: uma pergunta, o que vai acontecer e dois botões que dizem a ação inteira.

## O que você fornece
`aberto`, `titulo` (a pergunta: "Cancelar a consulta?"), `mensagem` (consequência, com data por extenso), `rotuloConfirmar` ("Sim, cancelar a consulta"), `rotuloVoltar` ("Não, manter a consulta"), `aoConfirmar`, `aoVoltar`. `destrutivo` é verdadeiro por padrão.

## Regras
- Nunca "OK"/"Cancelar" nem "Sim"/"Não" sozinhos.
- Os dois botões ficam empilhados, largura total. A ação confirmada fica embaixo, no lugar do botão principal de todas as telas.
- O foco começa no botão de voltar. Esc, o Voltar do Android e tocar fora fecham sem fazer nada.
- Sem tempo limite.
