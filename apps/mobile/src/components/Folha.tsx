import type { ReactNode } from 'react';
import { View } from 'react-native';

import { useTema } from '@/hooks/useTema';

/**
 * Folha branca de 32px que sobe por cima do Topo (no alto contraste, encaixa
 * sem sobrepor). semTopo: telas internas, que começam no CabecalhoTela.
 */
export function Folha({ children, semTopo = false }: { children: ReactNode; semTopo?: boolean }) {
  const { cores, espacamento, raio, tamanho, modo } = useTema();
  const altoContraste = modo === 'altoContraste' || semTopo;
  return (
    <View
      style={{
        marginTop: altoContraste ? 0 : -espacamento.espacamento32,
        paddingTop: semTopo ? espacamento.espacamento24 : espacamento.espacamento32,
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
