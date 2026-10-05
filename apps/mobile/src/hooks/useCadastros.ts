import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  buscarEspecialidade,
  buscarUnidade,
  listarEspecialidades,
  listarMedicos,
  listarUnidades,
  type Especialidade,
  type Unidade,
} from '@/api/cadastros';

// Cadastros mudam pouco: 5 minutos sem buscar de novo evita espera a cada tela.
const FRESCOR = 5 * 60 * 1000;

export const chaves = {
  especialidades: ['especialidades'] as const,
  especialidade: (id: string) => ['especialidades', id] as const,
  unidades: (especialidadeId?: string) => ['unidades', { especialidadeId }] as const,
  unidade: (id: string) => ['unidades', id] as const,
  medicos: (unidadeId?: string, especialidadeId?: string) =>
    ['medicos', { unidadeId, especialidadeId }] as const,
};

export function useEspecialidades() {
  return useQuery({
    queryKey: chaves.especialidades,
    queryFn: listarEspecialidades,
    staleTime: FRESCOR,
  });
}

/** Usa a lista já carregada como ponto de partida e confirma na API. */
export function useEspecialidade(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: chaves.especialidade(id),
    queryFn: () => buscarEspecialidade(id),
    staleTime: FRESCOR,
    enabled: Boolean(id),
    initialData: () =>
      queryClient
        .getQueryData<Especialidade[]>(chaves.especialidades)
        ?.find((especialidade) => especialidade.id === id),
  });
}

export function useUnidades(especialidadeId?: string) {
  return useQuery({
    queryKey: chaves.unidades(especialidadeId),
    queryFn: () => listarUnidades({ especialidadeId }),
    staleTime: FRESCOR,
  });
}

export function useUnidade(id: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: chaves.unidade(id),
    queryFn: () => buscarUnidade(id),
    staleTime: FRESCOR,
    enabled: Boolean(id),
    initialData: () => {
      for (const [, lista] of queryClient.getQueriesData<Unidade[]>({ queryKey: ['unidades'] })) {
        const achada = Array.isArray(lista) ? lista.find((u) => u.id === id) : undefined;
        if (achada) return achada;
      }
      return undefined;
    },
  });
}

export function useMedicos(unidadeId?: string, especialidadeId?: string) {
  return useQuery({
    queryKey: chaves.medicos(unidadeId, especialidadeId),
    queryFn: () => listarMedicos({ unidadeId, especialidadeId }),
    staleTime: FRESCOR,
    enabled: Boolean(unidadeId),
  });
}
