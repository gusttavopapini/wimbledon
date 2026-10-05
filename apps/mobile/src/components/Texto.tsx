import { Text, type TextProps } from 'react-native';

import { useTema } from '@/hooks/useTema';
import type { NomeCor, NomeEstiloTexto } from '@/theme/tema';

export interface TextoProps extends TextProps {
  estilo?: NomeEstiloTexto;
  cor?: NomeCor;
}

/**
 * Todo texto do app passa por aqui: estilo da escala tipográfica (já trocado
 * pela "Letra grande" quando ligada), cor do tema e allowFontScaling sempre
 * ligado, sem maxFontSizeMultiplier.
 */
export function Texto({ estilo = 'corpo', cor = 'texto', style, ...resto }: TextoProps) {
  const tema = useTema();
  return (
    <Text
      {...resto}
      allowFontScaling
      style={[tema.tipo[estilo], { color: tema.cores[cor] }, style]}
    />
  );
}
