import { Router, type RequestHandler } from 'express';

import type { criarEspecialidadesController } from '../controllers/especialidades.controller.js';
import type { criarMedicosController } from '../controllers/medicos.controller.js';
import type { criarUnidadesController } from '../controllers/unidades.controller.js';
import { exigirPerfil } from '../middlewares/exigirPerfil.js';
import { exigirUnidade } from '../middlewares/exigirUnidade.js';
import { validar } from '../middlewares/validar.js';
import {
  paramsEspecialidade,
  schemaAtualizarEspecialidade,
  schemaCriarEspecialidade,
} from '../schemas/especialidade.schema.js';
import {
  corpoAlocacao,
  filtrosMedicos,
  paramsAlocacao,
  paramsMedico,
  schemaAtualizarMedico,
  schemaCriarMedico,
} from '../schemas/medico.schema.js';
import {
  filtrosUnidades,
  paramsUnidade,
  schemaAtualizarUnidade,
  schemaCriarUnidade,
} from '../schemas/unidade.schema.js';

const soAdministrativo = exigirPerfil('administrativo');

/** GET público; escrita só do administrativo. DELETE sempre desativa. */
export function criarRotasEspecialidades(deps: {
  controller: ReturnType<typeof criarEspecialidadesController>;
  autenticar: RequestHandler;
}) {
  const { controller: c, autenticar } = deps;
  const rotas = Router();
  rotas.get('/', c.listar);
  rotas.get('/:id', validar(paramsEspecialidade, 'params'), c.buscar);
  rotas.post('/', autenticar, soAdministrativo, validar(schemaCriarEspecialidade), c.criar);
  rotas.put(
    '/:id',
    autenticar,
    soAdministrativo,
    validar(paramsEspecialidade, 'params'),
    validar(schemaAtualizarEspecialidade),
    c.atualizar,
  );
  rotas.delete(
    '/:id',
    autenticar,
    soAdministrativo,
    validar(paramsEspecialidade, 'params'),
    c.desativar,
  );
  return rotas;
}

export function criarRotasUnidades(deps: {
  controller: ReturnType<typeof criarUnidadesController>;
  autenticar: RequestHandler;
}) {
  const { controller: c, autenticar } = deps;
  const rotas = Router();
  rotas.get('/', validar(filtrosUnidades, 'query'), c.listar);
  rotas.get('/:id', validar(paramsUnidade, 'params'), c.buscar);
  rotas.post('/', autenticar, soAdministrativo, validar(schemaCriarUnidade), c.criar);
  rotas.put(
    '/:id',
    autenticar,
    soAdministrativo,
    validar(paramsUnidade, 'params'),
    validar(schemaAtualizarUnidade),
    c.atualizar,
  );
  rotas.delete('/:id', autenticar, soAdministrativo, validar(paramsUnidade, 'params'), c.desativar);
  return rotas;
}

/**
 * Cadastro de médico: só o administrativo. Alocação: administrativo ou a
 * manutenção da própria unidade (exigirUnidade lê unidadeId do corpo ou da URL).
 */
export function criarRotasMedicos(deps: {
  controller: ReturnType<typeof criarMedicosController>;
  autenticar: RequestHandler;
}) {
  const { controller: c, autenticar } = deps;
  const alocacao = exigirPerfil('administrativo', 'manutencao');
  const rotas = Router();
  rotas.get('/', validar(filtrosMedicos, 'query'), c.listar);
  rotas.get('/:id', validar(paramsMedico, 'params'), c.buscar);
  rotas.post('/', autenticar, soAdministrativo, validar(schemaCriarMedico), c.criar);
  rotas.put(
    '/:id',
    autenticar,
    soAdministrativo,
    validar(paramsMedico, 'params'),
    validar(schemaAtualizarMedico),
    c.atualizar,
  );
  rotas.delete('/:id', autenticar, soAdministrativo, validar(paramsMedico, 'params'), c.desativar);
  rotas.post(
    '/:id/unidades',
    autenticar,
    alocacao,
    validar(paramsMedico, 'params'),
    validar(corpoAlocacao),
    exigirUnidade(),
    c.alocar,
  );
  rotas.delete(
    '/:id/unidades/:unidadeId',
    autenticar,
    alocacao,
    validar(paramsAlocacao, 'params'),
    exigirUnidade(),
    c.desalocar,
  );
  return rotas;
}
