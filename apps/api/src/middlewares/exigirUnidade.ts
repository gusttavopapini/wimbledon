import type { Request, RequestHandler } from 'express';

import { erros } from '../errors/AppError.js';

export type LocalizarUnidade = (req: Request) => unknown;

/** Procura a unidade na rota, depois no corpo, depois na query string. */
export const unidadeDaRequisicao: LocalizarUnidade = (req) =>
  req.params.unidadeId ??
  (req.body as { unidadeId?: unknown } | undefined)?.unidadeId ??
  req.query.unidadeId;

/**
 * Garante que a pessoa só age na própria unidade:
 * - administrativo: todas as unidades;
 * - recepcionista e manutenção: a unidadeId da claim;
 * - médico: uma das unidadeIds da claim;
 * - paciente ou sem perfil: nenhuma (rotas de unidade são de equipe).
 * Usar depois de autenticar.
 */
export function exigirUnidade(localizar: LocalizarUnidade = unidadeDaRequisicao): RequestHandler {
  return (req, _res, next) => {
    const usuario = req.usuario;
    if (!usuario) {
      next(erros.naoAutenticado());
      return;
    }

    const unidadeId = localizar(req);
    if (typeof unidadeId !== 'string' || unidadeId.length === 0) {
      next(
        erros.dadosInvalidos([
          { campo: 'unidadeId', mensagem: 'Escolha a unidade de atendimento.' },
        ]),
      );
      return;
    }

    const permitido =
      usuario.perfil === 'administrativo' ||
      ((usuario.perfil === 'recepcionista' || usuario.perfil === 'manutencao') &&
        usuario.unidadeId === unidadeId) ||
      (usuario.perfil === 'medico' && usuario.unidadeIds.includes(unidadeId));

    next(permitido ? undefined : erros.foraDaUnidade());
  };
}
