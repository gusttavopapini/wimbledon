import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError } from 'zod';

import { AppError, MENSAGENS, erros } from '../errors/AppError.js';

export interface DetalheCampo {
  campo: string;
  mensagem: string;
}

/** Um detalhe por campo, com a primeira mensagem (a mais útil) de cada um. */
export function detalhesDoZod(erro: ZodError): DetalheCampo[] {
  const porCampo = new Map<string, string>();
  for (const issue of erro.issues) {
    const campo = issue.path.join('.') || '(corpo)';
    const mensagem =
      issue.code === 'unrecognized_keys'
        ? `Campo não aceito aqui: ${issue.keys.join(', ')}.`
        : issue.message;
    if (!porCampo.has(campo)) porCampo.set(campo, mensagem);
  }
  return [...porCampo].map(([campo, mensagem]) => ({ campo, mensagem }));
}

function paraAppError(erro: unknown): AppError {
  if (erro instanceof AppError) return erro;
  if (erro instanceof ZodError) return erros.dadosInvalidos(detalhesDoZod(erro));

  // Erros do body-parser (JSON malformado, corpo grande demais).
  const tipo = (erro as { type?: string } | undefined)?.type;
  if (tipo === 'entity.parse.failed') {
    return erros.dadosInvalidos(undefined, 'Não conseguimos ler os dados enviados. Tente de novo.');
  }
  if (tipo === 'entity.too.large') {
    return erros.dadosInvalidos(undefined, 'Os dados enviados são grandes demais.');
  }
  return new AppError('ERRO_INTERNO', 500, MENSAGENS.ERRO_INTERNO);
}

/** Rota inexistente: 404 no formato padrão. */
export const rotaNaoEncontrada: RequestHandler = (_req, _res, next) => {
  next(erros.naoEncontrado());
};

/**
 * Último middleware do app. Converte qualquer erro para
 * {"erro": {"codigo", "mensagem", "detalhes", "requestId"}}. Erros inesperados
 * viram 500 sem vazar a mensagem interna; o detalhe vai só para o log.
 */
export const errorHandler: ErrorRequestHandler = (erro: unknown, req, res, next) => {
  if (res.headersSent) {
    next(erro);
    return;
  }

  const appError = paraAppError(erro);
  if (appError.status >= 500) {
    req.log?.error({ err: erro }, 'erro não tratado');
  }

  res.status(appError.status).json({
    erro: {
      codigo: appError.codigo,
      mensagem: appError.message,
      detalhes: appError.detalhes ?? null,
      requestId: String(req.id ?? ''),
    },
  });
};
