import { z } from 'zod';

import * as campo from './campos';

export const esquemaEntrar = z.object({
  email: campo.email,
  senha: campo.senhaAtual,
});
export type FormEntrar = z.infer<typeof esquemaEntrar>;

export const esquemaCriarConta = z.object({
  nome: campo.nome,
  cpf: campo.cpf,
  dataNascimento: campo.dataNascimento(),
  telefone: campo.telefone,
  email: campo.email,
  senha: campo.senhaNova,
  aceiteTermo: z.boolean().refine((aceito) => aceito, {
    message: 'Para criar a conta, marque que leu e aceita o termo de uso e privacidade.',
  }),
  /** Opcional de verdade: recusar não impede o cadastro. */
  exibicaoPainel: z.boolean(),
});
export type FormCriarConta = z.infer<typeof esquemaCriarConta>;

/** Campos da API (detalhes do 400) -> campos do formulário. */
export const CAMPO_DA_API: Record<string, keyof FormCriarConta> = {
  nome: 'nome',
  cpf: 'cpf',
  dataNascimento: 'dataNascimento',
  telefone: 'telefone',
  email: 'email',
  senha: 'senha',
  'consentimento.aceito': 'aceiteTermo',
  'consentimento.versaoTermo': 'aceiteTermo',
  'consentimento.exibicaoPainel': 'exibicaoPainel',
};
