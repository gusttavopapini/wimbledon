import { createHash, timingSafeEqual } from 'node:crypto';

import type { RequestHandler } from 'express';

import { erros } from '../errors/AppError.js';

const resumo = (texto: string) => createHash('sha256').update(texto).digest();

/**
 * N8N e outras integrações: X-Api-Key com escopo restrito a /integracoes/*.
 * Sem INTEGRACAO_API_KEY configurada, as rotas ficam fechadas.
 */
export function autenticarIntegracao(chave: string | undefined): RequestHandler {
  const esperada = chave ? resumo(chave) : null;
  return (req, _res, next) => {
    const recebida = req.get('x-api-key');
    if (!esperada || !recebida || !timingSafeEqual(resumo(recebida), esperada)) {
      next(erros.naoAutenticado());
      return;
    }
    next();
  };
}
