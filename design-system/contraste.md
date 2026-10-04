# Contraste

Razão de contraste (WCAG 2) de cada par de cor sobre o fundo em que é usado. Meta do produto: 7:1. Mínimos AA: 4,5:1 para texto, 3:1 para texto de 24px ou mais e 3:1 para bordas de controle, anéis de foco e ícones que carregam significado. Cores com transparência foram compostas sobre o fundo antes da conta. A página `AmostraContraste`, em Componentes, faz a mesma conta ao vivo no tema escolhido.

| Par | Claro | Alto contraste |
|---|---|---|
| `texto` sobre `superficie` | 17,40:1 · AAA ✓ meta | 21,00:1 · AAA ✓ meta |
| `texto` sobre `teal50` | 16,22:1 · AAA ✓ meta | 17,40:1 · AAA ✓ meta |
| `primaria` sobre `superficie` | 7,40:1 · AAA ✓ meta | 14,88:1 · AAA ✓ meta |
| `primaria` sobre `teal50` | 6,90:1 · AA (abaixo da meta) | 12,33:1 · AAA ✓ meta |
| `primariaEscura` sobre `superficie` | 9,99:1 · AAA ✓ meta | 21,00:1 · AAA ✓ meta |
| `primariaEscura` sobre `teal50` | 9,31:1 · AAA ✓ meta | 17,40:1 · AAA ✓ meta |
| `textoSecundario` sobre `superficie` | 5,80:1 · AA (abaixo da meta) | 15,91:1 · AAA ✓ meta |
| `textoSecundario` sobre `teal50` | 5,40:1 · AA (abaixo da meta) | 13,18:1 · AAA ✓ meta |
| `textoSobrePrimaria` sobre `primaria` | 7,40:1 · AAA ✓ meta | 14,88:1 · AAA ✓ meta |
| `textoSobrePrimaria` sobre `primariaEscura` | 9,99:1 · AAA ✓ meta | 21,00:1 · AAA ✓ meta |
| `textoSobrePrimaria` sobre `primariaClara` | 5,45:1 · só texto ≥24px | — (não usado) |
| `textoSobreStatus` sobre `erro` | 6,54:1 · AA (abaixo da meta) | 9,20:1 · AAA ✓ meta |
| `textoSobreStatus` sobre `atencao` | 6,33:1 · AA (abaixo da meta) | 12,13:1 · AAA ✓ meta |
| `textoSobreStatus` sobre `sucesso` | 6,29:1 · AA (abaixo da meta) | 13,07:1 · AAA ✓ meta |
| `sucesso` sobre `superficie` | 6,29:1 · AA (abaixo da meta) | 13,07:1 · AAA ✓ meta |
| `erro` sobre `superficie` | 6,54:1 · AA (abaixo da meta) | 9,20:1 · AAA ✓ meta |
| `atencao` sobre `superficie` | 6,33:1 · AA (abaixo da meta) | 12,13:1 · AAA ✓ meta |
| `contorno` sobre `superficie` (borda) | 7,40:1 · passa (3:1) | 21,00:1 · passa (3:1) |
| `anelFoco` sobre `superficie` (foco) | 9,99:1 · passa (3:1) | 14,88:1 · passa (3:1) |
| `bordaCampo` sobre `superficie` (borda) | **1,98:1 · não passa (mín. 3:1)** | 21,00:1 · passa (3:1) |
| `painelTexto` sobre `painelFundo` | 17,40:1 · AAA ✓ meta | 17,40:1 · AAA ✓ meta |
| `painelDestaque` sobre `painelFundo` | 12,33:1 · AAA ✓ meta | 12,33:1 · AAA ✓ meta |

O modo letra grande usa as cores do claro.

## O que ainda não atinge a meta

- **`bordaCampo` falha o mínimo.** `primaria` a 40% vira #99BFC3 sobre branco: 1,98:1, abaixo dos 3:1 que o critério 1.4.11 pede para o contorno de um campo. O valor foi mantido como especificado. Correção recomendada: subir a opacidade para 65% (#5A979D, 3,31:1) ou 70% (#4D8F95, 3,70:1). O rótulo sempre visível acima do campo reduz o problema, mas não o resolve para quem procura a área de toque.
- **Estados e `textoSecundario` ficam entre 5,4:1 e 6,9:1.** Passam AA, mas não a meta de 7:1. Por isso nunca carregam informação sozinhos: todo estado tem ícone e texto, e `textoSecundario` só vai em apoio. Para quem precisa de mais, o alto contraste leva todos esses pares acima de 9:1.
- **`sucesso` e `erro` têm a mesma luminosidade (1,04:1 entre si).** Quem não distingue vermelho de verde depende do ícone e da palavra, que são obrigatórios.
- **`primaria` sobre `teal50`** (6,90:1) fica um centésimo abaixo de 7:1: é o ícone dentro do círculo de especialidade, sempre com o nome escrito ao lado.
