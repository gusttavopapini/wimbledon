import { erros } from '../errors/AppError.js';
import type { EspecialidadesRepository } from '../repositories/especialidades.repository.js';
import type { UnidadesRepository } from '../repositories/unidades.repository.js';
import type {
  DadosAtualizarUnidade,
  DadosCriarUnidade,
  FiltrosUnidades,
} from '../schemas/unidade.schema.js';
import type { Unidade } from '../types/cadastros.js';
import { normalizarBusca } from '../utils/texto.js';
import { exigirIdsAtivos } from './validacoes.js';

const naoEncontrada = () =>
  erros.naoEncontrado('Não encontramos essa unidade. Volte e escolha de novo na lista.');

export function criarUnidadesService(deps: {
  unidades: UnidadesRepository;
  especialidades: EspecialidadesRepository;
}) {
  const { unidades, especialidades } = deps;

  const validarEspecialidades = (ids: string[]) =>
    exigirIdsAtivos(
      ids,
      (lista) => especialidades.idsAtivos(lista),
      'especialidadeIds',
      'ESPECIALIDADE_NAO_CADASTRADA',
    );

  return {
    /**
     * bairro e especialidadeId filtram no Firestore; busca (nome, bairro ou rua,
     * sem acento e em qualquer parte) filtra em memória, porque o Firestore não
     * busca texto por trecho. O polo tem dezenas de unidades, não milhares.
     */
    async listar(filtros: FiltrosUnidades): Promise<Unidade[]> {
      const lista = await unidades.listarAtivas({
        especialidadeId: filtros.especialidadeId,
        bairroBusca: filtros.bairro ? normalizarBusca(filtros.bairro) : undefined,
      });
      const termo = filtros.busca ? normalizarBusca(filtros.busca) : '';
      if (!termo) return lista;
      return lista.filter((u) =>
        normalizarBusca(`${u.nome} ${u.endereco.bairro} ${u.endereco.logradouro}`).includes(termo),
      );
    },

    async buscar(id: string): Promise<Unidade> {
      const unidade = await unidades.buscarPorId(id);
      if (!unidade?.ativa) throw naoEncontrada();
      return unidade;
    },

    async criar(dados: DadosCriarUnidade): Promise<Unidade> {
      await validarEspecialidades(dados.especialidadeIds);
      const id = unidades.novoId();
      const { conflito } = await unidades.criar({
        id,
        ...dados,
        bairroBusca: normalizarBusca(dados.endereco.bairro),
        ativa: true,
      });
      if (conflito) throw erros.conflito('CNPJ_JA_CADASTRADO');
      return (await unidades.buscarPorId(id))!;
    },

    async atualizar(id: string, dados: DadosAtualizarUnidade): Promise<Unidade> {
      await validarEspecialidades(dados.especialidadeIds);
      const { resultado } = await unidades.substituir(id, {
        ...dados,
        bairroBusca: normalizarBusca(dados.endereco.bairro),
      });
      if (resultado === 'naoEncontrada') throw naoEncontrada();
      if (resultado === 'conflito') throw erros.conflito('CNPJ_JA_CADASTRADO');
      return (await unidades.buscarPorId(id))!;
    },

    async desativar(id: string): Promise<void> {
      if (!(await unidades.desativar(id))) throw naoEncontrada();
    },
  };
}

export type UnidadesService = ReturnType<typeof criarUnidadesService>;
