import axios from 'axios';

import { ambiente } from '@/ambiente';

/**
 * Cliente do painel de TV. Não usa o login de pessoa (Firebase Auth): só o
 * token de dispositivo no cabeçalho X-Device-Token (RN25).
 */
const painelApi = axios.create({ baseURL: ambiente.apiUrl, timeout: 10_000 });

export interface ChamadaNaTv {
  id: string;
  chamadoId: string;
  nome: string;
  consultorio: string;
  medico: string;
  em: string;
}

export interface EstadoPainel {
  unidade: { id: string; nome: string };
  dispositivo: { id: string; nome: string };
  atual: ChamadaNaTv | null;
  anteriores: ChamadaNaTv[];
  geradoEm: string;
}

export async function iniciarPareamento(): Promise<{
  codigo: string;
  segredo: string;
  expiraEm: string;
}> {
  const { data } = await painelApi.post('/painel/pareamentos');
  return data;
}

export async function consultarPareamento(
  codigo: string,
  segredo: string,
): Promise<{ status: 'aguardando' } | { status: 'aprovado'; token: string; unidadeId: string }> {
  const { data } = await painelApi.post('/painel/pareamentos/consulta', { codigo, segredo });
  return data;
}

export async function estadoDoPainel(token: string): Promise<EstadoPainel> {
  const { data } = await painelApi.get<EstadoPainel>('/painel/estado', {
    headers: { 'X-Device-Token': token },
  });
  return data;
}

/** 401 = token revogado (TV desativada pela manutenção): volta ao pareamento. */
export function tokenRecusado(erro: unknown): boolean {
  return axios.isAxiosError(erro) && erro.response?.status === 401;
}
