import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useTema } from '@/hooks/useTema';

/** Folha branca de 32px que sobe por cima do Topo (no alto contraste, encaixa sem sobrepor). */
export function Folha({ children }: { children: ReactNode }) {
  const { cores, espacamento, raio, tamanho, modo } = useTema();
  const altoContraste = modo === 'altoContraste';
  return (
    <View
      style={{
        marginTop: altoContraste ? 0 : -espacamento.espacamento32,
        paddingTop: espacamento.espacamento32,
        paddingHorizontal: tamanho.margemLateral,
        paddingBottom: espacamento.espacamento24,
        backgroundColor: cores.superficie,
        borderTopLeftRadius: altoContraste ? 0 : raio.raioCartao,
        borderTopRightRadius: altoContraste ? 0 : raio.raioCartao,
        gap: espacamento.espacamento24,
        flexGrow: 1,
      }}
    >
      {children}
    </View>
  );
}
