# Botao

Botão de ação com rótulo escrito, em 4 variantes e 5 estados, com no mínimo 56px de altura.

## Quando usar
- **primario**: a ação que a pessoa veio fazer na tela. No máximo um por tela.
- **secundario**: alternativa à principal ("Ver outros horários", "Criar minha conta").
- **terciario**: ação de baixa importância, sublinhada como link ("Esqueci minha senha").
- **destrutivo**: ação que apaga ou cancela algo. Sempre passa por um `DialogoConfirmacao`.

## O que você fornece
- `children`: o rótulo. Um verbo que diz o que acontece: "Marcar consulta", "Confirmar chegada". Nunca "Enviar", "Submeter", "Prosseguir", "OK".
- `principal`: liga a altura de 64px e a largura total. Use na ação principal de toda tela, sempre no mesmo lugar (embaixo, depois do conteúdo).
- `icone` / `iconeFim`: opcionais, sempre junto do texto. Botão só com ícone não existe neste sistema.
- `carregando` + `rotuloCarregando`: troca o texto para o gerúndio ("Marcando consulta…") e ignora novos toques.
- `href`: vira link com cara de botão (ex.: `tel:192`).

## Estados
| Estado | Como aparece |
|---|---|
| Padrão | primário em `primaria` com `textoSobrePrimaria`; secundário com contorno de 2px |
| Pressionado | primário escurece para `primariaEscura`; secundário e terciário ganham fundo `teal50`; destrutivo inverte (fundo `superficie`, texto `erro`) |
| Desabilitado | fundo `teal50`, borda tracejada e texto `textoSecundario` (5,4:1, ainda legível) |
| Carregando | indicador girando (parado se o sistema pedir menos movimento) + texto no gerúndio |
| Foco por teclado | `sombraFoco`: 3px de `superficie` + 3px de `anelFoco` |

## Regras
- Altura mínima `alturaBotao` (56px); principal `alturaBotaoPrincipal` (64px). A altura é mínima: com letra grande o botão cresce e o texto quebra linha, nunca é cortado.
- 8px (`respiroEntreAlvos`) entre dois botões vizinhos. Botões empilhados, não lado a lado, quando houver mais de um na base da tela.
- Evite desabilitar. Deixe o botão ativo e, ao tocar, mostre uma mensagem que diz o que falta. Se precisar desabilitar, explique o motivo em texto logo acima.
- No React Native: `Pressable` com `accessibilityRole="button"`, `accessibilityState={{ disabled, busy }}` e `minHeight` (não `height`).
