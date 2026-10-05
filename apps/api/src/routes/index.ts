import { Router, type RequestHandler } from 'express';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

import { criarAuthController } from '../controllers/auth.controller.js';
import { criarEspecialidadesController } from '../controllers/especialidades.controller.js';
import { criarMedicosController } from '../controllers/medicos.controller.js';
import { criarUnidadesController } from '../controllers/unidades.controller.js';
import { criarUsuariosController } from '../controllers/usuarios.controller.js';
import { autenticar } from '../middlewares/autenticar.js';
import { criarEspecialidadesRepository } from '../repositories/especialidades.repository.js';
import { criarMedicosRepository } from '../repositories/medicos.repository.js';
import { criarUnidadesRepository } from '../repositories/unidades.repository.js';
import { criarUsuariosRepository } from '../repositories/usuarios.repository.js';
import { criarAuthService } from '../services/auth.service.js';
import { criarEspecialidadesService } from '../services/especialidades.service.js';
import { criarMedicosService } from '../services/medicos.service.js';
import { criarUnidadesService } from '../services/unidades.service.js';
import { criarUsuariosService } from '../services/usuarios.service.js';
import { criarRotasAuth } from './auth.routes.js';
import {
  criarRotasEspecialidades,
  criarRotasMedicos,
  criarRotasUnidades,
} from './cadastros.routes.js';
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
  const especialidades = criarEspecialidadesRepository(db);
  const unidades = criarUnidadesRepository(db);
  const medicos = criarMedicosRepository(db);
  const especialidadesService = criarEspecialidadesService({ especialidades });
  const unidadesService = criarUnidadesService({ unidades, especialidades });
  const medicosService = criarMedicosService({
    medicos,
    unidades,
    especialidades,
    usuarios,
    auth,
  });
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
  rotas.use(
    '/especialidades',
    criarRotasEspecialidades({
      controller: criarEspecialidadesController({ especialidadesService, fuso }),
      autenticar: exigirLogin,
    }),
  );
  rotas.use(
    '/unidades',
    criarRotasUnidades({
      controller: criarUnidadesController({ unidadesService, fuso }),
      autenticar: exigirLogin,
    }),
  );
  rotas.use(
    '/medicos',
    criarRotasMedicos({
      controller: criarMedicosController({ medicosService, fuso }),
      autenticar: exigirLogin,
    }),
  );
  return rotas;
}
