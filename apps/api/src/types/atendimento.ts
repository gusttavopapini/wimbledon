/** Tipos do agendamento, da fila presencial, do plantão e do painel de TV. */

export const STATUS_CHAMADO = [
  'agendado',
  'aguardando_recepcao',
  'aguardando_medico',
  'chamando',
  'em_atendimento',
  'concluido',
  'cancelado',
  'nao_compareceu',
  'encaminhado_emergencia',
] as const;
export type StatusChamado = (typeof STATUS_CHAMADO)[number];

/** Status que ainda ocupam o horário e aparecem como "em andamento". */
export const STATUS_ATIVOS: StatusChamado[] = [
  'agendado',
  'aguardando_recepcao',
  'aguardando_medico',
  'chamando',
  'em_atendimento',
];

export const URGENCIAS = ['rotina', 'prioritario', 'emergencia'] as const;
export type Urgencia = (typeof URGENCIAS)[number];

export type TipoChamado = 'agendado' | 'espontaneo';

export interface EventoHistorico {
  status: StatusChamado;
  em: Date;
  por: string;
}

/** chamados/{id} */
export interface Chamado {
  id: string;
  tipo: TipoChamado;
  pacienteId: string;
  pacienteNome: string;
  /** Nome que pode ir ao painel de TV, já com o consentimento aplicado (RN26). */
  pacienteNomePainel: string;
  unidadeId: string;
  especialidadeId: string;
  medicoId: string | null;
  /** Instante agendado (UTC). Null no espontâneo. */
  inicio: Date | null;
  /** Dia local do atendimento, "AAAA-MM-DD": agenda e fila filtram por ele. */
  data: string;
  /** "HH:mm" local, null no espontâneo. */
  hora: string | null;
  status: StatusChamado;
  urgencia: Urgencia;
  preTriagemId: string | null;
  formaPagamento: 'convenio' | 'particular' | 'sus' | null;
  chegadaEm: Date | null;
  aceitoEm: Date | null;
  sessaoPlantaoId: string | null;
  consultorioNome: string | null;
  inicioAtendimentoEm: Date | null;
  concluidoEm: Date | null;
  orientacao: string | null;
  canceladoEm: Date | null;
  origem: 'app' | 'recepcao' | 'whatsapp';
  historico: EventoHistorico[];
  criadoEm: Date;
  atualizadoEm: Date;
}

/** consultorios/{id} */
export interface Consultorio {
  id: string;
  unidadeId: string;
  nome: string;
  ativo: boolean;
}

/** disponibilidades/{id}: janela semanal de atendimento do médico numa unidade. */
export interface Disponibilidade {
  id: string;
  medicoId: string;
  unidadeId: string;
  /** 0 = domingo ... 6 = sábado */
  diaSemana: number;
  inicio: string;
  fim: string;
  duracaoMinutos: number;
  ativa: boolean;
}

/** bloqueios/{id}: dia (ou trecho do dia) sem atendimento. */
export interface Bloqueio {
  id: string;
  medicoId: string;
  unidadeId: string | null;
  data: string;
  inicio: string | null;
  fim: string | null;
  motivo: string;
  ativo: boolean;
}

/** sessoesPlantao/{id} */
export interface SessaoPlantao {
  id: string;
  medicoId: string;
  medicoNome: string;
  usuarioId: string;
  unidadeId: string;
  consultorioId: string;
  consultorioNome: string;
  ativa: boolean;
  abertaEm: Date;
  encerradaEm: Date | null;
}

/** chamadasPainel/{id}: cada vez que um nome aparece na TV. */
export interface ChamadaPainel {
  id: string;
  unidadeId: string;
  chamadoId: string;
  nomeExibicao: string;
  consultorioNome: string;
  medicoNome: string;
  data: string;
  em: Date;
}

/** painelDispositivos/{id}: TV autorizada por token (RN25). */
export interface PainelDispositivo {
  id: string;
  unidadeId: string;
  nome: string;
  tokenHash: string;
  ativo: boolean;
  criadoPor: string;
  criadoEm: Date;
}

export type TipoDocumento = 'receita' | 'atestado' | 'solicitacao_exame' | 'orientacao';

/** documentos/{id} */
export interface Documento {
  id: string;
  chamadoId: string;
  pacienteId: string;
  medicoId: string;
  medicoNome: string;
  medicoConselho: string;
  unidadeId: string;
  tipo: TipoDocumento;
  titulo: string;
  conteudo: string;
  itens: string[];
  ativo: boolean;
  emitidoEm: Date;
}

export interface ResultadoTriagem {
  especialidadeId: string;
  especialidadeNome: string;
  confianca: number;
  urgencia: Urgencia;
  sinaisAlerta: string[];
  justificativa: string;
  orientacao: string;
}

/** preTriagens/{id} */
export interface PreTriagem {
  id: string;
  pacienteId: string | null;
  telefone: string | null;
  relato: string;
  idade: number | null;
  sexo: string | null;
  alerta: boolean;
  resultado: ResultadoTriagem;
  provedor: string;
  origem: 'app' | 'whatsapp';
  criadoEm: Date;
}
