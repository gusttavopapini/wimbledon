import { z } from 'zod';

import { URGENCIAS } from '../../types/atendimento.js';

/** O que vai para a IA (RN12): só idade, sexo informado e o relato. Nunca nome, CPF, telefone ou e-mail. */
export interface EntradaTriagem {
  idade: number | null;
  sexo: string | null;
  relato: string;
  especialidades: { id: string; nome: string; descricao: string }[];
}

export const saidaTriagem = z.object({
  especialidade: z.string().min(1),
  confianca: z.number().min(0).max(1),
  urgencia: z.enum(URGENCIAS),
  sinaisAlerta: z.array(z.string()).default([]),
  justificativa: z.string().min(1).max(600),
  orientacao: z.string().min(1).max(600),
});
export type SaidaTriagem = z.infer<typeof saidaTriagem>;

/** Interface única: trocar de fornecedor de IA não muda o service (ADR 0022). */
export interface ProvedorIA {
  readonly nome: string;
  /** Devolve o JSON cru; o service valida com Zod e aplica o fallback. */
  triar(entrada: EntradaTriagem): Promise<unknown>;
}
