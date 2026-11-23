import { createContext, useContext, type ReactNode } from 'react';
import { View } from 'react-native';

/**
 * Largura máxima do conteúdo no computador e no tablet deitado. No celular a
 * tela é mais estreita que isso e o conteúdo ocupa tudo, como antes.
 * - padrao: telas do paciente e de entrada (formulários com uma coluna);
 * - larga: áreas da equipe (listas, agendas, indicadores).
 */
export const LARGURA_MAXIMA = { padrao: 720, larga: 1120 } as const;

const ContextoLargura = createContext<number>(LARGURA_MAXIMA.padrao);

export function ProvedorLargura({ larga, children }: { larga?: boolean; children: ReactNode }) {
  return (
    <ContextoLargura.Provider value={larga ? LARGURA_MAXIMA.larga : LARGURA_MAXIMA.padrao}>
      {children}
    </ContextoLargura.Provider>
  );
}

export function useLarguraMaxima(): number {
  return useContext(ContextoLargura);
}

/** Centraliza o conteúdo e limita a largura; o fundo continua ocupando a tela toda. */
export function Centro({ children, gap }: { children: ReactNode; gap?: number }) {
  const maxWidth = useLarguraMaxima();
  return <View style={{ width: '100%', maxWidth, alignSelf: 'center', gap }}>{children}</View>;
}
