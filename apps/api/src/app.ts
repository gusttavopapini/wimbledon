import cors from 'cors';
import express, { type Express } from 'express';
import { rateLimit, type Options as OpcoesLimite } from 'express-rate-limit';
import helmet from 'helmet';
import type { Logger } from 'pino';

import type { Ambiente } from './config/env.js';
import { criarLogger } from './config/logger.js';
import { erros } from './errors/AppError.js';
import { inicializarFirebase, type ServicosFirebase } from './integrations/firebaseAdmin.js';
import { errorHandler, rotaNaoEncontrada } from './middlewares/errorHandler.js';
import { registrarRequisicoes } from './middlewares/requestId.js';
import { docsRoutes } from './routes/docs.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { criarRotasV1 } from './routes/index.js';

export interface Limites {
  /** Requisições por janela em toda a /api/v1, por IP. */
  geral: number;
  /** Cadastros por janela, por IP: freia criação de contas em massa. */
  cadastro: number;
  janelaMs: number;
}

export interface OpcoesApp {
  logger?: Logger;
  firebase?: ServicosFirebase;
  limites?: Partial<Limites>;
}

const LIMITES_PADRAO: Limites = { geral: 300, cadastro: 10, janelaMs: 15 * 60 * 1000 };

function limitador(limite: number, janelaMs: number) {
  const opcoes: Partial<OpcoesLimite> = {
    windowMs: janelaMs,
    limit: limite,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_req, _res, next) => next(erros.limiteExcedido()),
  };
  return rateLimit(opcoes);
}

/** Monta o app sem abrir porta: o server.ts escuta e os testes usam o Supertest. */
export function criarApp(ambiente: Ambiente, opcoes: OpcoesApp = {}): Express {
  const logger = opcoes.logger ?? criarLogger(ambiente.LOG_LEVEL);
  const firebase = opcoes.firebase ?? inicializarFirebase(ambiente);
  const limites = { ...LIMITES_PADRAO, ...opcoes.limites };

  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.set('fuso', ambiente.TZ_PADRAO);
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
    limitador(limites.geral, limites.janelaMs),
    criarRotasV1({
      auth: firebase.auth,
      db: firebase.db,
      fuso: ambiente.TZ_PADRAO,
      limiteCadastro: limitador(limites.cadastro, limites.janelaMs),
    }),
  );

  // Sempre por último: 404 e conversão de erros para o formato padrão.
  app.use(rotaNaoEncontrada);
  app.use(errorHandler);

  return app;
}
