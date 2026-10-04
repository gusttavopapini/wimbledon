# CabecalhoTela

Cabeçalho das telas internas: botão "Voltar" escrito, título da tela e subtítulo opcional, alinhados à esquerda.

## O que você fornece
`titulo`, `subtitulo` opcional, `aoVoltar` (ou `null` para esconder) e `rotuloVoltar` (padrão "Voltar"; pode dizer o destino: "Voltar ao início").

## Regras
- O Voltar é sempre um botão secundário com seta **e** a palavra. Nunca só a seta.
- Título em `tituloTela` com `primariaEscura`, alinhado à esquerda: quem usa lupa ou zoom encontra o começo do texto sem procurar.
- O título é o `h1` da tela e diz onde a pessoa está ("Minhas consultas"), não a ação.
