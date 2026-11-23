import { Platform } from 'react-native';

/**
 * Esconde um desenho (SVG) do leitor de tela. No Android a propriedade é
 * importantForAccessibility; no navegador ela não existe (o React reclama) e
 * o equivalente é aria-hidden.
 */
export const svgDecorativo =
  Platform.OS === 'web'
    ? ({ 'aria-hidden': true } as const)
    : ({ importantForAccessibility: 'no-hide-descendants' } as const);
