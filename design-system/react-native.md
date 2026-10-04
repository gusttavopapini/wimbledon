# React Native

Como levar o sistema para o app em Expo (Android, PWA via react-native-web e TV). Os componentes da prévia são a referência viva de aparência e comportamento; no app eles são reescritos com primitivas do React Native seguindo as mesmas regras.

## Tokens

Gere um arquivo de tema a partir de `tokens.json`, com um objeto por modo de cor:

```ts
export const cores = {
  claro: { primaria: '#015F68', primariaEscura: '#014A52', primariaClara: '#03757F', teal50: '#F2F8F9',
    superficie: '#FFFFFF', texto: '#1A1A1A', textoSecundario: '#4A6B6F', textoSobrePrimaria: '#FFFFFF',
    bordaCampo: 'rgba(1, 95, 104, 0.4)', contorno: '#015F68', anelFoco: '#014A52',
    sucesso: '#1B6E3A', erro: '#B3261E', atencao: '#8A5300', textoSobreStatus: '#FFFFFF' },
  altoContraste: { primaria: '#FFD54F', primariaEscura: '#FFFFFF', primariaClara: '#000000', teal50: '#1A1A1A',
    superficie: '#000000', texto: '#FFFFFF', textoSecundario: '#E0E0E0', textoSobrePrimaria: '#000000',
    bordaCampo: '#FFFFFF', contorno: '#FFFFFF', anelFoco: '#FFD54F',
    sucesso: '#7FE0A0', erro: '#FF8A80', atencao: '#FFB74D', textoSobreStatus: '#000000' },
};
export const espacamento = { espacamento4: 4, espacamento8: 8, espacamento12: 12, espacamento16: 16, espacamento24: 24, espacamento32: 32, espacamento48: 48 };
export const raio = { raioCartao: 32, raioBotao: 28, raioCampo: 28, raioCartaoInterno: 16, raioChip: 9999 };
export const tipo = { display: [40, 48, '700'], tituloTela: [32, 40, '700'], tituloSecao: [24, 32, '700'], subtitulo: [20, 28, '400'],
  corpo: [18, 28, '400'], corpoForte: [18, 28, '700'], rotulo: [16, 24, '700'], apoio: [16, 24, '400'] };
export const FATOR_LETRA_GRANDE = 22 / 18;
```

Carregue a Heebo com `@expo-google-fonts/heebo` (Heebo_400Regular, Heebo_700Bold).

## Regras de implementação

- **Tamanho de texto:** `allowFontScaling` ligado em todo `Text`, sem `maxFontSizeMultiplier`. Multiplique a escala por `FATOR_LETRA_GRANDE` quando o ajuste "Letra grande" estiver ligado. Teste com a fonte do sistema a 200%.
- **Alturas mínimas, nunca fixas:** `minHeight: 56` (botão), `minHeight: 64` (principal), `minHeight: 48` (alvos). Nada de `height` em contêiner com texto.
- **Layout que se adapta:** com `PixelRatio.getFontScale() > 1.2` ou letra grande, a grade de especialidades vira lista (acima de 1,8 o círculo do ícone sai) e a navegação pode ocupar duas linhas.
- **Alvos:** `hitSlop` não substitui o tamanho visível; use-o só para chegar a 48×48 em controles embutidos.
- **Leitor de tela:** `accessibilityRole` (`button`, `link`, `header`, `alert`, `tab`), `accessibilityLabel` igual ao texto visível, `accessibilityState` para selecionado, desabilitado e ocupado. Banner de emergência: `AccessibilityInfo.announceForAccessibility` ao aparecer.
- **Alto contraste automático:** respeite `AccessibilityInfo.isHighTextContrastEnabled` (Android) e o ajuste do app.
- **Menos movimento:** `AccessibilityInfo.isReduceMotionEnabled` para parar o indicador de carregamento.
- **Foco por teclado e controle remoto** (PWA e TV): mostre `sombraFoco` como borda dupla (3px `superficie` + 3px `anelFoco`) no estado `focused` do `Pressable`.
- **Ícones:** `lucide-react-native` com `strokeWidth={2}`; os 5 ícones de especialidade próprios entram via `react-native-svg` a partir dos SVG do grupo Especialidades.
- **Painel de TV:** uma `View` de 1920×1080 escalada para a tela, `expo-keep-awake`, sem elementos focáveis.
