import { erros } from '../errors/AppError.js';
import type { AuditoriaRepository } from '../repositories/auditoria.repository.js';
import type {
  ChamadosRepository,
  NovoChamado,
  ResultadoTransicao,
} from '../repositories/chamados.repository.js';
import type { EspecialidadesRepository } from '../repositories/especialidades.repository.js';
import type { MedicosRepository } from '../repositories/medicos.repository.js';
import type { PlantoesRepository } from '../repositories/plantoes.repository.js';
import type { PreTriagensRepository } from '../repositories/pretriagens.repository.js';
import type { UnidadesRepository } from '../repositories/unidades.repository.js';
import type { UsuariosRepository } from '../repositories/usuarios.repository.js';
import {
  STATUS_ATIVOS,
  type Chamado,
  type Documento,
  type StatusChamado,
  type TipoDocumento,
  type Urgencia,
} from '../types/atendimento.js';
import type { Medico } from '../types/cadastros.js';
import { instanteLocal, nomeParaPainel } from '../utils/agenda.js';
import { hojeNoFuso } from '../utils/datas.js';
import { exigirAcessoUnidade, podeAcessarUnidade, type Ator } from './acesso.js';
import type { AgendaService } from './agenda.service.js';

/** RN04: cancelar ou reagendar só até 2 h antes. */
const PRAZO_ALTERACAO_MS = 2 * 60 * 60 * 1000;

const PESO_URGENCIA: Record<Urgencia, number> = { emergencia: 0, prioritario: 1, rotina: 2 };

/** RN22: urgência, depois horário agendado, depois hora da chegada. */
export function ordenarFila(a: Chamado, b: Chamado): number {
  const urgencia = PESO_URGENCIA[a.urgencia] - PESO_URGENCIA[b.urgencia];
  if (urgencia !== 0) return urgencia;
  const ia = a.inicio?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const ib = b.inicio?.getTime() ?? Number.MAX_SAFE_INTEGER;
  if (ia !== ib) return ia - ib;
  return (a.chegadaEm?.getTime() ?? 0) - (b.chegadaEm?.getTime() ?? 0);
}

export interface DadosAgendar {
  medicoId: string;
  unidadeId: string;
  especialidadeId: string;
  data: string;
  hora: string;
  formaPagamento?: 'convenio' | 'particular' | 'sus';
  preTriagemId?: string;
  /** Só a equipe informa: agenda em nome do paciente. */
  pacienteId?: string;
}

export interface NovoDocumento {
  tipo: TipoDocumento;
  titulo: string;
  conteudo: string;
  itens?: string[];
}

export function criarChamadosService(deps: {
  chamados: ChamadosRepository;
  medicos: MedicosRepository;
  unidades: UnidadesRepository;
  especialidades: EspecialidadesRepository;
  usuarios: UsuariosRepository;
  plantoes: PlantoesRepository;
  preTriagens: PreTriagensRepository;
  auditoria: AuditoriaRepository;
  agenda: AgendaService;
  fuso: string;
  agora?: () => Date;
}) {
  const {
    chamados,
    medicos,
    unidades,
    especialidades,
    usuarios,
    plantoes,
    preTriagens,
    auditoria,
    agenda,
    fuso,
  } = deps;
  const agora = deps.agora ?? (() => new Date());
  const hoje = () => hojeNoFuso(fuso, agora());

  function auditar(ator: Ator, acao: string, chamado: Chamado, detalhes?: Record<string, unknown>) {
    void auditoria
      .registrar({
        atorId: ator.uid,
        perfil: ator.perfil ?? 'desconhecido',
        unidadeId: chamado.unidadeId,
        acao,
        recurso: 'chamados',
        recursoId: chamado.id,
        detalhes,
      })
      .catch(() => undefined);
  }

  /** Converte o resultado do repositório em erro HTTP quando a transição é recusada. */
  function resolver(resultado: ResultadoTransicao): Chamado {
    if (resultado.ok) return resultado.chamado;
    switch (resultado.motivo) {
      case 'naoEncontrado':
        throw naoEncontrado();
      case 'jaAceito':
        throw erros.conflito('CHAMADO_JA_ACEITO');
      default:
        throw erros.naoProcessavel('STATUS_NAO_PERMITE', { status: resultado.chamado?.status });
    }
  }

  const naoEncontrado = () =>
    erros.naoEncontrado('Não encontramos esse atendimento. Atualize a tela e tente de novo.');

  async function buscarVisivel(ator: Ator, id: string): Promise<Chamado> {
    const chamado = await chamados.buscarPorId(id);
    if (!chamado) throw naoEncontrado();
    const dono = chamado.pacienteId === ator.uid;
    if (!dono && !podeAcessarUnidade(ator, chamado.unidadeId)) {
      throw ator.perfil === 'paciente' ? naoEncontrado() : erros.foraDaUnidade();
    }
    return chamado;
  }

  async function medicoDoAtor(ator: Ator): Promise<Medico> {
    const medico = await medicos.buscarPorUsuarioId(ator.uid);
    if (!medico || !medico.ativo) {
      throw erros.naoProcessavel('MEDICO_NAO_CADASTRADO', [
        { campo: 'usuario', mensagem: 'Sua conta ainda não está ligada a um cadastro de médico.' },
      ]);
    }
    return medico;
  }

  function exigirPrazo(chamado: Chamado, ator: Ator) {
    if (ator.perfil !== 'paciente' || !chamado.inicio) return;
    if (chamado.inicio.getTime() - agora().getTime() < PRAZO_ALTERACAO_MS) {
      throw erros.naoProcessavel('PRAZO_ENCERRADO');
    }
  }

  /** Nomes para exibição: medico, unidade e especialidade (com cache por chamada). */
  async function enriquecer(lista: Chamado[]) {
    const cacheM = new Map<string, Promise<Medico | null>>();
    const cacheU = new Map<string, ReturnType<UnidadesRepository['buscarPorId']>>();
    const cacheE = new Map<string, ReturnType<EspecialidadesRepository['buscarPorId']>>();
    const memo = <T>(
      mapa: Map<string, Promise<T>>,
      id: string,
      buscar: (id: string) => Promise<T>,
    ) => {
      if (!mapa.has(id)) mapa.set(id, buscar(id));
      return mapa.get(id)!;
    };
    return Promise.all(
      lista.map(async (c) => {
        const [medico, unidade, especialidade] = await Promise.all([
          c.medicoId
            ? memo(cacheM, c.medicoId, (id) => medicos.buscarPorId(id))
            : Promise.resolve(null),
          memo(cacheU, c.unidadeId, (id) => unidades.buscarPorId(id)),
          memo(cacheE, c.especialidadeId, (id) => especialidades.buscarPorId(id)),
        ]);
        return {
          chamado: c,
          medicoNome: medico?.nome ?? null,
          medicoConselho: medico
            ? `${medico.conselho.tipo}-${medico.conselho.uf} ${medico.conselho.numero}`
            : null,
          unidade: unidade ?? null,
          especialidadeNome: especialidade?.nome ?? null,
        };
      }),
    );
  }

  async function agendar(
    ator: Ator,
    dados: DadosAgendar,
    origem: Chamado['origem'],
  ): Promise<Chamado> {
    const ehEquipe = ator.perfil !== 'paciente';
    const pacienteId = ehEquipe ? dados.pacienteId : ator.uid;
    if (!pacienteId) {
      throw erros.dadosInvalidos([
        { campo: 'pacienteId', mensagem: 'Escolha o paciente da consulta.' },
      ]);
    }
    if (ehEquipe) exigirAcessoUnidade(ator, dados.unidadeId);

    const [paciente, medico, unidade] = await Promise.all([
      usuarios.buscarPorId(pacienteId),
      agenda.exigirMedicoNaUnidade(dados.medicoId, dados.unidadeId),
      unidades.buscarPorId(dados.unidadeId),
    ]);
    if (!paciente || paciente.perfil !== 'paciente') {
      throw erros.naoEncontrado('Não encontramos o cadastro desse paciente.');
    }
    if (!unidade?.ativa) throw erros.naoProcessavel('UNIDADE_NAO_CADASTRADA');
    if (!medico.especialidadeIds.includes(dados.especialidadeId)) {
      throw erros.dadosInvalidos([
        {
          campo: 'especialidadeId',
          mensagem: 'Esse médico não atende essa especialidade. Escolha outro médico.',
        },
      ]);
    }
    if (!(await agenda.horarioEstaLivre(dados.medicoId, dados.unidadeId, dados.data, dados.hora))) {
      throw erros.conflito('HORARIO_INDISPONIVEL');
    }

    let urgencia: Urgencia = 'rotina';
    if (dados.preTriagemId) {
      const triagem = await preTriagens.buscar(dados.preTriagemId);
      if (triagem && (triagem.pacienteId === pacienteId || ehEquipe)) {
        urgencia =
          triagem.resultado.urgencia === 'emergencia' ? 'prioritario' : triagem.resultado.urgencia;
      }
    }

    const id = chamados.novoId();
    const novo: NovoChamado = {
      id,
      tipo: 'agendado',
      pacienteId,
      pacienteNome: paciente.nome,
      pacienteNomePainel: nomeParaPainel(paciente.nome, paciente.consentimento.exibicaoPainel),
      unidadeId: dados.unidadeId,
      especialidadeId: dados.especialidadeId,
      medicoId: dados.medicoId,
      inicio: instanteLocal(dados.data, dados.hora),
      data: dados.data,
      hora: dados.hora,
      status: 'agendado',
      urgencia,
      preTriagemId: dados.preTriagemId ?? null,
      formaPagamento: dados.formaPagamento ?? null,
      chegadaEm: null,
      aceitoEm: null,
      sessaoPlantaoId: null,
      consultorioNome: null,
      inicioAtendimentoEm: null,
      concluidoEm: null,
      orientacao: null,
      canceladoEm: null,
      origem,
      historico: [{ status: 'agendado', em: agora(), por: ator.uid }],
    };
    const { conflito } = await chamados.criar(novo);
    if (conflito === 'medico') throw erros.conflito('HORARIO_INDISPONIVEL');
    if (conflito === 'paciente') throw erros.conflito('CONSULTA_NO_MESMO_HORARIO');

    const criado = { ...novo, criadoEm: agora(), atualizadoEm: agora() };
    auditar(ator, 'agendar', criado, { origem });
    return criado;
  }

  return {
    enriquecer,
    agendar,
    buscarVisivel,
    medicoDoAtor,

    async listarDoPaciente(pacienteId: string): Promise<Chamado[]> {
      const lista = await chamados.listarDoPaciente(pacienteId);
      // Próximas primeiro (mais perto primeiro), depois o histórico (mais recente primeiro).
      const ativos = lista
        .filter((c) => STATUS_ATIVOS.includes(c.status))
        .sort((a, b) => (a.inicio?.getTime() ?? 0) - (b.inicio?.getTime() ?? 0));
      const passados = lista
        .filter((c) => !STATUS_ATIVOS.includes(c.status))
        .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());
      return [...ativos, ...passados];
    },

    async cancelar(ator: Ator, id: string): Promise<Chamado> {
      const chamado = await buscarVisivel(ator, id);
      if (ator.perfil === 'medico') throw erros.acessoNegado();
      exigirPrazo(chamado, ator);
      const r = resolver(
        await chamados.transicionar(id, {
          de: ['agendado', 'aguardando_recepcao'],
          para: 'cancelado',
          por: ator.uid,
          liberarReservas: true,
          decidir: () => ({ canceladoEm: agora() }),
        }),
      );
      auditar(ator, 'cancelar', r);
      return r;
    },

    async reagendar(
      ator: Ator,
      id: string,
      novo: { data: string; hora: string; medicoId?: string },
    ) {
      const chamado = await buscarVisivel(ator, id);
      if (ator.perfil === 'medico') throw erros.acessoNegado();
      exigirPrazo(chamado, ator);
      const medicoId = novo.medicoId ?? chamado.medicoId;
      if (!medicoId) throw erros.naoProcessavel('STATUS_NAO_PERMITE');
      if (!(await agenda.horarioEstaLivre(medicoId, chamado.unidadeId, novo.data, novo.hora))) {
        throw erros.conflito('HORARIO_INDISPONIVEL');
      }
      const r = await chamados.reagendar(
        id,
        { medicoId, data: novo.data, hora: novo.hora, inicio: instanteLocal(novo.data, novo.hora) },
        ator.uid,
      );
      if (!r.ok && r.motivo === 'conflitoMedico') throw erros.conflito('HORARIO_INDISPONIVEL');
      if (!r.ok && r.motivo === 'conflitoPaciente')
        throw erros.conflito('CONSULTA_NO_MESMO_HORARIO');
      const atualizado = resolver(r as ResultadoTransicao);
      auditar(ator, 'reagendar', atualizado, novo);
      return atualizado;
    },

    // --- Recepção ----------------------------------------------------------
    async agendaDaUnidade(ator: Ator, unidadeId: string, data?: string): Promise<Chamado[]> {
      exigirAcessoUnidade(ator, unidadeId);
      const lista = await chamados.listarDaUnidadeNoDia(unidadeId, data ?? hoje());
      return lista.sort(
        (a, b) =>
          (a.hora ?? '99').localeCompare(b.hora ?? '99') ||
          a.criadoEm.getTime() - b.criadoEm.getTime(),
      );
    },

    /** RN06: só no dia, pela recepção da unidade do chamado. RN08: entra na fila. */
    async confirmarChegada(ator: Ator, id: string): Promise<Chamado> {
      const chamado = await buscarVisivel(ator, id);
      exigirAcessoUnidade(ator, chamado.unidadeId);
      if (chamado.data !== hoje()) throw erros.naoProcessavel('CHEGADA_FORA_DO_PRAZO');
      const r = resolver(
        await chamados.transicionar(id, {
          de: ['agendado', 'aguardando_recepcao'],
          para: 'aguardando_medico',
          por: ator.uid,
          decidir: () => ({ chegadaEm: agora() }),
        }),
      );
      auditar(ator, 'confirmar_chegada', r);
      return r;
    },

    async marcarFalta(ator: Ator, id: string): Promise<Chamado> {
      const chamado = await buscarVisivel(ator, id);
      exigirAcessoUnidade(ator, chamado.unidadeId);
      if (chamado.data > hoje()) throw erros.naoProcessavel('CHEGADA_FORA_DO_PRAZO');
      const r = resolver(
        await chamados.transicionar(id, {
          de: ['agendado', 'aguardando_recepcao'],
          para: 'nao_compareceu',
          por: ator.uid,
        }),
      );
      auditar(ator, 'marcar_falta', r);
      return r;
    },

    /** Atendimento sem horário marcado: a chegada já está confirmada; não escolhe médico (P14). */
    async registrarEspontaneo(
      ator: Ator,
      dados: { unidadeId: string; pacienteId: string; especialidadeId: string; urgencia: Urgencia },
    ): Promise<Chamado> {
      exigirAcessoUnidade(ator, dados.unidadeId);
      const [paciente, unidade] = await Promise.all([
        usuarios.buscarPorId(dados.pacienteId),
        unidades.buscarPorId(dados.unidadeId),
      ]);
      if (!paciente || paciente.perfil !== 'paciente') {
        throw erros.naoEncontrado('Não encontramos o cadastro desse paciente.');
      }
      if (!unidade?.especialidadeIds.includes(dados.especialidadeId)) {
        throw erros.dadosInvalidos([
          { campo: 'especialidadeId', mensagem: 'Esta unidade não atende essa especialidade.' },
        ]);
      }
      const id = chamados.novoId();
      const novo: NovoChamado = {
        id,
        tipo: 'espontaneo',
        pacienteId: paciente.id,
        pacienteNome: paciente.nome,
        pacienteNomePainel: nomeParaPainel(paciente.nome, paciente.consentimento.exibicaoPainel),
        unidadeId: dados.unidadeId,
        especialidadeId: dados.especialidadeId,
        medicoId: null,
        inicio: null,
        data: hoje(),
        hora: null,
        status: 'aguardando_medico',
        urgencia: dados.urgencia,
        preTriagemId: null,
        formaPagamento: null,
        chegadaEm: agora(),
        aceitoEm: null,
        sessaoPlantaoId: null,
        consultorioNome: null,
        inicioAtendimentoEm: null,
        concluidoEm: null,
        orientacao: null,
        canceladoEm: null,
        origem: 'recepcao',
        historico: [{ status: 'aguardando_medico', em: agora(), por: ator.uid }],
      };
      await chamados.criar(novo);
      const criado = { ...novo, criadoEm: agora(), atualizadoEm: agora() };
      auditar(ator, 'registrar_espontaneo', criado);
      return criado;
    },

    // --- Médico ------------------------------------------------------------
    async agendaDoMedico(ator: Ator, data?: string): Promise<Chamado[]> {
      const medico = await medicoDoAtor(ator);
      const lista = await chamados.listarDoMedicoNoDia(medico.id, data ?? hoje());
      return lista.sort((a, b) => (a.hora ?? '').localeCompare(b.hora ?? ''));
    },

    /** Fila do plantão (RN08 + RN22): só quem teve a chegada confirmada. */
    async fila(ator: Ator) {
      const medico = await medicoDoAtor(ator);
      const sessao = await plantoes.ativaDoMedico(medico.id);
      if (!sessao) return { sessao: null, aguardando: [], emAndamento: [] };
      const doDia = await chamados.listarDaUnidadeNoDia(sessao.unidadeId, hoje());
      const aguardando = doDia
        .filter(
          (c) =>
            c.status === 'aguardando_medico' &&
            (c.medicoId === medico.id ||
              (c.medicoId === null && medico.especialidadeIds.includes(c.especialidadeId))),
        )
        .sort(ordenarFila);
      const emAndamento = doDia.filter(
        (c) =>
          (c.status === 'chamando' || c.status === 'em_atendimento') && c.medicoId === medico.id,
      );
      return { sessao, aguardando, emAndamento };
    },

    /** RN21: a trava travasAceite/{id} nasce na mesma transação; o segundo médico recebe 409. */
    async aceitar(ator: Ator, id: string): Promise<Chamado> {
      const medico = await medicoDoAtor(ator);
      const sessao = await plantoes.ativaDoMedico(medico.id);
      if (!sessao) throw erros.naoProcessavel('SEM_PLANTAO_ATIVO');
      const chamado = await buscarVisivel(ator, id);
      if (chamado.unidadeId !== sessao.unidadeId) throw erros.foraDaUnidade();
      if (chamado.medicoId && chamado.medicoId !== medico.id)
        throw erros.conflito('CHAMADO_JA_ACEITO');
      const r = resolver(
        await chamados.transicionar(id, {
          de: ['aguardando_medico'],
          para: 'chamando',
          por: ator.uid,
          criarTravaAceite: { medicoId: medico.id },
          decidir: () => ({
            medicoId: medico.id,
            aceitoEm: agora(),
            sessaoPlantaoId: sessao.id,
            consultorioNome: sessao.consultorioNome,
          }),
          chamadaPainel: (c) => ({
            unidadeId: c.unidadeId,
            chamadoId: c.id,
            nomeExibicao: c.pacienteNomePainel,
            consultorioNome: sessao.consultorioNome,
            medicoNome: medico.nome,
            data: c.data,
            em: agora(),
          }),
        }),
      );
      auditar(ator, 'aceitar', r);
      return r;
    },

    async chamarNovamente(ator: Ator, id: string): Promise<void> {
      const medico = await medicoDoAtor(ator);
      const chamado = await buscarVisivel(ator, id);
      if (chamado.medicoId !== medico.id || chamado.status !== 'chamando') {
        throw erros.naoProcessavel('STATUS_NAO_PERMITE');
      }
      await chamados.registrarChamadaPainel({
        unidadeId: chamado.unidadeId,
        chamadoId: chamado.id,
        nomeExibicao: chamado.pacienteNomePainel,
        consultorioNome: chamado.consultorioNome ?? '',
        medicoNome: medico.nome,
        data: chamado.data,
        em: agora(),
      });
    },

    async mudarAtendimento(
      ator: Ator,
      id: string,
      acao: 'iniciar' | 'nao_compareceu' | 'emergencia',
    ): Promise<Chamado> {
      const medico = await medicoDoAtor(ator);
      const chamado = await buscarVisivel(ator, id);
      const doMedico = chamado.medicoId === medico.id;
      const regras: Record<typeof acao, { de: StatusChamado[]; para: StatusChamado }> = {
        iniciar: { de: ['chamando'], para: 'em_atendimento' },
        nao_compareceu: { de: ['chamando'], para: 'nao_compareceu' },
        emergencia: {
          de: ['aguardando_medico', 'chamando', 'em_atendimento'],
          para: 'encaminhado_emergencia',
        },
      };
      if (!doMedico && !(acao === 'emergencia' && chamado.medicoId === null)) {
        throw erros.naoProcessavel('STATUS_NAO_PERMITE');
      }
      const r = resolver(
        await chamados.transicionar(id, {
          ...regras[acao],
          por: ator.uid,
          decidir: () => (acao === 'iniciar' ? { inicioAtendimentoEm: agora() } : {}),
        }),
      );
      auditar(ator, acao, r);
      return r;
    },

    async concluir(
      ator: Ator,
      id: string,
      dados: { orientacao?: string; documentos: NovoDocumento[] },
    ): Promise<{ chamado: Chamado; documentos: Documento[] }> {
      const medico = await medicoDoAtor(ator);
      const chamado = await buscarVisivel(ator, id);
      if (chamado.medicoId !== medico.id) throw erros.naoProcessavel('STATUS_NAO_PERMITE');
      const r = resolver(
        await chamados.transicionar(id, {
          de: ['em_atendimento'],
          para: 'concluido',
          por: ator.uid,
          decidir: () => ({ concluidoEm: agora(), orientacao: dados.orientacao ?? null }),
        }),
      );
      const conselho = `${medico.conselho.tipo}-${medico.conselho.uf} ${medico.conselho.numero}`;
      const documentos = dados.documentos.length
        ? await chamados.criarDocumentos(
            dados.documentos.map((d) => ({
              chamadoId: id,
              pacienteId: chamado.pacienteId,
              medicoId: medico.id,
              medicoNome: medico.nome,
              medicoConselho: conselho,
              unidadeId: chamado.unidadeId,
              tipo: d.tipo,
              titulo: d.titulo,
              conteudo: d.conteudo,
              itens: d.itens ?? [],
              ativo: true,
              emitidoEm: agora(),
            })),
          )
        : [];
      auditar(ator, 'concluir', r, { documentos: documentos.length });
      return { chamado: r, documentos };
    },

    // --- Documentos --------------------------------------------------------
    async documentosDoPaciente(pacienteId: string): Promise<Documento[]> {
      return chamados.documentosDoPaciente(pacienteId);
    },
    async documentosDoChamado(ator: Ator, chamadoId: string): Promise<Documento[]> {
      await buscarVisivel(ator, chamadoId);
      return chamados.documentosDoChamado(chamadoId);
    },
    async documento(ator: Ator, id: string): Promise<Documento> {
      const doc = await chamados.buscarDocumento(id);
      if (!doc || !doc.ativo) throw erros.naoEncontrado('Não encontramos esse documento.');
      if (doc.pacienteId !== ator.uid && !podeAcessarUnidade(ator, doc.unidadeId)) {
        throw erros.naoEncontrado('Não encontramos esse documento.');
      }
      return doc;
    },

    // --- Indicadores (manutenção e administrativo) ------------------------
    async indicadores(ator: Ator, unidadeId: string, data?: string) {
      exigirAcessoUnidade(ator, unidadeId);
      const dia = data ?? hoje();
      const [lista, sessoes] = await Promise.all([
        chamados.listarDaUnidadeNoDia(unidadeId, dia),
        plantoes.ativasDaUnidade(unidadeId),
      ]);
      const porStatus = Object.fromEntries(
        (
          [
            'agendado',
            'aguardando_recepcao',
            'aguardando_medico',
            'chamando',
            'em_atendimento',
            'concluido',
            'cancelado',
            'nao_compareceu',
            'encaminhado_emergencia',
          ] as StatusChamado[]
        ).map((s) => [s, lista.filter((c) => c.status === s).length]),
      ) as Record<StatusChamado, number>;
      const esperas = lista
        .filter((c) => c.chegadaEm && c.aceitoEm)
        .map((c) => (c.aceitoEm!.getTime() - c.chegadaEm!.getTime()) / 60_000);
      return {
        data: dia,
        total: lista.length,
        porStatus,
        espontaneos: lista.filter((c) => c.tipo === 'espontaneo').length,
        esperaMediaMinutos: esperas.length
          ? Math.round(esperas.reduce((a, b) => a + b, 0) / esperas.length)
          : null,
        plantoesAtivos: sessoes.map((s) => ({
          medicoNome: s.medicoNome,
          consultorioNome: s.consultorioNome,
        })),
      };
    },
  };
}

export type ChamadosService = ReturnType<typeof criarChamadosService>;
