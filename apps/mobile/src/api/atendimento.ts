import type { Unidade, Medico } from './cadastros';
import type { Usuario } from './auth';
import { api } from './cliente';

export type StatusChamado =
  | 'agendado'
  | 'aguardando_recepcao'
  | 'aguardando_medico'
  | 'chamando'
  | 'em_atendimento'
  | 'concluido'
  | 'cancelado'
  | 'nao_compareceu'
  | 'encaminhado_emergencia';

export type Urgencia = 'rotina' | 'prioritario' | 'emergencia';
export type FormaPagamento = 'convenio' | 'particular' | 'sus';

export interface Chamado {
  id: string;
  tipo: 'agendado' | 'espontaneo';
  status: StatusChamado;
  etapa: number;
  urgencia: Urgencia;
  data: string;
  hora: string | null;
  inicio: string | null;
  paciente: { id: string; nome: string; nomePainel: string };
  unidade: {
    id: string;
    nome: string;
    endereco: Unidade['endereco'] | null;
    telefone: string | null;
  };
  especialidade: { id: string; nome: string };
  medico: { id: string; nome: string; conselho: string | null } | null;
  consultorio: string | null;
  formaPagamento: FormaPagamento | null;
  origem: 'app' | 'recepcao' | 'whatsapp';
  chegadaEm: string | null;
  aceitoEm: string | null;
  inicioAtendimentoEm: string | null;
  concluidoEm: string | null;
  canceladoEm: string | null;
  orientacao: string | null;
  podeAlterar: boolean;
  historico: { status: StatusChamado; em: string }[];
}

export interface DiaComHorarios {
  data: string;
  horarios: string[];
}

export type TipoDocumento = 'receita' | 'atestado' | 'solicitacao_exame' | 'orientacao';

export interface Documento {
  id: string;
  chamadoId: string;
  tipo: TipoDocumento;
  titulo: string;
  conteudo: string;
  itens: string[];
  medico: { id: string; nome: string; conselho: string };
  unidadeId: string;
  emitidoEm: string;
}

export interface SessaoPlantao {
  id: string;
  medicoId: string;
  medicoNome: string;
  unidadeId: string;
  consultorio: { id: string; nome: string };
  ativa: boolean;
  abertaEm: string;
}

export interface Consultorio {
  id: string;
  unidadeId: string;
  nome: string;
  ativo: boolean;
}

export interface Disponibilidade {
  id: string;
  medicoId: string;
  unidadeId: string;
  diaSemana: number;
  inicio: string;
  fim: string;
  duracaoMinutos: number;
}

export interface ResultadoTriagem {
  id: string;
  alerta: boolean;
  especialidade: { id: string; nome: string };
  confianca: number;
  urgencia: Urgencia;
  sinaisAlerta: string[];
  justificativa: string;
  orientacao: string;
  unidades: Unidade[];
  aviso: string;
}

export interface Indicadores {
  data: string;
  total: number;
  porStatus: Record<StatusChamado, number>;
  espontaneos: number;
  esperaMediaMinutos: number | null;
  plantoesAtivos: { medicoNome: string; consultorioNome: string }[];
}

const enc = encodeURIComponent;

// --- Paciente -------------------------------------------------------------------
export async function horariosLivres(
  medicoId: string,
  unidadeId: string,
): Promise<DiaComHorarios[]> {
  const { data } = await api.get<{ itens: DiaComHorarios[] }>(
    `/medicos/${enc(medicoId)}/horarios`,
    {
      params: { unidadeId, dias: 21 },
    },
  );
  return data.itens;
}

export interface DadosAgendar {
  medicoId: string;
  unidadeId: string;
  especialidadeId: string;
  data: string;
  hora: string;
  formaPagamento?: FormaPagamento;
  preTriagemId?: string;
  pacienteId?: string;
}

export async function agendar(dados: DadosAgendar): Promise<Chamado> {
  const { data } = await api.post<Chamado>('/chamados', dados);
  return data;
}

export async function meusChamados(): Promise<Chamado[]> {
  const { data } = await api.get<{ itens: Chamado[] }>('/chamados/me');
  return data.itens;
}

export async function buscarChamado(id: string): Promise<Chamado> {
  const { data } = await api.get<Chamado>(`/chamados/${enc(id)}`);
  return data;
}

export async function cancelarChamado(id: string): Promise<Chamado> {
  const { data } = await api.post<Chamado>(`/chamados/${enc(id)}/cancelar`);
  return data;
}

export async function reagendarChamado(
  id: string,
  novo: { data: string; hora: string },
): Promise<Chamado> {
  const { data } = await api.post<Chamado>(`/chamados/${enc(id)}/reagendar`, novo);
  return data;
}

export async function documentosDoChamado(id: string): Promise<Documento[]> {
  const { data } = await api.get<{ itens: Documento[] }>(`/chamados/${enc(id)}/documentos`);
  return data.itens;
}

export async function meusDocumentos(): Promise<Documento[]> {
  const { data } = await api.get<{ itens: Documento[] }>('/documentos/me');
  return data.itens;
}

export async function buscarDocumento(id: string): Promise<Documento> {
  const { data } = await api.get<Documento>(`/documentos/${enc(id)}`);
  return data;
}

export async function triar(relato: string): Promise<ResultadoTriagem> {
  const { data } = await api.post<ResultadoTriagem>(
    '/pretriagens',
    { relato },
    { timeout: 40_000 },
  );
  return data;
}

// --- Recepção -------------------------------------------------------------------
export async function agendaDaUnidade(unidadeId: string, data?: string): Promise<Chamado[]> {
  const r = await api.get<{ itens: Chamado[] }>(`/unidades/${enc(unidadeId)}/chamados`, {
    params: data ? { data } : {},
  });
  return r.data.itens;
}

export const confirmarChegada = async (id: string) =>
  (await api.post<Chamado>(`/chamados/${enc(id)}/chegada`)).data;
export const marcarFalta = async (id: string) =>
  (await api.post<Chamado>(`/chamados/${enc(id)}/falta`)).data;

export async function buscarPacientePorCpf(cpf: string): Promise<Usuario> {
  const { data } = await api.get<Usuario>('/pacientes', { params: { cpf } });
  return data;
}

export async function preCadastrarPaciente(dados: {
  nome: string;
  cpf: string;
  telefone?: string;
  dataNascimento?: string;
  exibicaoPainel: boolean;
}): Promise<{ id: string; nome: string }> {
  const { data } = await api.post<{ id: string; nome: string }>('/pacientes', dados);
  return data;
}

export async function registrarEspontaneo(dados: {
  unidadeId: string;
  pacienteId: string;
  especialidadeId: string;
  urgencia: Urgencia;
}): Promise<Chamado> {
  const { data } = await api.post<Chamado>('/chamados/espontaneos', dados);
  return data;
}

// --- Médico ---------------------------------------------------------------------
export async function medicoMe(): Promise<{ medico: Medico; plantao: SessaoPlantao | null }> {
  const { data } = await api.get<{ medico: Medico; plantao: SessaoPlantao | null }>('/medicos/me');
  return data;
}

export async function abrirPlantao(dados: { unidadeId: string; consultorioId: string }) {
  return (await api.post<SessaoPlantao>('/plantoes', dados)).data;
}
export async function encerrarPlantao() {
  return (await api.delete<SessaoPlantao>('/plantoes/atual')).data;
}

export interface Fila {
  plantao: SessaoPlantao | null;
  aguardando: Chamado[];
  emAndamento: Chamado[];
}
export const filaDoPlantao = async () => (await api.get<Fila>('/plantoes/atual/fila')).data;
export const agendaDoMedico = async (data?: string) =>
  (await api.get<{ itens: Chamado[] }>('/medicos/me/agenda', { params: data ? { data } : {} })).data
    .itens;

export const aceitarChamado = async (id: string) =>
  (await api.post<Chamado>(`/chamados/${enc(id)}/aceitar`)).data;
export const chamarNovamente = async (id: string) => {
  await api.post(`/chamados/${enc(id)}/chamar-novamente`);
};
export const mudarAtendimento = async (
  id: string,
  acao: 'iniciar' | 'nao_compareceu' | 'emergencia',
) => (await api.post<Chamado>(`/chamados/${enc(id)}/atendimento`, { acao })).data;

export interface NovoDocumento {
  tipo: TipoDocumento;
  titulo: string;
  conteudo: string;
  itens?: string[];
}
export const concluirAtendimento = async (
  id: string,
  dados: { orientacao?: string; documentos: NovoDocumento[] },
) =>
  (
    await api.post<{ chamado: Chamado; documentos: Documento[] }>(
      `/chamados/${enc(id)}/concluir`,
      dados,
    )
  ).data;

// --- Gestão (manutenção e administrativo) ---------------------------------------
export const consultoriosDaUnidade = async (unidadeId: string) =>
  (await api.get<{ itens: Consultorio[] }>(`/unidades/${enc(unidadeId)}/consultorios`)).data.itens;
export const criarConsultorio = async (unidadeId: string, nome: string) =>
  (await api.post<Consultorio>(`/unidades/${enc(unidadeId)}/consultorios`, { nome })).data;
export const atualizarConsultorio = async (id: string, dados: { nome?: string; ativo?: boolean }) =>
  (await api.put<Consultorio>(`/consultorios/${enc(id)}`, dados)).data;

export const indicadores = async (unidadeId: string) =>
  (await api.get<Indicadores>(`/unidades/${enc(unidadeId)}/indicadores`)).data;

export interface Equipe {
  contas: Usuario[];
  medicos: (Medico & { temConta: boolean })[];
}
export const equipeDaUnidade = async (unidadeId: string) =>
  (await api.get<Equipe>(`/unidades/${enc(unidadeId)}/equipe`)).data;

export interface DadosContaEquipe {
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  perfil: 'recepcionista' | 'medico' | 'manutencao' | 'administrativo';
  unidadeId?: string;
  medicoId?: string;
}
export const criarContaEquipe = async (dados: DadosContaEquipe) =>
  (
    await api.post<{ conta: { id: string; nome: string }; senhaProvisoria: string | null }>(
      '/equipe/contas',
      dados,
    )
  ).data;
export const contasPorPerfil = async (perfil: string) =>
  (await api.get<{ itens: Usuario[] }>('/equipe/contas', { params: { perfil } })).data.itens;
export const redefinirSenha = async (usuarioId: string) =>
  (await api.post<{ senhaProvisoria: string }>(`/usuarios/${enc(usuarioId)}/redefinir-senha`)).data;
export const alterarStatusConta = async (usuarioId: string, ativo: boolean) => {
  await api.put(`/usuarios/${enc(usuarioId)}/status`, { ativo });
};

export const paineisDaUnidade = async (unidadeId: string) =>
  (await api.get<{ itens: { id: string; nome: string }[] }>(`/unidades/${enc(unidadeId)}/paineis`))
    .data.itens;
export const aprovarPainel = async (unidadeId: string, codigo: string, nome: string) =>
  (
    await api.post<{ id: string; nome: string }>(`/unidades/${enc(unidadeId)}/paineis`, {
      codigo,
      nome,
    })
  ).data;
export const desativarPainel = async (id: string) => {
  await api.delete(`/paineis/${enc(id)}`);
};

export const disponibilidadesDoMedico = async (medicoId: string, unidadeId?: string) =>
  (
    await api.get<{ itens: Disponibilidade[] }>(`/medicos/${enc(medicoId)}/disponibilidades`, {
      params: unidadeId ? { unidadeId } : {},
    })
  ).data.itens;
export const criarDisponibilidade = async (
  medicoId: string,
  dados: {
    unidadeId: string;
    diaSemana: number;
    inicio: string;
    fim: string;
    duracaoMinutos: number;
  },
) => (await api.post<Disponibilidade>(`/medicos/${enc(medicoId)}/disponibilidades`, dados)).data;
export const removerDisponibilidade = async (id: string) => {
  await api.delete(`/disponibilidades/${enc(id)}`);
};

// --- Administrativo (cadastros base) ----------------------------------------------
export const criarEspecialidade = async (dados: {
  nome: string;
  descricao: string;
  palavrasChave: string[];
}) => (await api.post('/especialidades', dados)).data;
export const criarMedico = async (dados: {
  nome: string;
  conselho: { tipo: 'CRM'; numero: string; uf: string };
  especialidadeIds: string[];
  unidadeIds: string[];
}) => (await api.post<Medico>('/medicos', dados)).data;
export const alocarMedico = async (medicoId: string, unidadeId: string) =>
  (await api.post(`/medicos/${enc(medicoId)}/unidades`, { unidadeId })).data;
