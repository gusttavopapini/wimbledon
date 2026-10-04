# Campo

Campo de entrada com rótulo sempre visível acima, dica, erro que diz o que fazer e variantes texto, senha, data, CPF e busca.

## O que você fornece
- `rotulo` (obrigatório): fica sempre visível acima do campo. Não existe rótulo flutuante nem placeholder no lugar de rótulo — o placeholder some quando a pessoa digita.
- `ajuda`: formato e exemplo, entre o rótulo e o campo ("Dia, mês e ano. Exemplo: 12/03/1948"). Fica acima para não ser coberta pelo teclado.
- `erro`: aparece acima da caixa, com ícone e a palavra "Erro" para leitores de tela. Diz o que fazer: "Falta 1 número. Confira no seu documento e digite os 11 números." Nunca só "CPF inválido".
- `tipo`:
  - `texto` (padrão; use `tipoHtml="email"` e `autoComplete` para e-mail)
  - `senha`: botão "Mostrar"/"Ocultar" escrito, com alvo de 48×48
  - `data`: máscara dd/mm/aaaa, teclado numérico, e confirmação por extenso logo abaixo ("Sexta-feira, 12 de março de 1948")
  - `cpf`: máscara 000.000.000-00 e teclado numérico; valide com `cpfValido`
  - `busca`: lupa à esquerda e botão "Limpar" quando há texto
- `valor` + `aoMudar` (controlado) ou `valorInicial` (livre). `aoMudar` recebe o valor já mascarado.

## Estados
Vazio · Preenchido · Foco (borda `primaria` + `sombraFoco`) · Erro (borda `erro` mais grossa + mensagem) · Desabilitado (fundo `teal50`, borda tracejada).

## Atenção: borda em repouso
A borda em repouso usa `bordaCampo` (`primaria` a 40%), como especificado. Ela mede 1,98:1 sobre branco, abaixo dos 3:1 do WCAG 1.4.11. O rótulo visível acima ajuda a identificar o campo, mas a correção recomendada está na seção Contraste.

## Regras
- Um campo por linha, largura total. Nada de campos lado a lado.
- Valide ao sair do campo ou ao tocar no botão principal — nunca a cada tecla.
- Peça só o que é necessário e diga por quê na dica quando não for óbvio (ex.: CPF).
- Sem tempo limite para preencher.
- No React Native: `TextInput` com `accessibilityLabel` igual ao rótulo, `accessibilityHint` com a dica, `keyboardType="number-pad"` em CPF e data, `textContentType`/`autoComplete` corretos.
