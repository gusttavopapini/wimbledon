import { Router, type RequestHandler } from 'express';
import type { Auth } from 'firebase-admin/auth';
import type { Firestore } from 'firebase-admin/firestore';

import type { Logger } from 'pino';

import { criarAtendimentoController } from '../controllers/atendimento.controller.js';
import { criarAuthController } from '../controllers/auth.controller.js';
import { criarIntegracoesController } from '../controllers/integracoes.controller.js';
import { criarEspecialidadesController } from '../controllers/especialidades.controller.js';
import { criarMedicosController } from '../controllers/medicos.controller.js';
import { criarUnidadesController } from '../controllers/unidades.controller.js';
import { criarUsuariosController } from '../controllers/usuarios.controller.js';
import { criarClaudeClient } from '../integrations/ia/claudeClient.js';
import { criarProvedorPalavrasChave } from '../integrations/ia/palavrasChave.js';
import { autenticar } from '../middlewares/autenticar.js';
import { autenticarDispositivo } from '../middlewares/autenticarDispositivo.js';
import { autenticarIntegracao } from '../middlewares/autenticarIntegracao.js';
import { criarAgendaRepository } from '../repositories/agenda.repository.js';
import { criarAuditoriaRepository } from '../repositories/auditoria.repository.js';
import { criarChamadosRepository } from '../repositories/chamados.repository.js';
import { criarPainelRepository } from '../repositories/painel.repository.js';
import { criarPlantoesRepository } from '../repositories/plantoes.repository.js';
import { criarPreTriagensRepository } from '../repositories/pretriagens.repository.js';
import { criarEspecialidadesRepository } from '../repositories/especialidades.repository.js';
import { criarMedicosRepository } from '../repositories/medicos.repository.js';
import { criarUnidadesRepository } from '../repositories/unidades.repository.js';
import { criarUsuariosRepository } from '../repositories/usuarios.repository.js';
import { criarAgendaService } from '../services/agenda.service.js';
import { criarAuthService } from '../services/auth.service.js';
import { criarChamadosService } from '../services/chamados.service.js';
import { criarEquipeService } from '../services/equipe.service.js';
import { criarPainelService } from '../services/painel.service.js';
import { criarPlantoesService } from '../services/plantoes.service.js';
import { criarTriagemService } from '../services/triagem.service.js';
import { criarEspecialidadesService } from '../services/especialidades.service.js';
import { criarMedicosService } from '../services/medicos.service.js';
import { criarUnidadesService } from '../services/unidades.service.js';
import { criarUsuariosService } from '../services/usuarios.service.js';
import {
  rotasAgendaMedicos,
  rotasAtendimento,
  rotasIntegracoes,
  rotasPainel,
} from './atendimento.routes.js';
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
  limitePareamento: RequestHandler;
  ia: { apiKey?: string; modelo: string };
  integracaoApiKey?: string;
  logger?: Logger;
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

  // --- Atendimento: agenda, chamados, plantão, painel, pré-triagem, equipe ---
  const agendaRepo = criarAgendaRepository(db);
  const chamadosRepo = criarChamadosRepository(db);
  const plantoesRepo = criarPlantoesRepository(db);
  const preTriagens = criarPreTriagensRepository(db);
  const auditoria = criarAuditoriaRepository(db);
  const agenda = criarAgendaService({ agenda: agendaRepo, medicos, unidades, fuso });
  const chamados = criarChamadosService({
    chamados: chamadosRepo,
    medicos,
    unidades,
    especialidades,
    usuarios,
    plantoes: plantoesRepo,
    preTriagens,
    auditoria,
    agenda,
    fuso,
  });
  const plantoes = criarPlantoesService({ plantoes: plantoesRepo, agenda: agendaRepo, chamados });
  const painel = criarPainelService({
    painel: criarPainelRepository(db),
    chamados: chamadosRepo,
    unidades,
    fuso,
  });
  const palavras = criarProvedorPalavrasChave(
    async () => new Map((await especialidades.listarAtivas()).map((e) => [e.id, e.palavrasChave])),
  );
  const triagem = criarTriagemService({
    provedor: deps.ia.apiKey
      ? criarClaudeClient({ apiKey: deps.ia.apiKey, modelo: deps.ia.modelo })
      : palavras,
    reserva: palavras,
    especialidades,
    unidades,
    preTriagens,
    logger: deps.logger,
  });
  const equipe = criarEquipeService({ auth, authService, usuarios, medicos, auditoria });
  const atendimento = criarAtendimentoController({
    agenda,
    chamados,
    plantoes,
    painel,
    triagem,
    equipe,
    usuarios,
    fuso,
  });
  const integracoes = criarIntegracoesController({
    usuarios,
    unidades,
    medicos,
    agenda,
    chamados,
    triagem,
    fuso,
  });

  const rotas = Router();
  rotas.use('/medicos', rotasAgendaMedicos(atendimento, exigirLogin));
  rotas.use(rotasAtendimento(atendimento, exigirLogin));
  rotas.use(
    '/painel',
    rotasPainel(atendimento, autenticarDispositivo(painel), deps.limitePareamento),
  );
  rotas.use(
    '/integracoes',
    rotasIntegracoes(integracoes, autenticarIntegracao(deps.integracaoApiKey)),
  );
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
