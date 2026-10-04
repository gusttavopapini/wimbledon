import { carregarAmbiente, type Ambiente } from '../../src/config/env.js';

/** Ambiente de teste válido, sem credencial: aponta para o emulador. */
export function ambienteDeTeste(extra: NodeJS.ProcessEnv = {}): Ambiente {
  return carregarAmbiente({
    NODE_ENV: 'test',
    LOG_LEVEL: 'silent',
    FIREBASE_PROJECT_ID: 'demo-saude-palma',
    FIRESTORE_EMULATOR_HOST: process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080',
    FIREBASE_AUTH_EMULATOR_HOST: process.env.FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1:9099',
    ...extra,
  });
}
