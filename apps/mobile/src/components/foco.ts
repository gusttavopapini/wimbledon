import type { ViewStyle } from 'react-native';

import type { PaletaCores } from '@/theme/tema';

/**
 * sombraFoco do design system: 3px de superficie + 3px de anelFoco. Aparece no
 * foco por teclado e controle remoto (PWA e TV).
 */
export function estiloFoco(cores: PaletaCores, espessura: number): ViewStyle {
  return {
    boxShadow: `0 0 0 ${espessura}px ${cores.superficie}, 0 0 0 ${espessura * 2}px ${cores.anelFoco}`,
  };
}
