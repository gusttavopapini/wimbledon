import { Router, type RequestHandler } from 'express';

import type { criarUsuariosController } from '../controllers/usuarios.controller.js';
import { validar } from '../middlewares/validar.js';
import { criarSchemaAtualizarMe } from '../schemas/usuario.schema.js';

export function criarRotasUsuarios(deps: {
  controller: ReturnType<typeof criarUsuariosController>;
  autenticar: RequestHandler;
  fuso: string;
}) {
  const rotas = Router();

  rotas.put(
    '/me',
    deps.autenticar,
    validar(criarSchemaAtualizarMe(deps.fuso)),
    deps.controller.atualizarMe,
  );

  return rotas;
}
