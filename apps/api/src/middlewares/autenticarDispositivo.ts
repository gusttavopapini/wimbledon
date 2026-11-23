import type { RequestHandler } from 'express';

import { erros } from '../errors/AppError.js';
import type { PainelService } from '../services/painel.service.js';

/** Painel de TV (RN25): X-Device-Token, só leitura e só da própria unidade. Nunca login de pessoa. */
export function autenticarDispositivo(
  painel: Pick<PainelService, 'autenticarToken'>,
): RequestHandler {
  return async (req, _res, next) => {
    // EventSource do navegador não envia cabeçalho: aceita também ?token= só no SSE.
    const token =
      req.get('x-device-token') ?? (req.path === '/eventos' ? String(req.query.token ?? '') : '');
    if (!token) {
      next(erros.naoAutenticado());
      return;
    }
    try {
      const dispositivo = await painel.autenticarToken(token);
      if (!dispositivo) {
        next(erros.naoAutenticado());
        return;
      }
      req.dispositivo = dispositivo;
      next();
    } catch (erro) {
      next(erro);
    }
  };
}
