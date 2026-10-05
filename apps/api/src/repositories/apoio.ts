import { Timestamp, type DocumentData } from 'firebase-admin/firestore';

// Códigos gRPC que o Firestore devolve.
export const NAO_ENCONTRADO = 5;
export const JA_EXISTE = 6;

export function codigoFirestore(erro: unknown): number | undefined {
  return (erro as { code?: number } | undefined)?.code;
}

export function paraData(valor: unknown): Date {
  return valor instanceof Timestamp ? valor.toDate() : new Date(String(valor));
}

/** Documento do Firestore -> objeto de domínio com id e datas em Date. */
export function comDatas<T>(id: string, dados: DocumentData): T {
  return {
    ...dados,
    id,
    criadoEm: paraData(dados.criadoEm),
    atualizadoEm: paraData(dados.atualizadoEm),
  } as T;
}

/** Coleção das travas de unicidade (ver ADR 0003). */
export const UNICIDADES = 'unicidades';
