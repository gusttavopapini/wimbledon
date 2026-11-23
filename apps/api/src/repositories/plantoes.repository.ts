import { FieldValue, type Firestore } from 'firebase-admin/firestore';

import type { SessaoPlantao } from '../types/atendimento.js';
import { deFirestore } from './conversao.js';

/**
 * RN20: um plantão ativo por médico. A trava plantoesAtivos/{medicoId} é criada
 * na mesma transação da sessão; enquanto existir, outra abertura é recusada.
 */
export function criarPlantoesRepository(db: Firestore) {
  const sessoes = db.collection('sessoesPlantao');
  const ativos = db.collection('plantoesAtivos');

  return {
    async abrir(
      sessao: Omit<SessaoPlantao, 'id'>,
    ): Promise<{ conflito: boolean; sessao?: SessaoPlantao }> {
      return db.runTransaction(async (tx) => {
        const trava = ativos.doc(sessao.medicoId);
        if ((await tx.get(trava)).exists) return { conflito: true };
        const ref = sessoes.doc();
        tx.create(trava, { sessaoId: ref.id, criadoEm: FieldValue.serverTimestamp() });
        tx.create(ref, sessao);
        return { conflito: false, sessao: { ...sessao, id: ref.id } };
      });
    },

    async ativaDoMedico(medicoId: string): Promise<SessaoPlantao | null> {
      const trava = await ativos.doc(medicoId).get();
      if (!trava.exists) return null;
      const doc = await sessoes.doc(String(trava.get('sessaoId'))).get();
      return doc.exists ? deFirestore<SessaoPlantao>(doc.id, doc.data()!) : null;
    },

    async ativasDaUnidade(unidadeId: string): Promise<SessaoPlantao[]> {
      const r = await sessoes.where('unidadeId', '==', unidadeId).where('ativa', '==', true).get();
      return r.docs.map((d) => deFirestore<SessaoPlantao>(d.id, d.data()));
    },

    /** Encerra a sessão (registro fica) e remove a trava. */
    async encerrar(medicoId: string): Promise<SessaoPlantao | null> {
      return db.runTransaction(async (tx) => {
        const trava = ativos.doc(medicoId);
        const t = await tx.get(trava);
        if (!t.exists) return null;
        const ref = sessoes.doc(String(t.get('sessaoId')));
        const doc = await tx.get(ref);
        tx.delete(trava);
        if (!doc.exists) return null;
        const encerradaEm = new Date();
        tx.update(ref, { ativa: false, encerradaEm });
        return { ...deFirestore<SessaoPlantao>(doc.id, doc.data()!), ativa: false, encerradaEm };
      });
    },
  };
}

export type PlantoesRepository = ReturnType<typeof criarPlantoesRepository>;
