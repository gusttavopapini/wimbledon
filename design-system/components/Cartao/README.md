# Cartao

Superfície branca que agrupa um assunto: cartão de conteúdo (32px), cartão interno (16px com contorno) ou alternativo (16px com fundo `teal50`).

## Quando usar
- **conteudo**: bloco principal sobre fundo colorido, com `sombraCartao`. Raio `raioCartao`, padding 24px.
- **interno**: um item dentro da tela (próxima consulta, orientação). Raio `raioCartaoInterno`, contorno de 2px em `contorno`.
- **alternativo**: informação de apoio que não é ação. Fundo `teal50`, sem borda.

## O que você fornece
`titulo` opcional (vira um `h2` em `tituloSecao`) e o conteúdo. Se o cartão inteiro for tocável, use `CartaoProfissional` ou `CartaoEspecialidade`, que já são botões.

## Regras
- Um assunto por cartão. Datas por extenso.
- Não use borda colorida só de um lado.
