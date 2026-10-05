import { api } from './cliente';

export interface Especialidade {
  id: string;
  nome: string;
  descricao: string;
  palavrasChave: string[];
  ativa: boolean;
}

export interface Unidade {
  id: string;
  nome: string;
  tipo: 'hospital' | 'clinica';
  endereco: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  bairroBusca: string;
  telefone: string;
  especialidadeIds: string[];
  ativa: boolean;
}

export interface Medico {
  id: string;
  nome: string;
  conselho: { tipo: 'CRM'; numero: string; uf: string };
  especialidadeIds: string[];
  unidadeIds: string[];
  ativo: boolean;
}

export async function listarEspecialidades(): Promise<Especialidade[]> {
  const { data } = await api.get<{ itens: Especialidade[] }>('/especialidades');
  return data.itens;
}

export async function buscarEspecialidade(id: string): Promise<Especialidade> {
  const { data } = await api.get<Especialidade>(`/especialidades/${encodeURIComponent(id)}`);
  return data;
}

export async function listarUnidades(filtros: { especialidadeId?: string }): Promise<Unidade[]> {
  const { data } = await api.get<{ itens: Unidade[] }>('/unidades', { params: filtros });
  return data.itens;
}

export async function buscarUnidade(id: string): Promise<Unidade> {
  const { data } = await api.get<Unidade>(`/unidades/${encodeURIComponent(id)}`);
  return data;
}

export async function listarMedicos(filtros: {
  unidadeId?: string;
  especialidadeId?: string;
}): Promise<Medico[]> {
  const { data } = await api.get<{ itens: Medico[] }>('/medicos', { params: filtros });
  return data.itens;
}
