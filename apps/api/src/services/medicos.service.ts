import type { Auth } from 'firebase-admin/auth';

import { erros } from '../errors/AppError.js';
import type { EspecialidadesRepository } from '../repositories/especialidades.repository.js';
import type { MedicosRepository } from '../repositories/medicos.repository.js';
import type { UnidadesRepository } from '../repositories/unidades.repository.js';
import type { UsuariosRepository } from '../repositories/usuarios.repository.js';
import type {
  DadosAtualizarMedico,
  DadosCriarMedico,
  FiltrosMedicos,
} from '../schemas/medico.schema.js';
import type { Medico } from '../types/cadastros.js';
import { montarClaims } from './auth.service.js';
import { exigirIdsAtivos } from './validacoes.js';

const naoEncontrado = () =>
  erros.naoEncontrado('Não encontramos esse médico. Volte e escolha de novo na lista.');

export function criarMedicosService(deps: {
  medicos: MedicosRepository;
  unidades: UnidadesRepository;
  especialidades: EspecialidadesRepository;
  usuarios: UsuariosRepository;
  auth: Pick<Auth, 'setCustomUserClaims' | 'revokeRefreshTokens'>;
}) {
  const { medicos, unidades, especialidades, usuarios, auth } = deps;

  async function validarReferencias(dados: DadosCriarMedico): Promise<void> {
    await exigirIdsAtivos(
      dados.especialidadeIds,
      (ids) => especialidades.idsAtivos(ids),
      'especialidadeIds',
      'ESPECIALIDADE_NAO_CADASTRADA',
    );
    await exigirIdsAtivos(
      dados.unidadeIds,
      (ids) => unidades.idsAtivos(ids),
      'unidadeIds',
      'UNIDADE_NAO_CADASTRADA',
    );
    if (dados.usuarioId) {
      const usuario = await usuarios.buscarPorId(dados.usuarioId);
      if (usuario?.perfil !== 'medico') {
        throw erros.naoProcessavel('USUARIO_NAO_E_MEDICO', [
          { campo: 'usuarioId', mensagem: 'Essa conta não existe ou não tem o perfil de médico.' },
        ]);
      }
    }
  }

  /**
   * A conta do médico acessa as unidades listadas nas claims (exigirUnidade).
   * Ao perder uma unidade, os tokens são revogados para o acesso cair na hora;
   * ao ganhar, a claim nova chega no próximo token (até 1 hora).
   */
  async function sincronizarConta(
    usuarioId: string | null,
    unidadeIds: string[],
    revogar: boolean,
  ): Promise<void> {
    if (!usuarioId) return;
    await usuarios.definirUnidades(usuarioId, unidadeIds);
    await auth.setCustomUserClaims(usuarioId, montarClaims({ perfil: 'medico', unidadeIds }));
    if (revogar) await auth.revokeRefreshTokens(usuarioId);
  }

  return {
    listar: (filtros: FiltrosMedicos) => medicos.listarAtivos(filtros),

    async buscar(id: string): Promise<Medico> {
      const medico = await medicos.buscarPorId(id);
      if (!medico?.ativo) throw naoEncontrado();
      return medico;
    },

    /** Só o administrativo cadastra médico (a rota garante); a manutenção só aloca. */
    async criar(dados: DadosCriarMedico, criadoPorAdministrativo: string): Promise<Medico> {
      await validarReferencias(dados);
      const id = medicos.novoId();
      const { conflito } = await medicos.criar({
        id,
        ...dados,
        ativo: true,
        criadoPorAdministrativo,
      });
      if (conflito) throw erros.conflito('CONSELHO_JA_CADASTRADO');
      await sincronizarConta(dados.usuarioId, dados.unidadeIds, false);
      return (await medicos.buscarPorId(id))!;
    },

    async atualizar(id: string, dados: DadosAtualizarMedico): Promise<Medico> {
      await validarReferencias(dados);
      const { resultado, anterior } = await medicos.substituir(id, dados);
      if (resultado === 'naoEncontrado') throw naoEncontrado();
      if (resultado === 'conflito') throw erros.conflito('CONSELHO_JA_CADASTRADO');

      const unidadesAtuais = dados.ativo ? dados.unidadeIds : [];
      // Se a conta ligada mudou, a anterior perde o acesso às unidades.
      if (anterior?.usuarioId && anterior.usuarioId !== dados.usuarioId) {
        await sincronizarConta(anterior.usuarioId, [], true);
      }
      const perdeuUnidade = (anterior?.unidadeIds ?? []).some((u) => !unidadesAtuais.includes(u));
      await sincronizarConta(dados.usuarioId, unidadesAtuais, perdeuUnidade);
      return (await medicos.buscarPorId(id))!;
    },

    /** DELETE desativa o cadastro e tira o acesso da conta às unidades. */
    async desativar(id: string): Promise<void> {
      const medico = await medicos.buscarPorId(id);
      if (!medico || !(await medicos.desativar(id))) throw naoEncontrado();
      await sincronizarConta(medico.usuarioId, [], true);
    },

    /** Aloca numa unidade. Idempotente: se já está lá, criado = false. */
    async alocar(id: string, unidadeId: string): Promise<{ medico: Medico; criado: boolean }> {
      const medico = await medicos.buscarPorId(id);
      if (!medico) {
        throw erros.naoProcessavel('MEDICO_NAO_CADASTRADO', [
          { campo: 'id', mensagem: `Não há médico cadastrado com o id ${id}.` },
        ]);
      }
      if (!medico.ativo) throw erros.naoProcessavel('MEDICO_INATIVO');
      if (!(await unidades.idsAtivos([unidadeId])).has(unidadeId)) {
        throw erros.naoProcessavel('UNIDADE_NAO_CADASTRADA', [
          { campo: 'unidadeId', mensagem: `Não encontramos ou está desativada: ${unidadeId}.` },
        ]);
      }
      if (medico.unidadeIds.includes(unidadeId)) return { medico, criado: false };

      const atualizado = (await medicos.alterarUnidades(id, 'adicionar', unidadeId))!;
      await sincronizarConta(atualizado.usuarioId, atualizado.unidadeIds, false);
      return { medico: atualizado, criado: true };
    },

    /** Desaloca. Idempotente: se já não estava na unidade, não faz nada. */
    async desalocar(id: string, unidadeId: string): Promise<void> {
      const medico = await medicos.buscarPorId(id);
      if (!medico) throw naoEncontrado();
      if (!medico.unidadeIds.includes(unidadeId)) return;
      const atualizado = (await medicos.alterarUnidades(id, 'remover', unidadeId))!;
      await sincronizarConta(atualizado.usuarioId, atualizado.unidadeIds, true);
    },
  };
}

export type MedicosService = ReturnType<typeof criarMedicosService>;
