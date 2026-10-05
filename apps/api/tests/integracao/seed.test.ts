import { beforeEach, describe, expect, it } from 'vitest';

import {
  criarAdministrador,
  gerarCpfFicticio,
} from '../../../../infra/seed/criar-administrador.js';
import { inicializarFirebase } from '../../src/integrations/firebaseAdmin.js';
import { ambienteDeTeste } from '../apoio/ambiente.js';
import { limparEmuladores } from '../apoio/emulador.js';

const firebase = inicializarFirebase(ambienteDeTeste());

const admin = () => ({
  nome: 'Administração Teste',
  email: 'admin@saude-palma.test',
  cpf: gerarCpfFicticio(),
  senha: 'senha-forte-de-teste',
});

beforeEach(limparEmuladores);

describe('seed do primeiro administrativo', () => {
  it('cria a conta com perfil administrativo na claim e no documento', async () => {
    const resultado = await criarAdministrador(firebase, admin());

    expect(resultado.criado).toBe(true);
    if (!resultado.criado) return;
    const conta = await firebase.auth.getUser(resultado.conta.id);
    expect(conta.customClaims).toEqual({ perfil: 'administrativo' });
    const doc = (await firebase.db.doc(`usuarios/${resultado.conta.id}`).get()).data()!;
    expect(doc).toMatchObject({ perfil: 'administrativo', status: 'ativo', criadoPor: 'seed' });
  });

  it('é idempotente: rodar de novo não cria outra conta', async () => {
    await criarAdministrador(firebase, admin());

    const segunda = await criarAdministrador(firebase, admin());

    expect(segunda).toEqual({ criado: false, motivo: 'EMAIL_JA_CADASTRADO' });
    expect((await firebase.auth.listUsers()).users).toHaveLength(1);
  });
});
