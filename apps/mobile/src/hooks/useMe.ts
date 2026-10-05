import { useQuery } from '@tanstack/react-query';

import { buscarMe } from '@/api/auth';
import { CHAVE_ME } from '@/auth/SessaoProvider';

import { useSessao } from './useSessao';

/** Dados de GET /auth/me, buscados de novo ao abrir a tela (mesmo cache da sessão). */
export function useMe() {
  const { usuario } = useSessao();
  return useQuery({
    queryKey: [...CHAVE_ME, usuario?.id],
    queryFn: buscarMe,
    enabled: Boolean(usuario),
    refetchOnMount: 'always',
  });
}
