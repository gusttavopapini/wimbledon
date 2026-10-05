import { FieldValue, type Firestore, type Query } from 'firebase-admin/firestore';

import type { Conselho } from '../schemas/medico.schema.js';
import type { Medico, SemDatas } from '../types/cadastros.js';
import { codigoFirestore, comDatas, NAO_ENCONTRADO, UNICIDADES } from './apoio.js';

const MEDICOS = 'medicos';

/** crm_PE_123456: um registro por conselho, número e UF. */
export function idTravaConselho(conselho: Conselho): string {
  return `${conselho.tipo.toLowerCase()}_${conselho.uf}_${conselho.numero}`;
}

export interface ConsultaMedicos {
  unidadeId?: string;
  especialidadeId?: string;
}

export function criarMedicosRepository(db: Firestore) {
  const colecao = db.collection(MEDICOS);
  const unicidades = db.collection(UNICIDADES);

  return {
    novoId(): string {
      return colecao.doc().id;
    },

    /**
     * Ativos, por nome. O Firestore aceita um só array-contains por consulta:
     * filtra pela unidade no banco e pela especialidade em memória (poucos
     * médicos por unidade). Índices: unidadeIds/especialidadeIds CONTAINS + ativo + nome.
     */
    async listarAtivos(consulta: ConsultaMedicos): Promise<Medico[]> {
      let q: Query = colecao.where('ativo', '==', true);
      if (consulta.unidadeId) {
        q = q.where('unidadeIds', 'array-contains', consulta.unidadeId);
      } else if (consulta.especialidadeId) {
        q = q.where('especialidadeIds', 'array-contains', consulta.especialidadeId);
      }
      const resultado = await q.orderBy('nome').get();
      const medicos = resultado.docs.map((doc) => comDatas<Medico>(doc.id, doc.data()));
      return consulta.unidadeId && consulta.especialidadeId
        ? medicos.filter((m) => m.especialidadeIds.includes(consulta.especialidadeId!))
        : medicos;
    },

    async buscarPorId(id: string): Promise<Medico | null> {
      const doc = await colecao.doc(id).get();
      return doc.exists ? comDatas<Medico>(doc.id, doc.data()!) : null;
    },

    /** Médico + trava do registro no conselho na mesma transação. */
    async criar(medico: SemDatas<Medico>): Promise<{ conflito: boolean }> {
      const { id, ...dados } = medico;
      const trava = unicidades.doc(idTravaConselho(medico.conselho));
      return db.runTransaction(async (tx) => {
        if ((await tx.get(trava)).exists) return { conflito: true };
        const agora = FieldValue.serverTimestamp();
        tx.create(trava, { tipo: 'conselho', medicoId: id, criadoEm: agora });
        tx.create(colecao.doc(id), { ...dados, criadoEm: agora, atualizadoEm: agora });
        return { conflito: false };
      });
    },

    async substituir(
      id: string,
      dados: Omit<SemDatas<Medico>, 'id' | 'criadoPorAdministrativo'>,
    ): Promise<{ resultado: 'ok' | 'naoEncontrado' | 'conflito'; anterior?: Medico }> {
      const documento = colecao.doc(id);
      return db.runTransaction(async (tx) => {
        const atual = await tx.get(documento);
        if (!atual.exists) return { resultado: 'naoEncontrado' as const };
        const anterior = comDatas<Medico>(atual.id, atual.data()!);
        const idAntigo = idTravaConselho(anterior.conselho);
        const idNovo = idTravaConselho(dados.conselho);
        if (idAntigo !== idNovo) {
          const [travaNova, travaAntiga] = await tx.getAll(
            unicidades.doc(idNovo),
            unicidades.doc(idAntigo),
          );
          if (travaNova?.exists) return { resultado: 'conflito' as const };
          if (travaAntiga?.get('medicoId') === id) tx.delete(unicidades.doc(idAntigo));
          tx.create(unicidades.doc(idNovo), {
            tipo: 'conselho',
            medicoId: id,
            criadoEm: FieldValue.serverTimestamp(),
          });
        }
        tx.update(documento, { ...dados, atualizadoEm: FieldValue.serverTimestamp() });
        return { resultado: 'ok' as const, anterior };
      });
    },

    async desativar(id: string): Promise<boolean> {
      try {
        await colecao.doc(id).update({ ativo: false, atualizadoEm: FieldValue.serverTimestamp() });
        return true;
      } catch (erro) {
        if (codigoFirestore(erro) === NAO_ENCONTRADO) return false;
        throw erro;
      }
    },

    /** arrayUnion/arrayRemove são atômicos: duas alocações ao mesmo tempo não se perdem. */
    async alterarUnidades(
      id: string,
      operacao: 'adicionar' | 'remover',
      unidadeId: string,
    ): Promise<Medico | null> {
      try {
        await colecao.doc(id).update({
          unidadeIds:
            operacao === 'adicionar'
              ? FieldValue.arrayUnion(unidadeId)
              : FieldValue.arrayRemove(unidadeId),
          atualizadoEm: FieldValue.serverTimestamp(),
        });
      } catch (erro) {
        if (codigoFirestore(erro) === NAO_ENCONTRADO) return null;
        throw erro;
      }
      return this.buscarPorId(id);
    },
  };
}

export type MedicosRepository = ReturnType<typeof criarMedicosRepository>;
