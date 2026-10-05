import { Router, type RequestHandler } from 'express';

import type { criarAuthController } from '../controllers/auth.controller.js';
import { validar } from '../middlewares/validar.js';
import { criarSchemaCadastro } from '../schemas/auth.schema.js';

export function criarRotasAuth(deps: {
  controller: ReturnType<typeof criarAuthController>;
  autenticar: RequestHandler;
  limiteCadastro: RequestHandler;
  fuso: string;
}) {
  const rotas = Router();

  rotas.post(
    '/cadastro',
    deps.limiteCadastro,
    validar(criarSchemaCadastro(deps.fuso)),
    deps.controller.cadastrar,
  );
  rotas.get('/me', deps.autenticar, deps.controller.me);

  return rotas;
}
