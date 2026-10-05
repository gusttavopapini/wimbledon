import { FieldValue, type Firestore, type Query } from 'firebase-admin/firestore';

import type { SemDatas, Unidade } from '../types/cadastros.js';
import { codigoFirestore, comDatas, NAO_ENCONTRADO, UNICIDADES } from './apoio.js';

const UNIDADES = 'unidades';

export function idTravaCnpj(cnpj: string): string {
  return `cnpj_${cnpj}`;
}

export interface ConsultaUnidades {
  bairroBusca?: string;
  especialidadeId?: string;
}

export function criarUnidadesRepository(db: Firestore) {
  const colecao = db.collection(UNIDADES);
  const unicidades = db.collection(UNICIDADES);

  return {
    novoId(): string {
      return colecao.doc().id;
    },

    /**
     * Ativas, por nome, com os filtros que o Firestore resolve. Índices compostos
     * em infra/firestore.indexes.json (especialidadeIds CONTAINS + ativa + bairroBusca + nome).
     */
    async listarAtivas(consulta: ConsultaUnidades): Promise<Unidade[]> {
      let q: Query = colecao.where('ativa', '==', true);
      if (consulta.especialidadeId) {
        q = q.where('especialidadeIds', 'array-contains', consulta.especialidadeId);
      }
      if (consulta.bairroBusca) q = q.where('bairroBusca', '==', consulta.bairroBusca);
      const resultado = await q.orderBy('nome').get();
      return resultado.docs.map((doc) => comDatas<Unidade>(doc.id, doc.data()));
    },

    async buscarPorId(id: string): Promise<Unidade | null> {
      const doc = await colecao.doc(id).get();
      return doc.exists ? comDatas<Unidade>(doc.id, doc.data()!) : null;
    },

    async idsAtivos(ids: string[]): Promise<Set<string>> {
      if (ids.length === 0) return new Set();
      const docs = await db.getAll(...ids.map((id) => colecao.doc(id)));
      return new Set(docs.filter((d) => d.exists && d.get('ativa') === true).map((d) => d.id));
    },

    /** Unidade + trava do CNPJ na mesma transação. */
    async criar(unidade: SemDatas<Unidade>): Promise<{ conflito: boolean }> {
      const { id, ...dados } = unidade;
      const trava = unicidades.doc(idTravaCnpj(unidade.cnpj));
      return db.runTransaction(async (tx) => {
        if ((await tx.get(trava)).exists) return { conflito: true };
        const agora = FieldValue.serverTimestamp();
        tx.create(trava, { tipo: 'cnpj', unidadeId: id, criadoEm: agora });
        tx.create(colecao.doc(id), { ...dados, criadoEm: agora, atualizadoEm: agora });
        return { conflito: false };
      });
    },

    /** Substitui os dados; se o CNPJ mudar, troca a trava na mesma transação. */
    async substituir(
      id: string,
      dados: Omit<SemDatas<Unidade>, 'id'>,
    ): Promise<{ resultado: 'ok' | 'naoEncontrada' | 'conflito' }> {
      const documento = colecao.doc(id);
      return db.runTransaction(async (tx) => {
        const atual = await tx.get(documento);
        if (!atual.exists) return { resultado: 'naoEncontrada' as const };
        const cnpjAnterior = atual.get('cnpj') as string;
        if (cnpjAnterior !== dados.cnpj) {
          const nova = unicidades.doc(idTravaCnpj(dados.cnpj));
          const antiga = unicidades.doc(idTravaCnpj(cnpjAnterior));
          const [travaNova, travaAntiga] = await tx.getAll(nova, antiga);
          if (travaNova?.exists) return { resultado: 'conflito' as const };
          if (travaAntiga?.get('unidadeId') === id) tx.delete(antiga);
          tx.create(nova, {
            tipo: 'cnpj',
            unidadeId: id,
            criadoEm: FieldValue.serverTimestamp(),
          });
        }
        tx.update(documento, { ...dados, atualizadoEm: FieldValue.serverTimestamp() });
        return { resultado: 'ok' as const };
      });
    },

    /** Exclusão lógica. A trava do CNPJ continua: a unidade pode ser reativada. */
    async desativar(id: string): Promise<boolean> {
      try {
        await colecao.doc(id).update({ ativa: false, atualizadoEm: FieldValue.serverTimestamp() });
        return true;
      } catch (erro) {
        if (codigoFirestore(erro) === NAO_ENCONTRADO) return false;
        throw erro;
      }
    },
  };
}

export type UnidadesRepository = ReturnType<typeof criarUnidadesRepository>;
