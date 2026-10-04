import cors from 'cors';
import express, { type Express } from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import type { Logger } from 'pino';

import type { Ambiente } from './config/env.js';
import { criarLogger } from './config/logger.js';
import { registrarRequisicoes } from './middlewares/requestId.js';
import { docsRoutes } from './routes/docs.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { rotasV1 } from './routes/index.js';

/** Monta o app sem abrir porta: o server.ts escuta e os testes usam o Supertest. */
export function criarApp(
  ambiente: Ambiente,
  logger: Logger = criarLogger(ambiente.LOG_LEVEL),
): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(registrarRequisicoes(logger));

  app.use(
    '/api/docs',
    // O Swagger UI precisa de scripts e estilos inline que o CSP padrão bloqueia.
    helmet({ contentSecurityPolicy: false }),
    docsRoutes,
  );
  app.use(helmet());
  app.use(cors({ origin: ambiente.CORS_ORIGINS, credentials: false }));
  app.use(express.json({ limit: '100kb' }));

  app.use('/health', healthRoutes);

  app.use(
    '/api/v1',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 300,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
    }),
    rotasV1,
  );

  return app;
}
