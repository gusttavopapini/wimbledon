import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

import type { Logger } from 'pino';
import { pinoHttp } from 'pino-http';

const FORMATO_ACEITO = /^[\w-]{8,64}$/;

/**
 * Log de cada requisição em JSON com um requestId. Aceita o X-Request-Id de um
 * proxy, se for seguro, e devolve o id no cabeçalho para o cliente citar no suporte.
 */
export function registrarRequisicoes(logger: Logger) {
  return pinoHttp({
    logger,
    genReqId: (req: IncomingMessage, res: ServerResponse) => {
      const recebido = req.headers['x-request-id'];
      const id =
        typeof recebido === 'string' && FORMATO_ACEITO.test(recebido) ? recebido : randomUUID();
      res.setHeader('X-Request-Id', id);
      return id;
    },
    customLogLevel: (_req, res, erro) => {
      if (erro || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    autoLogging: { ignore: (req) => req.url === '/health' },
  });
}
