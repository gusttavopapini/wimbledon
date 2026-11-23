import { FieldValue, type Firestore } from 'firebase-admin/firestore';

export interface RegistroAuditoria {
  atorId: string;
  perfil: string;
  unidadeId: string | null;
  acao: string;
  recurso: string;
  recursoId: string;
  ip?: string | null;
  detalhes?: Record<string, unknown>;
}

/**
 * RF34: toda escrita em dado de pessoa gera uma linha. Só inserção: as regras
 * do Firestore já negam acesso de cliente e a API nunca altera nem apaga aqui.
 * Uma falha na auditoria não derruba a operação, mas vai para o log.
 */
export function criarAuditoriaRepository(db: Firestore) {
  const colecao = db.collection('auditoria');
  return {
    async registrar(registro: RegistroAuditoria): Promise<void> {
      await colecao.add({ ...registro, em: FieldValue.serverTimestamp() });
    },
  };
}

export type AuditoriaRepository = ReturnType<typeof criarAuditoriaRepository>;
