import type { Perfil, Preferencias, StatusUsuario } from '../schemas/campos.js';

export interface Consentimento {
  versaoTermo: string;
  aceitoEm: Date;
  canal: 'app' | 'pwa' | 'recepcao' | 'seed';
  /** Aceite específico para exibir e anunciar o nome completo no painel de TV. */
  exibicaoPainel: boolean;
}

/** Documento usuarios/{uid}. Datas em UTC (Timestamp do Firestore). */
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cpf: string;
  telefone?: string;
  dataNascimento?: string;
  sexo?: string;
  perfil: Perfil;
  unidadeId?: string;
  unidadeIds?: string[];
  preferencias: Preferencias;
  consentimento: Consentimento;
  expoPushTokens: string[];
  status: StatusUsuario;
  criadoPor: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

export type NovoUsuario = Omit<Usuario, 'criadoEm' | 'atualizadoEm'>;

/** Dados que o próprio usuário pode trocar em PUT /usuarios/me. */
export type AlteracaoUsuario = Partial<
  Pick<Usuario, 'nome' | 'telefone' | 'dataNascimento' | 'sexo' | 'preferencias'>
> & { exibicaoPainel?: boolean };
