# CartaoEspecialidade

Botão com o ícone vetorial da especialidade num círculo de 88px e o nome escrito embaixo.

## O que você fornece
- `especialidade`: um dos ids de `ESPECIALIDADES` (cardiologia, clinicoGeral, gastroenterologia, neurologia, ortopedia, ginecologia, dermatologia, imunologia, obstetricia, pediatria, oftalmologia, otorrinolaringologia, pneumologia).
- `nome` opcional (padrão: o da lista), `aoTocar`.
- Coloque os cartões dentro de `GradeEspecialidades`.

## Layout
- **grade** (padrão): 2 colunas em 390px. Três colunas não cabem: "Gastroenterologia" em 18px negrito precisa de ~160px.
- **lista**: uma linha por especialidade, com contorno e seta. A grade vira lista sozinha no modo letra grande (`data-theme="letragrande"` ou `.letra-grande`) e quando a fonte do sistema passa de ~120% (consulta de contêiner em rem). Perto de 200% o círculo some para o nome caber inteiro. No React Native, faça o mesmo com `PixelRatio.getFontScale()`: lista acima de 1,2; sem círculo acima de 1,8.

## Regras
- O nome é sempre escrito; o ícone ajuda, não substitui.
- Nomes completos e corretos: "Gastroenterologia", "Dermatologia".
