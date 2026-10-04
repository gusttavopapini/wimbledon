import { useContext } from 'react';

import { ContextoTema } from '@/theme/TemaProvider';

export function useTema() {
  const tema = useContext(ContextoTema);
  if (!tema) throw new Error('useTema precisa estar dentro de <TemaProvider>.');
  return tema;
}
