import { z } from 'zod';

import * as campo from './campos.js';

export const TIPOS_UNIDADE = ['hospital', 'clinica'] as const;
export type TipoUnidade = (typeof TIPOS_UNIDADE)[number];

const texto = (mensagem: string, maximo: number) =>
  z
    .string({ error: mensagem })
    .transform((valor) => valor.trim().replace(/\s+/g, ' '))
    .pipe(z.string().min(1, mensagem).max(maximo, `Use no máximo ${maximo} caracteres.`));

export const endereco = z.strictObject({
  logradouro: texto('Digite a rua ou avenida. Exemplo: Rua das Jangadas', 120),
  numero: texto('Digite o número. Se não houver, escreva s/n.', 10),
  bairro: texto('Digite o bairro. Exemplo: Ilha do Leite', 60),
  cidade: texto('Digite a cidade. Exemplo: Recife', 60),
  uf: campo.uf,
  cep: campo.cep,
});
export type Endereco = z.infer<typeof endereco>;

const nomeUnidade = texto('Digite o nome da unidade.', 120).pipe(
  z.string().min(3, 'Digite o nome da unidade.'),
);

const corpoUnidade = {
  nome: nomeUnidade,
  tipo: z.enum(TIPOS_UNIDADE, { error: 'Escolha o tipo: hospital ou clinica.' }),
  cnpj: campo.cnpj,
  endereco,
  telefone: campo.telefone,
  especialidadeIds: campo.listaDeIds('Escolha ao menos uma especialidade atendida na unidade.'),
};

export const schemaCriarUnidade = z.strictObject(corpoUnidade);
export type DadosCriarUnidade = z.infer<typeof schemaCriarUnidade>;

export const schemaAtualizarUnidade = z.strictObject({
  ...corpoUnidade,
  ativa: z.boolean({ error: 'Informe se a unidade está ativa: true ou false.' }),
});
export type DadosAtualizarUnidade = z.infer<typeof schemaAtualizarUnidade>;

export const filtrosUnidades = z.strictObject({
  busca: z
    .string()
    .transform((valor) => valor.trim())
    .pipe(z.string().max(60, 'Use no máximo 60 letras na busca.'))
    .optional(),
  bairro: z
    .string()
    .transform((valor) => valor.trim())
    .pipe(z.string().min(1).max(60))
    .optional(),
  especialidadeId: campo.idDocumento.optional(),
});
export type FiltrosUnidades = z.infer<typeof filtrosUnidades>;

export const paramsUnidade = z.strictObject({ id: campo.idDocumento });
