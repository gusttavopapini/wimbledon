import { defineConfig } from 'vitest/config';

// Projeto "demo-": o emulador não aceita credencial real, então nenhum teste
// alcança o projeto de produção por engano.
const PROJETO_TESTE = 'demo-saude-palma';

export default defineConfig({
  test: {
    env: {
      NODE_ENV: 'test',
      LOG_LEVEL: 'silent',
      FIREBASE_PROJECT_ID: PROJETO_TESTE,
      GCLOUD_PROJECT: PROJETO_TESTE,
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/server.ts'],
      thresholds: {
        'src/services/**': { statements: 60, branches: 60, functions: 60, lines: 60 },
      },
    },
    projects: [
      {
        extends: true,
        test: { name: 'unidade', include: ['tests/unidade/**/*.test.ts'] },
      },
      {
        extends: true,
        test: {
          name: 'integracao',
          include: ['tests/integracao/**/*.test.ts'],
          globalSetup: ['tests/integracao/exigir-emulador.ts'],
          // Os testes compartilham o mesmo emulador: rodam um arquivo por vez.
          fileParallelism: false,
        },
      },
    ],
  },
});
