import type { Firestore } from 'firebase-admin/firestore';

import type { PreTriagem } from '../types/atendimento.js';
import { deFirestore, paraFirestore } from './conversao.js';

export function criarPreTriagensRepository(db: Firestore) {
  const colecao = db.collection('preTriagens');
  return {
    async criar(dados: Omit<PreTriagem, 'id'>): Promise<PreTriagem> {
      const ref = colecao.doc();
      const triagem = { ...dados, id: ref.id };
      await ref.create(paraFirestore(triagem));
      return triagem;
    },
    async buscar(id: string): Promise<PreTriagem | null> {
      const d = await colecao.doc(id).get();
      return d.exists ? deFirestore<PreTriagem>(d.id, d.data()!) : null;
    },
    async doPaciente(pacienteId: string): Promise<PreTriagem[]> {
      const r = await colecao.where('pacienteId', '==', pacienteId).get();
      return r.docs
        .map((d) => deFirestore<PreTriagem>(d.id, d.data()))
        .sort((a, b) => b.criadoEm.getTime() - a.criadoEm.getTime());
    },
  };
}

export type PreTriagensRepository = ReturnType<typeof criarPreTriagensRepository>;
