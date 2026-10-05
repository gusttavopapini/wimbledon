import type { RequestHandler } from 'express';

import { erros } from '../errors/AppError.js';
import type { Perfil } from '../schemas/campos.js';

/** Deixa passar só os perfis listados. Usar depois de autenticar. */
export function exigirPerfil(...perfis: Perfil[]): RequestHandler {
  return (req, _res, next) => {
    if (!req.usuario) {
      next(erros.naoAutenticado());
      return;
    }
    if (!req.usuario.perfil || !perfis.includes(req.usuario.perfil)) {
      next(erros.acessoNegado());
      return;
    }
    next();
  };
}
