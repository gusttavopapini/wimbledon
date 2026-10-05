import { QueryClient } from '@tanstack/react-query';

import { comoErroApi } from './erros';

/** Sem nova tentativa automática para erros que a pessoa precisa resolver. */
export function criarQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: (tentativas, erro) =>
          tentativas < 1 && ['SEM_CONEXAO', 'ERRO_INTERNO'].includes(comoErroApi(erro).codigo),
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  });
}
