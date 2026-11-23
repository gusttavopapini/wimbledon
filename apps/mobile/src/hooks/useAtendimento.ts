import { useQuery } from '@tanstack/react-query';

import {
  buscarChamado,
  buscarDocumento,
  documentosDoChamado,
  horariosLivres,
  meusChamados,
  meusDocumentos,
} from '@/api/atendimento';

export const chavesAtendimento = {
  meus: ['chamados', 'me'] as const,
  chamado: (id: string) => ['chamados', id] as const,
  horarios: (medicoId: string, unidadeId: string) => ['horarios', medicoId, unidadeId] as const,
  documentos: ['documentos', 'me'] as const,
  documento: (id: string) => ['documentos', id] as const,
  documentosDoChamado: (id: string) => ['chamados', id, 'documentos'] as const,
  triagem: (id: string) => ['triagem', id] as const,
};

export function useMeusChamados() {
  return useQuery({ queryKey: chavesAtendimento.meus, queryFn: meusChamados, staleTime: 30_000 });
}

/** Acompanhamento: atualiza sozinho a cada 15 s enquanto o atendimento anda. */
export function useChamado(id: string, acompanhar = false) {
  return useQuery({
    queryKey: chavesAtendimento.chamado(id),
    queryFn: () => buscarChamado(id),
    enabled: Boolean(id),
    refetchInterval: acompanhar ? 15_000 : false,
  });
}

export function useHorarios(medicoId: string, unidadeId: string) {
  return useQuery({
    queryKey: chavesAtendimento.horarios(medicoId, unidadeId),
    queryFn: () => horariosLivres(medicoId, unidadeId),
    enabled: Boolean(medicoId && unidadeId),
    staleTime: 30_000,
  });
}

export function useMeusDocumentos() {
  return useQuery({ queryKey: chavesAtendimento.documentos, queryFn: meusDocumentos });
}

export function useDocumento(id: string) {
  return useQuery({
    queryKey: chavesAtendimento.documento(id),
    queryFn: () => buscarDocumento(id),
    enabled: Boolean(id),
  });
}

export function useDocumentosDoChamado(id: string, habilitado: boolean) {
  return useQuery({
    queryKey: chavesAtendimento.documentosDoChamado(id),
    queryFn: () => documentosDoChamado(id),
    enabled: Boolean(id) && habilitado,
  });
}
