import { z } from 'zod';

import * as campo from './campos.js';

export const conselho = z.strictObject({
  tipo: z.literal('CRM', { error: 'O conselho do médico é o CRM.' }),
  numero: z
    .string({ error: 'Digite o número do CRM, só os números.' })
    .transform((valor) => valor.replace(/\D/g, '').replace(/^0+/, ''))
    .refine((digitos) => /^\d{1,7}$/.test(digitos), {
      message: 'Digite o número do CRM, só os números. Exemplo: 123456',
    }),
  uf: campo.uf,
});
export type Conselho = z.infer<typeof conselho>;

const corpoMedico = {
  /** Com "Dr." ou "Dra.", como aparece para o paciente. */
  nome: campo.nome,
  conselho,
  especialidadeIds: campo.listaDeIds('Escolha ao menos uma especialidade do médico.'),
  unidadeIds: campo.listaDeIds('Escolha ao menos uma unidade onde o médico atende.'),
  /** Conta do médico no app, se já existir. Pode ficar sem: o cadastro vem antes da conta. */
  usuarioId: campo.idDocumento.nullable().default(null),
};

export const schemaCriarMedico = z.strictObject(corpoMedico);
export type DadosCriarMedico = z.infer<typeof schemaCriarMedico>;

export const schemaAtualizarMedico = z.strictObject({
  ...corpoMedico,
  ativo: z.boolean({ error: 'Informe se o cadastro do médico está ativo: true ou false.' }),
});
export type DadosAtualizarMedico = z.infer<typeof schemaAtualizarMedico>;

export const filtrosMedicos = z.strictObject({
  unidadeId: campo.idDocumento.optional(),
  especialidadeId: campo.idDocumento.optional(),
});
export type FiltrosMedicos = z.infer<typeof filtrosMedicos>;

export const paramsMedico = z.strictObject({ id: campo.idDocumento });
export const paramsAlocacao = z.strictObject({
  id: campo.idDocumento,
  unidadeId: campo.idDocumento,
});
export const corpoAlocacao = z.strictObject({
  unidadeId: campo.idDocumento,
});
