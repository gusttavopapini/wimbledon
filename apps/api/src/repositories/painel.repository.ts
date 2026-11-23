import type { Timestamp} from 'firebase-admin/firestore';
import { FieldValue, type Firestore } from 'firebase-admin/firestore';

import type { PainelDispositivo } from '../types/atendimento.js';
import { codigoFirestore, NAO_ENCONTRADO } from './apoio.js';
import { deFirestore } from './conversao.js';

export interface Pareamento {
  codigo: string;
  segredoHash: string;
  expiraEm: Date;
  /** Preenchido quando a manutenção aprova; entregue UMA vez para a TV. */
  token: string | null;
  dispositivoId: string | null;
  unidadeId: string | null;
}

/**
 * TVs (painelDispositivos) e o pareamento por código de 6 números: a TV mostra
 * o código, a manutenção digita no app e a TV recebe o token de dispositivo.
 */
export function criarPainelRepository(db: Firestore) {
  const dispositivos = db.collection('painelDispositivos');
  const pareamentos = db.collection('pareamentosPainel');

  return {
    async buscarPorTokenHash(tokenHash: string): Promise<PainelDispositivo | null> {
      const r = await dispositivos.where('tokenHash', '==', tokenHash).limit(1).get();
      const doc = r.docs[0];
      return doc ? deFirestore<PainelDispositivo>(doc.id, doc.data()) : null;
    },

    async listarDaUnidade(unidadeId: string): Promise<PainelDispositivo[]> {
      const r = await dispositivos.where('unidadeId', '==', unidadeId).get();
      return r.docs.map((d) => deFirestore<PainelDispositivo>(d.id, d.data()));
    },

    async buscar(id: string): Promise<PainelDispositivo | null> {
      const d = await dispositivos.doc(id).get();
      return d.exists ? deFirestore<PainelDispositivo>(d.id, d.data()!) : null;
    },

    async desativar(id: string): Promise<boolean> {
      try {
        await dispositivos.doc(id).update({ ativo: false });
        return true;
      } catch (erro) {
        if (codigoFirestore(erro) === NAO_ENCONTRADO) return false;
        throw erro;
      }
    },

    /** Cria o pareamento se o código estiver livre (ou vencido). */
    async criarPareamento(codigo: string, segredoHash: string, expiraEm: Date): Promise<boolean> {
      return db.runTransaction(async (tx) => {
        const ref = pareamentos.doc(codigo);
        const atual = await tx.get(ref);
        const expira = atual.get('expiraEm') as Timestamp | undefined;
        if (atual.exists && expira && expira.toMillis() > Date.now()) return false;
        tx.set(ref, { segredoHash, expiraEm, token: null, dispositivoId: null, unidadeId: null });
        return true;
      });
    },

    async buscarPareamento(codigo: string): Promise<Pareamento | null> {
      const d = await pareamentos.doc(codigo).get();
      if (!d.exists) return null;
      const dados = deFirestore<Pareamento & { id: string }>(d.id, d.data()!);
      return { ...dados, codigo };
    },

    /** Aprova: cria o dispositivo e deixa o token esperando a TV buscar. */
    async aprovarPareamento(
      codigo: string,
      dispositivo: Omit<PainelDispositivo, 'id' | 'criadoEm'>,
      token: string,
    ): Promise<PainelDispositivo | null> {
      return db.runTransaction(async (tx) => {
        const ref = pareamentos.doc(codigo);
        const p = await tx.get(ref);
        const expira = p.get('expiraEm') as Timestamp | undefined;
        if (!p.exists || !expira || expira.toMillis() < Date.now() || p.get('dispositivoId'))
          return null;
        const novo = dispositivos.doc();
        const criadoEm = new Date();
        tx.create(novo, { ...dispositivo, criadoEm });
        tx.update(ref, { token, dispositivoId: novo.id, unidadeId: dispositivo.unidadeId });
        return { ...dispositivo, id: novo.id, criadoEm };
      });
    },

    /** A TV leva o token: ele sai do pareamento na mesma transação. */
    async retirarToken(codigo: string): Promise<{ token: string; unidadeId: string } | null> {
      return db.runTransaction(async (tx) => {
        const ref = pareamentos.doc(codigo);
        const p = await tx.get(ref);
        const token = p.get('token') as string | null | undefined;
        if (!p.exists || !token) return null;
        tx.update(ref, { token: FieldValue.delete(), expiraEm: new Date() });
        return { token, unidadeId: String(p.get('unidadeId')) };
      });
    },
  };
}

export type PainelRepository = ReturnType<typeof criarPainelRepository>;
