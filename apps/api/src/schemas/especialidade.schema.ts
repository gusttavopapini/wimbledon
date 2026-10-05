import { z } from 'zod';

import { idDocumento } from './campos.js';

const nomeEspecialidade = z
  .string({ error: 'Digite o nome da especialidade. Exemplo: Cardiologia' })
  .transform((valor) => valor.trim().replace(/\s+/g, ' '))
  .pipe(
    z
      .string()
      .min(3, 'Digite o nome da especialidade. Exemplo: Cardiologia')
      .max(60, 'O nome ficou longo demais. Use no máximo 60 letras.')
      .regex(/^[\p{L} -]+$/u, 'Use só letras no nome da especialidade.'),
  );

const descricao = z
  .string({ error: 'Escreva uma frase simples sobre o que a especialidade cuida.' })
  .transform((valor) => valor.trim())
  .pipe(
    z
      .string()
      .min(10, 'Escreva uma frase simples sobre o que a especialidade cuida.')
      .max(300, 'A descrição ficou longa demais. Use no máximo 300 letras.'),
  );

const palavrasChave = z
  .array(
    z
      .string()
      .transform((valor) => valor.trim().toLowerCase())
      .pipe(z.string().min(2, 'Cada palavra-chave precisa de pelo menos 2 letras.').max(40)),
    { error: 'Informe as palavras-chave como uma lista. Exemplo: ["coração", "pressão"]' },
  )
  .max(30, 'Use no máximo 30 palavras-chave.')
  .transform((lista) => [...new Set(lista)]);

export const schemaCriarEspecialidade = z.strictObject({
  nome: nomeEspecialidade,
  descricao,
  palavrasChave: palavrasChave.default([]),
});
export type DadosCriarEspecialidade = z.infer<typeof schemaCriarEspecialidade>;

/** PUT substitui o conjunto editável; o id (ligado ao ícone) não muda. */
export const schemaAtualizarEspecialidade = z.strictObject({
  nome: nomeEspecialidade,
  descricao,
  palavrasChave,
  ativa: z.boolean({ error: 'Informe se a especialidade está ativa: true ou false.' }),
});
export type DadosAtualizarEspecialidade = z.infer<typeof schemaAtualizarEspecialidade>;

/** Id de especialidade: o mesmo nome do ícone (cardiologia, clinicoGeral…). */
export const paramsEspecialidade = z.strictObject({
  id: idDocumento,
});
