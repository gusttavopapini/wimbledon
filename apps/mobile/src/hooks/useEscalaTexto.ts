import { useWindowDimensions } from 'react-native';

import { useTema } from './useTema';

/**
 * Quanto o texto está crescendo: o ajuste de fonte do sistema (fontScale) e o
 * modo Letra grande do app. Os componentes reorganizam o layout com isso, como
 * as consultas de contêiner do design system.
 */
export function useEscalaTexto() {
  const { fontScale } = useWindowDimensions();
  const { letraGrande } = useTema();
  return {
    fontScale,
    letraGrande,
    /** A grade de especialidades vira lista: letra grande ou fonte acima de ~120%. */
    gradeViraLista: letraGrande || fontScale > 1.2,
    /** Perto de 200%, o círculo do ícone sai para o nome caber inteiro. */
    semCirculo: fontScale > 1.8,
    /** Fonte muito grande: a navegação vira duas linhas de dois itens. */
    navegacaoEmDuasLinhas: fontScale * (letraGrande ? 1.22 : 1) > 1.6,
  };
}
