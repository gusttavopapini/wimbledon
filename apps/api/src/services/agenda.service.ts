import { erros } from '../errors/AppError.js';
import type { AgendaRepository } from '../repositories/agenda.repository.js';
import type { MedicosRepository } from '../repositories/medicos.repository.js';
import type { UnidadesRepository } from '../repositories/unidades.repository.js';
import type { Bloqueio, Consultorio, Disponibilidade } from '../types/atendimento.js';
import {
  diaDaSemana,
  fatiarJanelas,
  instanteLocal,
  minutosDoDia,
  somarDias,
} from '../utils/agenda.js';
import { hojeNoFuso } from '../utils/datas.js';
import { exigirGestaoUnidade, type Ator } from './acesso.js';

export interface DiaComHorarios {
  data: string;
  horarios: string[];
}

/** Antecedência mínima para marcar pelo app: não oferece horário que já passou ou está em cima. */
const ANTECEDENCIA_MINUTOS = 60;

export function criarAgendaService(deps: {
  agenda: AgendaRepository;
  medicos: MedicosRepository;
  unidades: UnidadesRepository;
  fuso: string;
  agora?: () => Date;
}) {
  const { agenda, medicos, unidades, fuso } = deps;
  const agora = deps.agora ?? (() => new Date());

  async function exigirMedicoNaUnidade(medicoId: string, unidadeId: string) {
    const medico = await medicos.buscarPorId(medicoId);
    if (!medico || !medico.ativo) {
      throw erros.naoEncontrado('Não encontramos esse médico. Volte e escolha de novo na lista.');
    }
    if (!medico.unidadeIds.includes(unidadeId)) {
      throw erros.dadosInvalidos([
        {
          campo: 'unidadeId',
          mensagem: 'Esse médico não atende nessa unidade. Escolha outra unidade.',
        },
      ]);
    }
    return medico;
  }

  /**
   * Horários livres = janelas da disponibilidade - bloqueios - reservas (RN02).
   * O cálculo é sempre feito aqui; o app só mostra o resultado.
   */
  async function horariosLivres(
    medicoId: string,
    unidadeId: string,
    de?: string,
    dias = 14,
  ): Promise<DiaComHorarios[]> {
    await exigirMedicoNaUnidade(medicoId, unidadeId);
    const hoje = hojeNoFuso(fuso, agora());
    const inicio = de && de > hoje ? de : hoje;
    const fim = somarDias(inicio, Math.min(Math.max(dias, 1), 60) - 1);

    const [janelas, bloqueios, reservados] = await Promise.all([
      agenda.listarDisponibilidades(medicoId, unidadeId),
      agenda.listarBloqueios(medicoId),
      agenda.horariosReservados(medicoId, inicio, fim),
    ]);
    const limite = agora().getTime() + ANTECEDENCIA_MINUTOS * 60_000;

    const resultado: DiaComHorarios[] = [];
    for (let data = inicio; data <= fim; data = somarDias(data, 1)) {
      const doDia = janelas.filter((j) => j.diaSemana === diaDaSemana(data));
      if (doDia.length === 0) continue;
      const bloqueiosDoDia = bloqueios.filter(
        (b) => b.data === data && (b.unidadeId === null || b.unidadeId === unidadeId),
      );
      if (bloqueiosDoDia.some((b) => !b.inicio)) continue;
      const ocupados = reservados.get(data) ?? new Set<string>();
      const horarios = fatiarJanelas(doDia).filter((hora) => {
        if (ocupados.has(hora)) return false;
        if (instanteLocal(data, hora).getTime() < limite) return false;
        const m = minutosDoDia(hora);
        return !bloqueiosDoDia.some(
          (b) => b.inicio && b.fim && m >= minutosDoDia(b.inicio) && m < minutosDoDia(b.fim),
        );
      });
      if (horarios.length > 0) resultado.push({ data, horarios });
    }
    return resultado;
  }

  /** O horário pedido existe na agenda e está livre agora? (a transação confirma de novo) */
  async function horarioEstaLivre(medicoId: string, unidadeId: string, data: string, hora: string) {
    const dias = await horariosLivres(medicoId, unidadeId, data, 1);
    return dias.some((d) => d.data === data && d.horarios.includes(hora));
  }

  return {
    horariosLivres,
    horarioEstaLivre,
    exigirMedicoNaUnidade,

    // --- Consultórios (manutenção da unidade ou administrativo) ---------
    async listarConsultorios(unidadeId: string): Promise<Consultorio[]> {
      return agenda.listarConsultorios(unidadeId);
    },
    async criarConsultorio(ator: Ator, unidadeId: string, nome: string): Promise<Consultorio> {
      exigirGestaoUnidade(ator, unidadeId);
      if (!(await unidades.buscarPorId(unidadeId))) throw erros.naoEncontrado();
      return agenda.criarConsultorio({ unidadeId, nome, ativo: true });
    },
    async atualizarConsultorio(ator: Ator, id: string, dados: { nome?: string; ativo?: boolean }) {
      const atual = await agenda.buscarConsultorio(id);
      if (!atual) throw erros.naoEncontrado('Não encontramos esse consultório.');
      exigirGestaoUnidade(ator, atual.unidadeId);
      return (await agenda.atualizarConsultorio(id, dados))!;
    },

    // --- Disponibilidades e bloqueios -------------------------------------
    async listarDisponibilidades(medicoId: string, unidadeId?: string): Promise<Disponibilidade[]> {
      return agenda.listarDisponibilidades(medicoId, unidadeId);
    },
    async criarDisponibilidade(
      ator: Ator,
      medicoId: string,
      dados: Omit<Disponibilidade, 'id' | 'medicoId' | 'ativa'>,
    ): Promise<Disponibilidade> {
      exigirGestaoUnidade(ator, dados.unidadeId);
      await exigirMedicoNaUnidade(medicoId, dados.unidadeId);
      if (minutosDoDia(dados.fim) - minutosDoDia(dados.inicio) < dados.duracaoMinutos) {
        throw erros.dadosInvalidos([
          {
            campo: 'fim',
            mensagem: 'O fim precisa ser depois do início, com tempo para ao menos uma consulta.',
          },
        ]);
      }
      return agenda.criarDisponibilidade({ ...dados, medicoId, ativa: true });
    },
    async desativarDisponibilidade(ator: Ator, id: string): Promise<void> {
      const atual = await agenda.buscarDisponibilidade(id);
      if (!atual) throw erros.naoEncontrado();
      exigirGestaoUnidade(ator, atual.unidadeId);
      await agenda.desativarDisponibilidade(id);
    },
    async listarBloqueios(medicoId: string): Promise<Bloqueio[]> {
      return agenda.listarBloqueios(medicoId);
    },
    async criarBloqueio(
      ator: Ator,
      medicoId: string,
      dados: Omit<Bloqueio, 'id' | 'medicoId' | 'ativo'>,
    ): Promise<Bloqueio> {
      if (dados.unidadeId) exigirGestaoUnidade(ator, dados.unidadeId);
      else if (ator.perfil !== 'administrativo') {
        throw erros.dadosInvalidos([
          { campo: 'unidadeId', mensagem: 'Escolha a unidade do bloqueio.' },
        ]);
      }
      if (!(await medicos.buscarPorId(medicoId))) throw erros.naoEncontrado();
      return agenda.criarBloqueio({ ...dados, medicoId, ativo: true });
    },
    async desativarBloqueio(ator: Ator, id: string): Promise<void> {
      const atual = await agenda.buscarBloqueio(id);
      if (!atual) throw erros.naoEncontrado();
      if (atual.unidadeId) exigirGestaoUnidade(ator, atual.unidadeId);
      else if (ator.perfil !== 'administrativo') throw erros.acessoNegado();
      await agenda.desativarBloqueio(id);
    },
  };
}

export type AgendaService = ReturnType<typeof criarAgendaService>;
