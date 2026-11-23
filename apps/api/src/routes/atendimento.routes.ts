import { Router, type RequestHandler } from 'express';

import type { AtendimentoController } from '../controllers/atendimento.controller.js';
import type { criarIntegracoesController } from '../controllers/integracoes.controller.js';
import { exigirPerfil } from '../middlewares/exigirPerfil.js';
import { exigirUnidade } from '../middlewares/exigirUnidade.js';
import { validar } from '../middlewares/validar.js';
import * as s from '../schemas/atendimento.schema.js';
import { filtrosMedicos } from '../schemas/medico.schema.js';

const EQUIPE = ['recepcionista', 'medico', 'manutencao', 'administrativo'] as const;
const BALCAO = ['recepcionista', 'manutencao', 'administrativo'] as const;
const GESTAO = ['manutencao', 'administrativo'] as const;

const naUnidade = exigirUnidade((req) => req.params.unidadeId);

/** /medicos/* da agenda (montado ANTES do router de cadastro de médicos). */
export function rotasAgendaMedicos(c: AtendimentoController, autenticar: RequestHandler) {
  const r = Router();
  r.get('/me', autenticar, exigirPerfil('medico'), c.medicoMe);
  r.get(
    '/me/agenda',
    autenticar,
    exigirPerfil('medico'),
    validar(s.filtrosAgendaDia, 'query'),
    c.agendaDoMedico,
  );
  // Público: o paciente vê os horários livres antes de entrar.
  r.get(
    '/:id/horarios',
    validar(s.paramsId, 'params'),
    validar(s.filtrosHorarios, 'query'),
    c.horarios,
  );
  r.get(
    '/:id/disponibilidades',
    autenticar,
    exigirPerfil(...EQUIPE),
    validar(s.paramsId, 'params'),
    c.listarDisponibilidades,
  );
  r.post(
    '/:id/disponibilidades',
    autenticar,
    exigirPerfil(...GESTAO),
    validar(s.paramsId, 'params'),
    validar(s.schemaDisponibilidade),
    c.criarDisponibilidade,
  );
  r.get(
    '/:id/bloqueios',
    autenticar,
    exigirPerfil(...EQUIPE),
    validar(s.paramsId, 'params'),
    c.listarBloqueios,
  );
  r.post(
    '/:id/bloqueios',
    autenticar,
    exigirPerfil(...GESTAO),
    validar(s.paramsId, 'params'),
    validar(s.schemaBloqueio),
    c.criarBloqueio,
  );
  return r;
}

export function rotasAtendimento(c: AtendimentoController, autenticar: RequestHandler) {
  const r = Router();
  const gestao = [autenticar, exigirPerfil(...GESTAO)];

  // Agenda: disponibilidades, bloqueios e consultórios.
  r.delete(
    '/disponibilidades/:id',
    ...gestao,
    validar(s.paramsId, 'params'),
    c.desativarDisponibilidade,
  );
  r.delete('/bloqueios/:id', ...gestao, validar(s.paramsId, 'params'), c.desativarBloqueio);
  r.get(
    '/unidades/:unidadeId/consultorios',
    autenticar,
    exigirPerfil(...EQUIPE),
    validar(s.paramsUnidade, 'params'),
    naUnidade,
    c.listarConsultorios,
  );
  r.post(
    '/unidades/:unidadeId/consultorios',
    ...gestao,
    validar(s.paramsUnidade, 'params'),
    naUnidade,
    validar(s.schemaConsultorio),
    c.criarConsultorio,
  );
  r.put(
    '/consultorios/:id',
    ...gestao,
    validar(s.paramsId, 'params'),
    validar(s.schemaAtualizarConsultorio),
    c.atualizarConsultorio,
  );

  // Recepção e gestão da unidade.
  r.get(
    '/unidades/:unidadeId/chamados',
    autenticar,
    exigirPerfil(...EQUIPE),
    validar(s.paramsUnidade, 'params'),
    naUnidade,
    validar(s.filtrosAgendaDia, 'query'),
    c.agendaDaUnidade,
  );
  r.get(
    '/unidades/:unidadeId/indicadores',
    ...gestao,
    validar(s.paramsUnidade, 'params'),
    naUnidade,
    validar(s.filtrosAgendaDia, 'query'),
    c.indicadores,
  );
  r.get(
    '/unidades/:unidadeId/equipe',
    ...gestao,
    validar(s.paramsUnidade, 'params'),
    naUnidade,
    c.listarEquipe,
  );
  r.get(
    '/unidades/:unidadeId/paineis',
    ...gestao,
    validar(s.paramsUnidade, 'params'),
    naUnidade,
    c.listarPaineis,
  );
  r.post(
    '/unidades/:unidadeId/paineis',
    ...gestao,
    validar(s.paramsUnidade, 'params'),
    naUnidade,
    validar(s.schemaAprovarPareamento),
    c.aprovarPareamento,
  );
  r.delete('/paineis/:id', ...gestao, validar(s.paramsId, 'params'), c.desativarPainel);

  // Chamados (agendamento e fila).
  r.post(
    '/chamados',
    autenticar,
    exigirPerfil('paciente', ...BALCAO),
    validar(s.schemaAgendar),
    c.agendar,
  );
  r.get('/chamados/me', autenticar, c.meus);
  r.post(
    '/chamados/espontaneos',
    autenticar,
    exigirPerfil(...BALCAO),
    validar(s.schemaEspontaneo),
    c.espontaneo,
  );
  r.get('/chamados/:id', autenticar, validar(s.paramsId, 'params'), c.buscar);
  r.get(
    '/chamados/:id/documentos',
    autenticar,
    validar(s.paramsId, 'params'),
    c.documentosDoChamado,
  );
  r.post('/chamados/:id/cancelar', autenticar, validar(s.paramsId, 'params'), c.cancelar);
  r.post(
    '/chamados/:id/reagendar',
    autenticar,
    validar(s.paramsId, 'params'),
    validar(s.schemaReagendar),
    c.reagendar,
  );
  r.post(
    '/chamados/:id/chegada',
    autenticar,
    exigirPerfil(...BALCAO),
    validar(s.paramsId, 'params'),
    c.confirmarChegada,
  );
  r.post(
    '/chamados/:id/falta',
    autenticar,
    exigirPerfil(...BALCAO),
    validar(s.paramsId, 'params'),
    c.marcarFalta,
  );
  const medico = [autenticar, exigirPerfil('medico')];
  r.post('/chamados/:id/aceitar', ...medico, validar(s.paramsId, 'params'), c.aceitar);
  r.post(
    '/chamados/:id/chamar-novamente',
    ...medico,
    validar(s.paramsId, 'params'),
    c.chamarNovamente,
  );
  r.post(
    '/chamados/:id/atendimento',
    ...medico,
    validar(s.paramsId, 'params'),
    validar(s.schemaAcaoAtendimento),
    c.mudarAtendimento,
  );
  r.post(
    '/chamados/:id/concluir',
    ...medico,
    validar(s.paramsId, 'params'),
    validar(s.schemaConcluir),
    c.concluir,
  );

  // Plantão (RN20).
  r.post('/plantoes', ...medico, validar(s.schemaAbrirPlantao), c.abrirPlantao);
  r.get('/plantoes/atual', ...medico, c.plantaoAtual);
  r.delete('/plantoes/atual', ...medico, c.encerrarPlantao);
  r.get('/plantoes/atual/fila', ...medico, c.fila);

  // Documentos do paciente.
  r.get('/documentos/me', autenticar, c.meusDocumentos);
  r.get('/documentos/:id', autenticar, validar(s.paramsId, 'params'), c.documento);

  // Pré-triagem com IA.
  r.post('/pretriagens', autenticar, exigirPerfil('paciente'), validar(s.schemaTriagem), c.triar);

  // Equipe e pacientes.
  r.post('/equipe/contas', ...gestao, validar(s.schemaContaEquipe), c.criarConta);
  r.get(
    '/equipe/contas',
    autenticar,
    exigirPerfil('administrativo'),
    validar(s.filtrosContas, 'query'),
    c.listarContas,
  );
  // RN23: a recepcionista não redefine senha.
  r.post(
    '/usuarios/:id/redefinir-senha',
    ...gestao,
    validar(s.paramsId, 'params'),
    c.redefinirSenha,
  );
  r.put(
    '/usuarios/:id/status',
    ...gestao,
    validar(s.paramsId, 'params'),
    validar(s.schemaStatusConta),
    c.alterarStatus,
  );
  r.post('/usuarios/me/push-token', autenticar, validar(s.schemaPushToken), c.registrarPushToken);
  r.get(
    '/pacientes',
    autenticar,
    exigirPerfil(...BALCAO),
    validar(s.filtrosPaciente, 'query'),
    c.buscarPaciente,
  );
  r.post(
    '/pacientes',
    autenticar,
    exigirPerfil(...BALCAO),
    validar(s.schemaPreCadastro),
    c.preCadastrar,
  );

  return r;
}

/** /painel/*: pareamento é público (com limite); o resto exige X-Device-Token. */
export function rotasPainel(
  c: AtendimentoController,
  autenticarDispositivo: RequestHandler,
  limitePareamento: RequestHandler,
) {
  const r = Router();
  r.post('/pareamentos', limitePareamento, c.iniciarPareamento);
  r.post('/pareamentos/consulta', validar(s.schemaConsultaPareamento), c.consultarPareamento);
  r.get('/estado', autenticarDispositivo, c.estadoPainel);
  r.get('/eventos', autenticarDispositivo, c.eventosPainel);
  return r;
}

export function rotasIntegracoes(
  c: ReturnType<typeof criarIntegracoesController>,
  autenticarIntegracao: RequestHandler,
) {
  const r = Router();
  r.use(autenticarIntegracao);
  r.post('/triagem', validar(s.schemaTriagemIntegracao), c.triar);
  r.get('/especialidades/:id/unidades', validar(s.paramsId, 'params'), c.unidadesDaEspecialidade);
  r.get('/medicos', validar(filtrosMedicos, 'query'), c.medicos);
  r.get('/horarios', validar(s.filtrosHorariosIntegracao, 'query'), c.horarios);
  r.get('/pacientes/:telefone/consultas', validar(s.paramsTelefone, 'params'), c.consultas);
  r.post('/agendamentos', validar(s.schemaAgendarIntegracao), c.agendar);
  r.post(
    '/agendamentos/:id/cancelar',
    validar(s.paramsId, 'params'),
    validar(s.schemaCancelarIntegracao),
    c.cancelar,
  );
  return r;
}
