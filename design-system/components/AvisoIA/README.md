# AvisoIA

Aviso persistente de que a orientação da inteligência artificial não substitui a avaliação de um profissional.

## Variantes
- **completo**: no início e no fim da pré-triagem e na tela de resultado. Título "Esta orientação não é uma consulta" e uma frase de explicação.
- **compacto**: fixo acima da conversa da pré-triagem, em uma linha e meia.

## Regras
- Aparece em toda tela que mostra orientação da IA. Não fecha, não recolhe, não some ao rolar.
- Fundo `teal50`, texto `primariaEscura` (9,3:1), ícone de informação. Não é alerta vermelho: é um lembrete calmo.
- `role="note"`. No React Native, um `View` com `accessibilityRole="text"` lido antes da conversa.
