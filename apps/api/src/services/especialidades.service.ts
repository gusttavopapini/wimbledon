import { erros } from '../errors/AppError.js';
import type { EspecialidadesRepository } from '../repositories/especialidades.repository.js';
import type {
  DadosAtualizarEspecialidade,
  DadosCriarEspecialidade,
} from '../schemas/especialidade.schema.js';
import type { Especialidade } from '../types/cadastros.js';
import { idDoNome } from '../utils/texto.js';

const naoEncontrada = () =>
  erros.naoEncontrado('Não encontramos essa especialidade. Volte e escolha de novo na lista.');

export function criarEspecialidadesService(deps: { especialidades: EspecialidadesRepository }) {
  const { especialidades } = deps;

  return {
    listar: () => especialidades.listarAtivas(),

    /** Público: especialidade desativada não aparece. */
    async buscar(id: string): Promise<Especialidade> {
      const especialidade = await especialidades.buscarPorId(id);
      if (!especialidade?.ativa) throw naoEncontrada();
      return especialidade;
    },

    /** O id sai do nome ("Clínico geral" -> clinicoGeral) e casa com o ícone do app. */
    async criar(dados: DadosCriarEspecialidade): Promise<Especialidade> {
      const id = idDoNome(dados.nome);
      const { conflito } = await especialidades.criar({ id, ...dados, ativa: true });
      if (conflito) throw erros.conflito('ESPECIALIDADE_JA_CADASTRADA');
      return (await especialidades.buscarPorId(id))!;
    },

    async atualizar(id: string, dados: DadosAtualizarEspecialidade): Promise<Especialidade> {
      const atualizada = await especialidades.atualizar(id, dados);
      if (!atualizada) throw naoEncontrada();
      return atualizada;
    },

    /** DELETE desativa; o documento fica, e a especialidade pode ser reativada pelo PUT. */
    async desativar(id: string): Promise<void> {
      if (!(await especialidades.atualizar(id, { ativa: false }))) throw naoEncontrada();
    },
  };
}

export type EspecialidadesService = ReturnType<typeof criarEspecialidadesService>;
