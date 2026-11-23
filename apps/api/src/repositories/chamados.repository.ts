import { FieldValue, type Firestore, type Transaction } from 'firebase-admin/firestore';

import type { Chamado, ChamadaPainel, Documento, StatusChamado } from '../types/atendimento.js';
import { idReservaHorario, idReservaPaciente } from '../utils/agenda.js';
import { deFirestore, paraFirestore } from './conversao.js';

export type NovoChamado = Omit<Chamado, 'criadoEm' | 'atualizadoEm'>;

export type ResultadoCriacao = { conflito: null } | { conflito: 'medico' | 'paciente' };

export type Mudanca = Partial<Omit<Chamado, 'id' | 'historico' | 'criadoEm' | 'atualizadoEm'>>;

/**
 * Resultado de uma transição: o chamado atualizado ou o motivo da recusa.
 * As travas (reservasHorario, travasAceite) são criadas na MESMA transação que
 * grava o chamado: só uma de duas requisições simultâneas consegue criá-las.
 */
export type ResultadoTransicao =
  | { ok: true; chamado: Chamado }
  | {
      ok: false;
      motivo: 'naoEncontrado' | 'statusNaoPermite' | 'jaAceito' | 'recusado';
      chamado?: Chamado;
    };

export function criarChamadosRepository(db: Firestore) {
  const chamados = db.collection('chamados');
  const reservas = db.collection('reservasHorario');
  const travasAceite = db.collection('travasAceite');
  const chamadasPainel = db.collection('chamadasPainel');
  const documentos = db.collection('documentos');

  const de = (doc: FirebaseFirestore.DocumentSnapshot) => deFirestore<Chamado>(doc.id, doc.data()!);

  function liberarReservas(tx: Transaction, chamado: Chamado) {
    if (chamado.tipo !== 'agendado' || !chamado.hora || !chamado.medicoId) return;
    tx.delete(reservas.doc(idReservaHorario(chamado.medicoId, chamado.data, chamado.hora)));
    tx.delete(reservas.doc(idReservaPaciente(chamado.pacienteId, chamado.data, chamado.hora)));
  }

  return {
    novoId: () => chamados.doc().id,

    /** Cria o chamado e, se agendado, as reservas do médico (RN02) e do paciente (RN03). */
    async criar(chamado: NovoChamado): Promise<ResultadoCriacao> {
      return db.runTransaction(async (tx) => {
        const ref = chamados.doc(chamado.id);
        if (chamado.tipo === 'agendado' && chamado.medicoId && chamado.hora) {
          const travaMedico = reservas.doc(
            idReservaHorario(chamado.medicoId, chamado.data, chamado.hora),
          );
          const travaPaciente = reservas.doc(
            idReservaPaciente(chamado.pacienteId, chamado.data, chamado.hora),
          );
          const [m, p] = await tx.getAll(travaMedico, travaPaciente);
          if (m?.exists) return { conflito: 'medico' as const };
          if (p?.exists) return { conflito: 'paciente' as const };
          const base = {
            chamadoId: chamado.id,
            data: chamado.data,
            hora: chamado.hora,
            criadoEm: FieldValue.serverTimestamp(),
          };
          tx.create(travaMedico, { ...base, medicoId: chamado.medicoId });
          tx.create(travaPaciente, { ...base, pacienteId: chamado.pacienteId });
        }
        const agora = FieldValue.serverTimestamp();
        tx.create(ref, { ...paraFirestore(chamado), criadoEm: agora, atualizadoEm: agora });
        return { conflito: null };
      });
    },

    async buscarPorId(id: string): Promise<Chamado | null> {
      const doc = await chamados.doc(id).get();
      return doc.exists ? de(doc) : null;
    },

    async listarDoPaciente(pacienteId: string): Promise<Chamado[]> {
      const r = await chamados.where('pacienteId', '==', pacienteId).get();
      return r.docs.map(de);
    },

    async listarDaUnidadeNoDia(unidadeId: string, data: string): Promise<Chamado[]> {
      const r = await chamados.where('unidadeId', '==', unidadeId).where('data', '==', data).get();
      return r.docs.map(de);
    },

    async listarDoMedicoNoDia(medicoId: string, data: string): Promise<Chamado[]> {
      const r = await chamados.where('medicoId', '==', medicoId).where('data', '==', data).get();
      return r.docs.map(de);
    },

    /**
     * Muda o status numa transação. `decidir` recebe o chamado atual e devolve
     * as mudanças, ou um motivo de recusa. Opcionalmente cria a trava de aceite
     * (RN21) e libera as reservas de horário (cancelamento).
     */
    async transicionar(
      id: string,
      opcoes: {
        de: StatusChamado[];
        para: StatusChamado;
        por: string;
        decidir?: (atual: Chamado) => Mudanca | { recusar: true };
        criarTravaAceite?: { medicoId: string };
        liberarReservas?: boolean;
        chamadaPainel?: (atualizado: Chamado) => Omit<ChamadaPainel, 'id'> | null;
      },
    ): Promise<ResultadoTransicao> {
      return db.runTransaction(async (tx) => {
        const ref = chamados.doc(id);
        const doc = await tx.get(ref);
        if (!doc.exists) return { ok: false, motivo: 'naoEncontrado' as const };
        const atual = de(doc);
        if (!opcoes.de.includes(atual.status)) {
          return { ok: false, motivo: 'statusNaoPermite' as const, chamado: atual };
        }
        if (opcoes.criarTravaAceite) {
          const trava = travasAceite.doc(id);
          if ((await tx.get(trava)).exists)
            return { ok: false, motivo: 'jaAceito' as const, chamado: atual };
          tx.create(trava, {
            medicoId: opcoes.criarTravaAceite.medicoId,
            criadoEm: FieldValue.serverTimestamp(),
          });
        }
        const mudanca = opcoes.decidir ? opcoes.decidir(atual) : {};
        if ('recusar' in mudanca) return { ok: false, motivo: 'recusado' as const, chamado: atual };

        const agora = new Date();
        const evento = { status: opcoes.para, em: agora, por: opcoes.por };
        tx.update(ref, {
          ...mudanca,
          status: opcoes.para,
          historico: FieldValue.arrayUnion(evento),
          atualizadoEm: FieldValue.serverTimestamp(),
        });
        if (opcoes.liberarReservas) liberarReservas(tx, atual);

        const atualizado: Chamado = {
          ...atual,
          ...(mudanca as Mudanca),
          status: opcoes.para,
          historico: [...atual.historico, evento],
          atualizadoEm: agora,
        };
        const chamada = opcoes.chamadaPainel?.(atualizado);
        if (chamada) tx.create(chamadasPainel.doc(), chamada);
        return { ok: true as const, chamado: atualizado };
      });
    },

    /** Reagendar: troca as reservas antigas pelas novas na mesma transação. */
    async reagendar(
      id: string,
      novo: { medicoId: string; inicio: Date; data: string; hora: string },
      por: string,
    ): Promise<ResultadoTransicao | { ok: false; motivo: 'conflitoMedico' | 'conflitoPaciente' }> {
      return db.runTransaction(async (tx) => {
        const ref = chamados.doc(id);
        const doc = await tx.get(ref);
        if (!doc.exists) return { ok: false, motivo: 'naoEncontrado' as const };
        const atual = de(doc);
        if (atual.status !== 'agendado' && atual.status !== 'aguardando_recepcao') {
          return { ok: false, motivo: 'statusNaoPermite' as const, chamado: atual };
        }
        const travaMedico = reservas.doc(idReservaHorario(novo.medicoId, novo.data, novo.hora));
        const travaPaciente = reservas.doc(
          idReservaPaciente(atual.pacienteId, novo.data, novo.hora),
        );
        const [m, p] = await tx.getAll(travaMedico, travaPaciente);
        if (m?.exists) return { ok: false, motivo: 'conflitoMedico' as const };
        if (p?.exists) return { ok: false, motivo: 'conflitoPaciente' as const };
        liberarReservas(tx, atual);
        const base = {
          chamadoId: id,
          data: novo.data,
          hora: novo.hora,
          criadoEm: FieldValue.serverTimestamp(),
        };
        tx.create(travaMedico, { ...base, medicoId: novo.medicoId });
        tx.create(travaPaciente, { ...base, pacienteId: atual.pacienteId });
        const agora = new Date();
        const evento = { status: 'agendado' as const, em: agora, por };
        tx.update(ref, {
          ...novo,
          status: 'agendado',
          historico: FieldValue.arrayUnion(evento),
          atualizadoEm: FieldValue.serverTimestamp(),
        });
        return {
          ok: true as const,
          chamado: {
            ...atual,
            ...novo,
            status: 'agendado',
            historico: [...atual.historico, evento],
            atualizadoEm: agora,
          },
        };
      });
    },

    /** Mais uma chamada no painel (o paciente não ouviu). */
    async registrarChamadaPainel(chamada: Omit<ChamadaPainel, 'id'>): Promise<void> {
      await chamadasPainel.add(chamada);
    },

    async chamadasDoDia(unidadeId: string, data: string): Promise<ChamadaPainel[]> {
      const r = await chamadasPainel
        .where('unidadeId', '==', unidadeId)
        .where('data', '==', data)
        .get();
      return r.docs
        .map((d) => deFirestore<ChamadaPainel>(d.id, d.data()))
        .sort((a, b) => b.em.getTime() - a.em.getTime());
    },

    // --- Documentos ------------------------------------------------------
    async criarDocumentos(lista: Omit<Documento, 'id'>[]): Promise<Documento[]> {
      const lote = db.batch();
      const criados = lista.map((dados) => {
        const ref = documentos.doc();
        lote.create(ref, dados);
        return { ...dados, id: ref.id };
      });
      await lote.commit();
      return criados;
    },
    async documentosDoPaciente(pacienteId: string): Promise<Documento[]> {
      const r = await documentos
        .where('pacienteId', '==', pacienteId)
        .where('ativo', '==', true)
        .get();
      return r.docs
        .map((d) => deFirestore<Documento>(d.id, d.data()))
        .sort((a, b) => b.emitidoEm.getTime() - a.emitidoEm.getTime());
    },
    async documentosDoChamado(chamadoId: string): Promise<Documento[]> {
      const r = await documentos
        .where('chamadoId', '==', chamadoId)
        .where('ativo', '==', true)
        .get();
      return r.docs.map((d) => deFirestore<Documento>(d.id, d.data()));
    },
    async buscarDocumento(id: string): Promise<Documento | null> {
      const d = await documentos.doc(id).get();
      return d.exists ? deFirestore<Documento>(d.id, d.data()!) : null;
    },
  };
}

export type ChamadosRepository = ReturnType<typeof criarChamadosRepository>;
