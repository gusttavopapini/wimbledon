# NavegacaoInferior

Barra de navegação inferior com 4 destinos fixos, ícone e rótulo sempre visíveis.

## O que você fornece
`ativo` (id do destino atual) e `aoNavegar(id)`. Os destinos padrão são Início, Consultas, Meu perfil e Ajustes; `itens` permite trocar, mas são sempre 4.

## Item ativo
Marcado por quatro sinais ao mesmo tempo: cor (`primariaEscura`), peso (negrito), fundo `teal50` e uma marca de 4px no alto. No alto contraste: amarelo com contorno.

## Regras
- Rótulo sempre visível, nunca só ícone. O texto nunca é cortado nem quebrado no meio da palavra.
- Com letra grande, "Meu perfil" quebra em duas linhas; com fonte do sistema muito grande a barra passa para duas linhas de dois itens. Nada de rolagem horizontal.
- `aria-current="page"` no ativo. No React Native: `accessibilityRole="tab"` e `accessibilityState={{ selected }}`.
