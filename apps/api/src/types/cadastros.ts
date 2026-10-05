import type { Conselho } from '../schemas/medico.schema.js';
import type { Endereco, TipoUnidade } from '../schemas/unidade.schema.js';

/** especialidades/{id}. O id é o nome do ícone no design system (cardiologia, clinicoGeral…). */
export interface Especialidade {
  id: string;
  nome: string;
  descricao: string;
  palavrasChave: string[];
  ativa: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

/** unidades/{id} */
export interface Unidade {
  id: string;
  nome: string;
  tipo: TipoUnidade;
  cnpj: string;
  endereco: Endereco;
  /** Bairro em minúsculo e sem acento, gerado no service para a busca. */
  bairroBusca: string;
  telefone: string;
  especialidadeIds: string[];
  ativa: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

/** medicos/{id} */
export interface Medico {
  id: string;
  usuarioId: string | null;
  nome: string;
  conselho: Conselho;
  especialidadeIds: string[];
  unidadeIds: string[];
  ativo: boolean;
  /** uid de quem cadastrou (sempre um administrativo; "seed" no seed). */
  criadoPorAdministrativo: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export type SemDatas<T> = Omit<T, 'criadoEm' | 'atualizadoEm'>;
