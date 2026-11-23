import { Timestamp, type DocumentData } from 'firebase-admin/firestore';

/** Troca todo Timestamp (inclusive dentro de listas e objetos) por Date. */
function converter(valor: unknown): unknown {
  if (valor instanceof Timestamp) return valor.toDate();
  if (Array.isArray(valor)) return valor.map(converter);
  if (valor && typeof valor === 'object' && !(valor instanceof Date)) {
    return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, converter(v)]));
  }
  return valor;
}

/** Documento do Firestore -> objeto de domínio com id e datas em Date. */
export function deFirestore<T>(id: string, dados: DocumentData): T {
  return { ...(converter(dados) as object), id } as T;
}

/** Objeto de domínio -> dados para gravar (sem o id; Date vira Timestamp sozinho no Admin SDK). */
export function paraFirestore<T extends { id: string }>(objeto: T): Omit<T, 'id'> {
  const { id: _id, ...resto } = objeto;
  return resto;
}
