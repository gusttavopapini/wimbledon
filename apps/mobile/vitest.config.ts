import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

// Testes só da lógica sem interface (máscaras, validação, erros). As telas
// foram conferidas de ponta a ponta contra a API no emulador.
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { include: ['tests/**/*.test.ts'], environment: 'node' },
});
