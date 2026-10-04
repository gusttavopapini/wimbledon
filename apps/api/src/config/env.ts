import { z } from 'zod';

const listaSeparadaPorVirgula = z.string().transform((valor) =>
  valor
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
);

const esquemaAmbiente = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3333),
    CORS_ORIGINS: listaSeparadaPorVirgula.default([]),
    FIREBASE_PROJECT_ID: z
      .string({ error: 'obrigatória: informe o id do projeto Firebase' })
      .min(1, 'obrigatória: informe o id do projeto Firebase'),
    FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
    FIREBASE_PRIVATE_KEY: z.string().min(1).optional(),
    FIRESTORE_EMULATOR_HOST: z.string().min(1).optional(),
    FIREBASE_AUTH_EMULATOR_HOST: z.string().min(1).optional(),
    TZ_PADRAO: z.string().default('America/Recife'),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
  })
  .superRefine((env, ctx) => {
    const usaEmulador = Boolean(env.FIRESTORE_EMULATOR_HOST && env.FIREBASE_AUTH_EMULATOR_HOST);
    if (usaEmulador && env.NODE_ENV === 'production') {
      ctx.addIssue({
        code: 'custom',
        path: ['FIRESTORE_EMULATOR_HOST'],
        message: 'emuladores não podem ser usados em produção',
      });
    }
    if (!usaEmulador) {
      for (const chave of ['FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY'] as const) {
        if (!env[chave]) {
          ctx.addIssue({
            code: 'custom',
            path: [chave],
            message: 'obrigatória fora do emulador',
          });
        }
      }
    }
  });

export type Ambiente = z.infer<typeof esquemaAmbiente>;

/**
 * Valida as variáveis de ambiente. Lança erro listando tudo o que falta,
 * para a API falhar na inicialização e não no meio de uma requisição.
 */
export function carregarAmbiente(fonte: NodeJS.ProcessEnv = process.env): Ambiente {
  const resultado = esquemaAmbiente.safeParse(fonte);
  if (!resultado.success) {
    const problemas = resultado.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(raiz)'}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Configuração inválida. Confira o .env (modelo em .env.example):\n${problemas}`,
    );
  }
  return resultado.data;
}
