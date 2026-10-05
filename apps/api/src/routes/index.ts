import { Router, type RequestHandler } from 'express';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

import { criarAuthController } from '../controllers/auth.controller.js';
import { criarUsuariosController } from '../controllers/usuarios.controller.js';
import { autenticar } from '../middlewares/autenticar.js';
import { criarUsuariosRepository } from '../repositories/usuarios.repository.js';
import { criarAuthService } from '../services/auth.service.js';
import { criarUsuariosService } from '../services/usuarios.service.js';
import { criarRotasAuth } from './auth.routes.js';
import { criarRotasUsuarios } from './usuarios.routes.js';

/** Monta as rotas de /api/v1 ligando repositories -> services -> controllers. */
export function criarRotasV1(deps: {
  auth: Auth;
  db: Firestore;
  fuso: string;
  limiteCadastro: RequestHandler;
}): Router {
  const { auth, db, fuso } = deps;

  const usuarios = criarUsuariosRepository(db);
  const authService = criarAuthService({ auth, usuarios });
  const usuariosService = criarUsuariosService({ usuarios });
  const exigirLogin = autenticar(auth);

  const rotas = Router();
  rotas.use(
    '/auth',
    criarRotasAuth({
      controller: criarAuthController({ authService, fuso }),
      autenticar: exigirLogin,
      limiteCadastro: deps.limiteCadastro,
      fuso,
    }),
  );
  rotas.use(
    '/usuarios',
    criarRotasUsuarios({
      controller: criarUsuariosController({ usuariosService, fuso }),
      autenticar: exigirLogin,
      fuso,
    }),
  );
  return rotas;
}
