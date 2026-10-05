import { createHash } from 'node:crypto';

import { FieldValue, Timestamp, type Firestore } from 'firebase-admin/firestore';

import type { AlteracaoUsuario, NovoUsuario, Usuario } from '../types/usuario.js';

const USUARIOS = 'usuarios';
/**
 * Documentos-trava com id determinístico (cpf_<digitos>, email_<sha256>). Criados
 * na mesma transação do usuário, garantem CPF e e-mail únicos mesmo com duas
 * requisições simultâneas: só uma transação consegue criar a trava.
 */
const UNICIDADES = 'unicidades';

export type Conflito = 'cpf' | 'email';

export function idTravaCpf(cpf: string): string {
  return `cpf_${cpf}`;
}

export function idTravaEmail(email: string): string {
  return `email_${createHash('sha256').update(email.trim().toLowerCase()).digest('hex')}`;
}

function paraData(valor: unknown): Date {
  return valor instanceof Timestamp ? valor.toDate() : new Date(String(valor));
}

function deDocumento(id: string, dados: FirebaseFirestore.DocumentData): Usuario {
  return {
    ...(dados as Omit<Usuario, 'id' | 'criadoEm' | 'atualizadoEm' | 'consentimento'>),
    id,
    consentimento: { ...dados.consentimento, aceitoEm: paraData(dados.consentimento?.aceitoEm) },
    expoPushTokens: dados.expoPushTokens ?? [],
    criadoEm: paraData(dados.criadoEm),
    atualizadoEm: paraData(dados.atualizadoEm),
  };
}

export function criarUsuariosRepository(db: Firestore) {
  const usuarios = db.collection(USUARIOS);
  const unicidades = db.collection(UNICIDADES);

  return {
    novoId(): string {
      return usuarios.doc().id;
    },

    /**
     * Cria o usuário e as travas de CPF e e-mail numa transação. Devolve o
     * conflito encontrado, sem gravar nada, se alguma trava já existir.
     */
    async criarComUnicidade(usuario: NovoUsuario): Promise<{ conflito: Conflito | null }> {
      const travaCpf = unicidades.doc(idTravaCpf(usuario.cpf));
      const travaEmail = unicidades.doc(idTravaEmail(usuario.email));
      const documento = usuarios.doc(usuario.id);

      return db.runTransaction(async (tx) => {
        const [cpf, email] = await tx.getAll(travaCpf, travaEmail);
        if (cpf?.exists) return { conflito: 'cpf' as const };
        if (email?.exists) return { conflito: 'email' as const };

        const agora = FieldValue.serverTimestamp();
        const { id: _id, ...dados } = usuario;
        tx.create(travaCpf, { tipo: 'cpf', uid: usuario.id, criadoEm: agora });
        tx.create(travaEmail, { tipo: 'email', uid: usuario.id, criadoEm: agora });
        tx.create(documento, {
          ...dados,
          consentimento: {
            ...dados.consentimento,
            aceitoEm: Timestamp.fromDate(dados.consentimento.aceitoEm),
          },
          criadoEm: agora,
          atualizadoEm: agora,
        });
        return { conflito: null };
      });
    },

    /** Desfaz criarComUnicidade (compensação quando a criação no Auth falha). */
    async removerCriacao(usuario: Pick<NovoUsuario, 'id' | 'cpf' | 'email'>): Promise<void> {
      await db.runTransaction(async (tx) => {
        const travas = [
          unicidades.doc(idTravaCpf(usuario.cpf)),
          unicidades.doc(idTravaEmail(usuario.email)),
        ];
        const lidas = await tx.getAll(...travas);
        // Só remove a trava se ela for deste usuário.
        lidas.forEach((trava, i) => {
          if (trava.exists && trava.get('uid') === usuario.id) tx.delete(travas[i]!);
        });
        tx.delete(usuarios.doc(usuario.id));
      });
    },

    async buscarPorId(id: string): Promise<Usuario | null> {
      const doc = await usuarios.doc(id).get();
      return doc.exists ? deDocumento(doc.id, doc.data()!) : null;
    },

    /** Unidades do médico no documento do usuário (espelho das claims). */
    async definirUnidades(id: string, unidadeIds: string[]): Promise<void> {
      await usuarios.doc(id).update({ unidadeIds, atualizadoEm: FieldValue.serverTimestamp() });
    },

    async atualizar(id: string, alteracao: AlteracaoUsuario): Promise<Usuario | null> {
      const referencia = usuarios.doc(id);
      const { exibicaoPainel, ...dados } = alteracao;
      // Chave presente com valor undefined = remover o campo (PUT substitui o conjunto).
      const campos = Object.fromEntries(
        Object.entries(dados).map(([chave, valor]) => [chave, valor ?? FieldValue.delete()]),
      );
      try {
        await referencia.update({
          ...campos,
          ...(exibicaoPainel === undefined
            ? {}
            : { 'consentimento.exibicaoPainel': exibicaoPainel }),
          atualizadoEm: FieldValue.serverTimestamp(),
        });
      } catch (erro) {
        // 5 = NOT_FOUND no gRPC: o documento não existe.
        if ((erro as { code?: number }).code === 5) return null;
        throw erro;
      }
      return this.buscarPorId(id);
    },
  };
}

export type UsuariosRepository = ReturnType<typeof criarUsuariosRepository>;
