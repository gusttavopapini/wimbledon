import { randomUUID } from 'node:crypto';

import type { ServicosFirebase } from '../../src/integrations/firebaseAdmin.js';
import type { Perfil } from '../../src/schemas/campos.js';
import { entrar } from './emulador.js';

/**
 * Cria no emulador uma conta com perfil e unidades nas claims (como a API faria)
 * e devolve o ID token. Para testar autorização sem passar pelo cadastro.
 */
export async function tokenDe(
  firebase: ServicosFirebase,
  perfil: Perfil,
  claims: { unidadeId?: string; unidadeIds?: string[] } = {},
): Promise<{ uid: string; token: string }> {
  const email = `${perfil}-${randomUUID().slice(0, 8)}@saude-palma.test`;
  const senha = 'senha-de-teste-123';
  const { uid } = await firebase.auth.createUser({ email, password: senha });
  await firebase.auth.setCustomUserClaims(uid, { perfil, ...claims });
  return { uid, token: await entrar(email, senha) };
}
