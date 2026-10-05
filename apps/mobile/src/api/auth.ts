import { api } from './cliente';

export type Perfil = 'paciente' | 'recepcionista' | 'medico' | 'manutencao' | 'administrativo';

export interface Preferencias {
  letraGrande: boolean;
  altoContraste: boolean;
  lembreteWhatsapp: boolean;
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone: string | null;
  dataNascimento: string | null;
  sexo: string | null;
  perfil: Perfil;
  unidadeId: string | null;
  unidadeIds: string[];
  preferencias: Preferencias;
  consentimento: {
    versaoTermo: string;
    aceitoEm: string;
    canal: string;
    exibicaoPainel: boolean;
  };
  status: 'ativo' | 'pre_cadastro' | 'inativo';
  criadoEm: string;
  atualizadoEm: string;
}

export interface DadosCadastro {
  nome: string;
  cpf: string;
  /** AAAA-MM-DD */
  dataNascimento: string;
  telefone: string;
  email: string;
  senha: string;
  consentimento: {
    versaoTermo: string;
    aceito: true;
    canal: 'app' | 'pwa';
    exibicaoPainel: boolean;
  };
}

export interface ContaCriada {
  id: string;
  nome: string;
  perfil: Perfil;
  status: Usuario['status'];
}

export async function cadastrar(dados: DadosCadastro): Promise<ContaCriada> {
  const { data } = await api.post<ContaCriada>('/auth/cadastro', dados);
  return data;
}

export async function buscarMe(): Promise<{ usuario: Usuario; perfil: Perfil }> {
  const { data } = await api.get<{ usuario: Usuario; perfil: Perfil }>('/auth/me');
  return data;
}
