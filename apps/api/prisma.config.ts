import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { defineConfig } from 'prisma/config';

// O CLI do Prisma não lê o .env sozinho. O .env fica na raiz do monorepo; as
// variáveis já definidas no ambiente (CI, Render) têm precedência.
const arquivoEnv = resolve(import.meta.dirname, '../../.env');
if (existsSync(arquivoEnv)) process.loadEnvFile(arquivoEnv);

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    // As migrations usam a conexão direta (no Neon, sem o pooler: o
    // migrate precisa de advisory locks). Localmente, as duas URLs são iguais.
    // `prisma generate` não precisa de URL, por isso não é obrigatória aqui.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
