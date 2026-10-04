import { readFileSync } from 'node:fs';

import {
  assertFails,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, collection, getDocs } from 'firebase/firestore';
import { afterAll, beforeAll, describe, it } from 'vitest';

// Este teste age como um CLIENTE (o mesmo SDK que um app usaria) para provar
// que o Firestore recusa tudo: o único caminho até o banco é a API.
const REGRAS = readFileSync(new URL('../../../../infra/firestore.rules', import.meta.url), 'utf8');

describe('regras do Firestore: nenhum cliente acessa o banco', () => {
  let ambiente: RulesTestEnvironment;

  beforeAll(async () => {
    const [host, porta] = (process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080').split(':');
    ambiente = await initializeTestEnvironment({
      projectId: process.env.FIREBASE_PROJECT_ID ?? 'demo-saude-palma',
      firestore: { rules: REGRAS, host: host ?? '127.0.0.1', port: Number(porta) },
    });
  });

  afterAll(async () => {
    await ambiente?.cleanup();
  });

  const contextos = {
    'visitante sem login': () => ambiente.unauthenticatedContext(),
    'paciente logado': () => ambiente.authenticatedContext('paciente-1', { perfil: 'paciente' }),
    'administrativo logado': () =>
      ambiente.authenticatedContext('admin-1', { perfil: 'administrativo' }),
  };

  for (const [nome, criarContexto] of Object.entries(contextos)) {
    it(`${nome} não lê nem escreve`, async () => {
      const banco = criarContexto().firestore();

      await assertFails(getDoc(doc(banco, 'usuarios/paciente-1')));
      await assertFails(getDocs(collection(banco, 'usuarios')));
      await assertFails(setDoc(doc(banco, 'usuarios/paciente-1'), { nome: 'Teste' }));
      await assertFails(setDoc(doc(banco, 'qualquer/coisa'), { x: 1 }));
    });
  }
});
