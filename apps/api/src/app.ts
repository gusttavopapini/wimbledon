import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

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

const LIMITES_PADRAO: Limites = { geral: 1500, cadastro: 10, janelaMs: 15 * 60 * 1000 };

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
  // Front do paciente (protótipo em apps/prototipo): aberto pelo app dentro de
  // uma WebView (celular) ou de um iframe (navegador). Ele não fala com o banco:
  // os dados passam pela ponte com o app, que chama esta mesma API.
  const pastaPrototipo = fileURLToPath(new URL('../../prototipo/', import.meta.url));
  if (existsSync(pastaPrototipo)) {
    app.use(
      '/app',
      helmet({
        // O protótipo compila os componentes no navegador (Babel) e usa estilos inline.
        contentSecurityPolicy: false,
        // Precisa abrir dentro do app (iframe no navegador).
        frameguard: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
      }),
      express.static(pastaPrototipo, { index: 'index.html', maxAge: '10m' }),
    );
  }

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
      limitePareamento: limitador(limites.cadastro, limites.janelaMs),
      ia: { apiKey: ambiente.ANTHROPIC_API_KEY, modelo: ambiente.ANTHROPIC_MODEL },
      integracaoApiKey: ambiente.INTEGRACAO_API_KEY,
      logger,
    }),
  );

  // Sempre por último: 404 e conversão de erros para o formato padrão.
  app.use(rotaNaoEncontrada);
  app.use(errorHandler);

  return app;
}
