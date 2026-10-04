# Topo

Faixa de topo em gradiente azul-petróleo com saudação, e a `Folha` branca de 32px que sobe por cima dela — a assinatura visual do app.

## O que você fornece
- `titulo` (em `display`, 40px): "Olá!", "Bom dia, Ana!".
- `subtitulo` (20px): uma frase.
- `antes`: opcional, acima do título (ex.: `Avatar`).
- `children`: opcional, abaixo (ex.: botão "Contar meus sintomas", que fica branco sobre o gradiente).
- Depois do `Topo`, envolva o conteúdo da tela em `Folha`.

## Cores
O fundo vai de `primaria` a `primariaEscura`. `primariaClara` aparece só na onda decorativa do canto superior direito, que recua para a borda antes da altura do subtítulo — nenhum texto menor que 24px fica sobre ela. Use esse canto para a ilustração da tela, se houver.

## Alto contraste
Sem gradiente e sem onda: fundo preto, texto branco e uma linha branca separando do conteúdo.

## Regras
- Só nas telas de entrada (Entrar, Cadastro, Início). As demais usam `CabecalhoTela`.
- Ilustrações pesadas (órgãos em 3D) não entram: use os ícones vetoriais.
