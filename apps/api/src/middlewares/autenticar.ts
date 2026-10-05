import type { Auth } from 'firebase-admin/auth';
import type { RequestHandler } from 'express';

import { erros } from '../errors/AppError.js';
import { PERFIS, type Perfil } from '../schemas/campos.js';

function ehPerfil(valor: unknown): valor is Perfil {
  return typeof valor === 'string' && (PERFIS as readonly string[]).includes(valor);
}

/**
 * Valida o ID token do Firebase Auth (Authorization: Bearer <token>) e expõe em
 * req.usuario o uid, o perfil e as unidades, lidos das custom claims.
 * checkRevoked recusa token de conta desativada ou com sessão revogada.
 */
export function autenticar(auth: Pick<Auth, 'verifyIdToken'>): RequestHandler {
  return async (req, _res, next) => {
    const cabecalho = req.headers.authorization ?? '';
    const [esquema, token] = cabecalho.split(' ');
    if (esquema?.toLowerCase() !== 'bearer' || !token) {
      next(erros.naoAutenticado());
      return;
    }

    try {
      const decodificado = await auth.verifyIdToken(token, true);
      req.usuario = {
        uid: decodificado.uid,
        email: decodificado.email,
        perfil: ehPerfil(decodificado.perfil) ? decodificado.perfil : undefined,
        unidadeId: typeof decodificado.unidadeId === 'string' ? decodificado.unidadeId : undefined,
        unidadeIds: Array.isArray(decodificado.unidadeIds)
          ? decodificado.unidadeIds.filter((id): id is string => typeof id === 'string')
          : [],
      };
      next();
    } catch (erro) {
      req.log?.warn({ codigo: (erro as { code?: string }).code }, 'token recusado');
      next(erros.naoAutenticado());
    }
  };
}
