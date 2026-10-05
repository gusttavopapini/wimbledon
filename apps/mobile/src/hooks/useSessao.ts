import { useContext } from 'react';

import { ContextoSessao } from '@/auth/SessaoProvider';

export function useSessao() {
  const sessao = useContext(ContextoSessao);
  if (!sessao) throw new Error('useSessao precisa estar dentro de <SessaoProvider>.');
  return sessao;
}
