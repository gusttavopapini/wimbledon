import { erros } from '../errors/AppError.js';
import type { AgendaRepository } from '../repositories/agenda.repository.js';
import type { PlantoesRepository } from '../repositories/plantoes.repository.js';
import type { SessaoPlantao } from '../types/atendimento.js';
import { exigirAcessoUnidade, type Ator } from './acesso.js';
import type { ChamadosService } from './chamados.service.js';

/** RN20: um plantão por vez. P13: o consultório é escolhido ao abrir o plantão. */
export function criarPlantoesService(deps: {
  plantoes: PlantoesRepository;
  agenda: AgendaRepository;
  chamados: ChamadosService;
}) {
  const { plantoes, agenda, chamados } = deps;

  return {
    async abrir(
      ator: Ator,
      dados: { unidadeId: string; consultorioId: string },
    ): Promise<SessaoPlantao> {
      const medico = await chamados.medicoDoAtor(ator);
      exigirAcessoUnidade(ator, dados.unidadeId);
      if (!medico.unidadeIds.includes(dados.unidadeId)) throw erros.foraDaUnidade();
      const consultorio = await agenda.buscarConsultorio(dados.consultorioId);
      if (!consultorio || !consultorio.ativo || consultorio.unidadeId !== dados.unidadeId) {
        throw erros.dadosInvalidos([
          { campo: 'consultorioId', mensagem: 'Escolha um consultório desta unidade.' },
        ]);
      }
      const { conflito, sessao } = await plantoes.abrir({
        medicoId: medico.id,
        medicoNome: medico.nome,
        usuarioId: ator.uid,
        unidadeId: dados.unidadeId,
        consultorioId: consultorio.id,
        consultorioNome: consultorio.nome,
        ativa: true,
        abertaEm: new Date(),
        encerradaEm: null,
      });
      if (conflito || !sessao) throw erros.conflito('PLANTAO_JA_ATIVO');
      return sessao;
    },

    async atual(ator: Ator): Promise<SessaoPlantao | null> {
      const medico = await chamados.medicoDoAtor(ator);
      return plantoes.ativaDoMedico(medico.id);
    },

    async encerrar(ator: Ator): Promise<SessaoPlantao> {
      const medico = await chamados.medicoDoAtor(ator);
      const sessao = await plantoes.encerrar(medico.id);
      if (!sessao) throw erros.naoProcessavel('SEM_PLANTAO_ATIVO');
      return sessao;
    },
  };
}

export type PlantoesService = ReturnType<typeof criarPlantoesService>;
