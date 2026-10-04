# Chip

Pílula de 48px de altura para filtrar uma lista (filtro) ou mostrar uma especialidade (especialidade).

## O que você fornece
- `tipo="filtro"` (padrão): `selecionado` e `aoTocar(novoEstado)`. O selecionado tem fundo cheio **e** sinal de visto — nunca só a cor. Leitor de tela ouve "selecionado" (`aria-pressed`).
- `tipo="especialidade"`: `especialidade` (id do ícone) e o nome como `children`. Sem `aoTocar` é só uma etiqueta; com `aoTocar` ganha contorno e vira botão.
- `GrupoChips` com `rotulo` em volta de cada conjunto.

## Regras
- Chips quebram linha. Nunca rolagem horizontal.
- 8px entre chips (`respiroEntreAlvos`).
- Texto curto, 1 a 3 palavras.
