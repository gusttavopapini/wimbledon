import type { RequestHandler } from 'express';
import type { ZodType } from 'zod';

type Origem = 'body' | 'params' | 'query';

/**
 * Valida e normaliza a entrada com Zod. Em caso de erro, encaminha o ZodError
 * para o errorHandler, que responde 400 DADOS_INVALIDOS com os detalhes.
 */
export function validar(schema: ZodType, origem: Origem = 'body'): RequestHandler {
  return (req, _res, next) => {
    const resultado = schema.safeParse(req[origem] ?? {});
    if (!resultado.success) {
      next(resultado.error);
      return;
    }
    if (origem === 'body') {
      req.body = resultado.data;
    } else {
      // No Express 5, req.query e req.params são getters: redefine com o valor validado.
      Object.defineProperty(req, origem, {
        value: resultado.data,
        writable: true,
        configurable: true,
        enumerable: true,
      });
    }
    next();
  };
}
