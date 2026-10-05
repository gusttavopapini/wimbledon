import { z } from 'zod';

import { VERSAO_TERMO_ATUAL } from '../config/termo.js';
import { hojeNoFuso } from '../utils/datas.js';
import * as campo from './campos.js';

export const CANAIS_CADASTRO = ['app', 'pwa'] as const;

export const consentimentoCadastro = z.strictObject({
  versaoTermo: z
    .string({ error: 'Leia o termo de uso e privacidade e marque que aceita.' })
    .refine((versao) => versao === VERSAO_TERMO_ATUAL, {
      message: 'O termo de uso foi atualizado. Leia a versão nova e marque que aceita.',
    }),
  aceito: z.literal(true, {
    error: 'Para criar a conta, marque que leu e aceita o termo de uso e privacidade.',
  }),
  canal: z.enum(CANAIS_CADASTRO).default('app'),
  /** Aceite específico para exibir e anunciar o nome completo no painel de TV. */
  exibicaoPainel: z.boolean({
    error: 'Escolha se o seu nome completo pode aparecer no painel da recepção.',
  }),
});

export function criarSchemaCadastro(fuso: string) {
  return z.strictObject({
    nome: campo.nome,
    cpf: campo.cpf,
    dataNascimento: campo.dataNascimento(() => hojeNoFuso(fuso)),
    telefone: campo.telefone,
    email: campo.email,
    senha: campo.senha,
    sexo: campo.sexo.optional(),
    consentimento: consentimentoCadastro,
  });
}

export type DadosCadastro = z.infer<ReturnType<typeof criarSchemaCadastro>>;
