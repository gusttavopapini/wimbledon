import { FieldValue, type Firestore } from 'firebase-admin/firestore';

import type { Bloqueio, Consultorio, Disponibilidade } from '../types/atendimento.js';
import { codigoFirestore, NAO_ENCONTRADO } from './apoio.js';
import { deFirestore } from './conversao.js';

/**
 * Consultórios, disponibilidades semanais, bloqueios e as reservas de horário.
 * As consultas usam só igualdades: o Firestore combina os índices simples e
 * não precisa de índice composto. A ordenação é feita em memória.
 */
export function criarAgendaRepository(db: Firestore) {
  const consultorios = db.collection('consultorios');
  const disponibilidades = db.collection('disponibilidades');
  const bloqueios = db.collection('bloqueios');
  const reservas = db.collection('reservasHorario');

  async function desativar(
    colecao: FirebaseFirestore.CollectionReference,
    id: string,
    campo: string,
  ) {
    try {
      await colecao.doc(id).update({ [campo]: false, atualizadoEm: FieldValue.serverTimestamp() });
      return true;
    } catch (erro) {
      if (codigoFirestore(erro) === NAO_ENCONTRADO) return false;
      throw erro;
    }
  }

  return {
    // --- Consultórios ---------------------------------------------------
    async listarConsultorios(unidadeId: string): Promise<Consultorio[]> {
      const r = await consultorios.where('unidadeId', '==', unidadeId).get();
      return r.docs
        .map((d) => deFirestore<Consultorio>(d.id, d.data()))
        .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true }));
    },
    async buscarConsultorio(id: string): Promise<Consultorio | null> {
      const d = await consultorios.doc(id).get();
      return d.exists ? deFirestore<Consultorio>(d.id, d.data()!) : null;
    },
    async criarConsultorio(dados: Omit<Consultorio, 'id'>): Promise<Consultorio> {
      const ref = consultorios.doc();
      const agora = FieldValue.serverTimestamp();
      await ref.create({ ...dados, criadoEm: agora, atualizadoEm: agora });
      return { id: ref.id, ...dados };
    },
    async atualizarConsultorio(id: string, dados: Partial<Omit<Consultorio, 'id' | 'unidadeId'>>) {
      try {
        await consultorios.doc(id).update({ ...dados, atualizadoEm: FieldValue.serverTimestamp() });
      } catch (erro) {
        if (codigoFirestore(erro) === NAO_ENCONTRADO) return null;
        throw erro;
      }
      return this.buscarConsultorio(id);
    },

    // --- Disponibilidades -----------------------------------------------
    async listarDisponibilidades(medicoId: string, unidadeId?: string): Promise<Disponibilidade[]> {
      let q = disponibilidades.where('medicoId', '==', medicoId).where('ativa', '==', true);
      if (unidadeId) q = q.where('unidadeId', '==', unidadeId);
      const r = await q.get();
      return r.docs
        .map((d) => deFirestore<Disponibilidade>(d.id, d.data()))
        .sort((a, b) => a.diaSemana - b.diaSemana || a.inicio.localeCompare(b.inicio));
    },
    async buscarDisponibilidade(id: string): Promise<Disponibilidade | null> {
      const d = await disponibilidades.doc(id).get();
      return d.exists ? deFirestore<Disponibilidade>(d.id, d.data()!) : null;
    },
    async criarDisponibilidade(dados: Omit<Disponibilidade, 'id'>): Promise<Disponibilidade> {
      const ref = disponibilidades.doc();
      const agora = FieldValue.serverTimestamp();
      await ref.create({ ...dados, criadoEm: agora, atualizadoEm: agora });
      return { id: ref.id, ...dados };
    },
    desativarDisponibilidade: (id: string) => desativar(disponibilidades, id, 'ativa'),

    // --- Bloqueios -------------------------------------------------------
    async listarBloqueios(medicoId: string): Promise<Bloqueio[]> {
      const r = await bloqueios.where('medicoId', '==', medicoId).where('ativo', '==', true).get();
      return r.docs
        .map((d) => deFirestore<Bloqueio>(d.id, d.data()))
        .sort((a, b) => a.data.localeCompare(b.data));
    },
    async buscarBloqueio(id: string): Promise<Bloqueio | null> {
      const d = await bloqueios.doc(id).get();
      return d.exists ? deFirestore<Bloqueio>(d.id, d.data()!) : null;
    },
    async criarBloqueio(dados: Omit<Bloqueio, 'id'>): Promise<Bloqueio> {
      const ref = bloqueios.doc();
      const agora = FieldValue.serverTimestamp();
      await ref.create({ ...dados, criadoEm: agora, atualizadoEm: agora });
      return { id: ref.id, ...dados };
    },
    desativarBloqueio: (id: string) => desativar(bloqueios, id, 'ativo'),

    // --- Reservas (RN02) -------------------------------------------------
    /** Horários "HH:mm" já reservados do médico, por dia, a partir de uma data. */
    async horariosReservados(
      medicoId: string,
      de: string,
      ate: string,
    ): Promise<Map<string, Set<string>>> {
      const r = await reservas.where('medicoId', '==', medicoId).get();
      const porDia = new Map<string, Set<string>>();
      for (const doc of r.docs) {
        const { data, hora } = doc.data() as { data: string; hora: string };
        if (data < de || data > ate) continue;
        if (!porDia.has(data)) porDia.set(data, new Set());
        porDia.get(data)!.add(hora);
      }
      return porDia;
    },
  };
}

export type AgendaRepository = ReturnType<typeof criarAgendaRepository>;
