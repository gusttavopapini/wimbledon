import { FieldValue, type Firestore } from 'firebase-admin/firestore';

import type { Especialidade, SemDatas } from '../types/cadastros.js';
import { codigoFirestore, comDatas, JA_EXISTE, NAO_ENCONTRADO } from './apoio.js';

const ESPECIALIDADES = 'especialidades';

export function criarEspecialidadesRepository(db: Firestore) {
  const colecao = db.collection(ESPECIALIDADES);

  return {
    /** Ativas, por nome. Índice composto: ativa + nome. */
    async listarAtivas(): Promise<Especialidade[]> {
      const resultado = await colecao.where('ativa', '==', true).orderBy('nome').get();
      return resultado.docs.map((doc) => comDatas<Especialidade>(doc.id, doc.data()));
    },

    async buscarPorId(id: string): Promise<Especialidade | null> {
      const doc = await colecao.doc(id).get();
      return doc.exists ? comDatas<Especialidade>(doc.id, doc.data()!) : null;
    },

    /** Ids que existem e estão ativos, entre os informados. */
    async idsAtivos(ids: string[]): Promise<Set<string>> {
      if (ids.length === 0) return new Set();
      const docs = await db.getAll(...ids.map((id) => colecao.doc(id)));
      return new Set(docs.filter((d) => d.exists && d.get('ativa') === true).map((d) => d.id));
    },

    /** create() falha se o id já existe: o id vem do nome, então o nome é único. */
    async criar(especialidade: SemDatas<Especialidade>): Promise<{ conflito: boolean }> {
      const { id, ...dados } = especialidade;
      const agora = FieldValue.serverTimestamp();
      try {
        await colecao.doc(id).create({ ...dados, criadoEm: agora, atualizadoEm: agora });
        return { conflito: false };
      } catch (erro) {
        if (codigoFirestore(erro) === JA_EXISTE) return { conflito: true };
        throw erro;
      }
    },

    async atualizar(
      id: string,
      dados: Partial<Omit<Especialidade, 'id' | 'criadoEm' | 'atualizadoEm'>>,
    ): Promise<Especialidade | null> {
      try {
        await colecao.doc(id).update({ ...dados, atualizadoEm: FieldValue.serverTimestamp() });
      } catch (erro) {
        if (codigoFirestore(erro) === NAO_ENCONTRADO) return null;
        throw erro;
      }
      return this.buscarPorId(id);
    },
  };
}

export type EspecialidadesRepository = ReturnType<typeof criarEspecialidadesRepository>;
