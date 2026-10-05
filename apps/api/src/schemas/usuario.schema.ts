import { z } from 'zod';

import { hojeNoFuso } from '../utils/datas.js';
import * as campo from './campos.js';

/**
 * PUT /usuarios/me: a pessoa envia o conjunto editável completo. CPF, e-mail,
 * perfil e status não entram (strictObject recusa campos a mais).
 */
export function criarSchemaAtualizarMe(fuso: string) {
  return z.strictObject({
    nome: campo.nome,
    telefone: campo.telefone,
    dataNascimento: campo.dataNascimento(() => hojeNoFuso(fuso)),
    sexo: campo.sexo.optional(),
    preferencias: campo.preferencias,
    consentimento: z
      .strictObject({
        exibicaoPainel: z.boolean({
          error: 'Escolha se o seu nome completo pode aparecer no painel da recepção.',
        }),
      })
      .optional(),
  });
}

export type DadosAtualizarMe = z.infer<ReturnType<typeof criarSchemaAtualizarMe>>;
