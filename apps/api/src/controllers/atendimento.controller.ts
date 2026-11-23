import type { Request, Response } from 'express';

import { erros } from '../errors/AppError.js';
import type { UsuariosRepository } from '../repositories/usuarios.repository.js';
import type { AgendaService } from '../services/agenda.service.js';
import type { ChamadosService, DadosAgendar } from '../services/chamados.service.js';
import type { EquipeService, DadosContaEquipe } from '../services/equipe.service.js';
import type { PainelService } from '../services/painel.service.js';
import type { PlantoesService } from '../services/plantoes.service.js';
import { idadeDe, type TriagemService } from '../services/triagem.service.js';
import type { PainelDispositivo, Urgencia } from '../types/atendimento.js';
import { hojeNoFuso } from '../utils/datas.js';
import {
  apresentarChamado,
  apresentarDocumento,
  apresentarPreTriagem,
  apresentarSessao,
  atorDe,
  h,
} from './apresentadores-atendimento.js';
import { apresentarMedico, apresentarUnidade, apresentarUsuario } from './apresentadores.js';

export interface DepsAtendimento {
  agenda: AgendaService;
  chamados: ChamadosService;
  plantoes: PlantoesService;
  painel: PainelService;
  triagem: TriagemService;
  equipe: EquipeService;
  usuarios: UsuariosRepository;
  fuso: string;
}

const id = (req: Request, nome = 'id') => String(req.params[nome]);

export function criarAtendimentoController(deps: DepsAtendimento) {
  const { agenda, chamados, plantoes, painel, triagem, equipe, usuarios, fuso } = deps;

  async function responderChamados(
    res: Response,
    lista: Parameters<ChamadosService['enriquecer']>[0],
  ) {
    const itens = await chamados.enriquecer(lista);
    res.json({ itens: itens.map((i) => apresentarChamado(i, fuso)) });
  }
  async function responderChamado(
    res: Response,
    c: Parameters<ChamadosService['enriquecer']>[0][number],
    status = 200,
  ) {
    const [item] = await chamados.enriquecer([c]);
    res.status(status).json(apresentarChamado(item!, fuso));
  }

  return {
    // --- Agenda --------------------------------------------------------------
    horarios: h(async (req, res) => {
      const q = req.query as unknown as { unidadeId: string; de?: string; dias: number };
      res.json({ itens: await agenda.horariosLivres(id(req), q.unidadeId, q.de, q.dias) });
    }),
    listarDisponibilidades: h(async (req, res) => {
      const unidadeId = typeof req.query.unidadeId === 'string' ? req.query.unidadeId : undefined;
      res.json({ itens: await agenda.listarDisponibilidades(id(req), unidadeId) });
    }),
    criarDisponibilidade: h(async (req, res) => {
      res.status(201).json(await agenda.criarDisponibilidade(atorDe(req), id(req), req.body));
    }),
    desativarDisponibilidade: h(async (req, res) => {
      await agenda.desativarDisponibilidade(atorDe(req), id(req));
      res.status(204).end();
    }),
    listarBloqueios: h(async (req, res) => {
      res.json({ itens: await agenda.listarBloqueios(id(req)) });
    }),
    criarBloqueio: h(async (req, res) => {
      res.status(201).json(await agenda.criarBloqueio(atorDe(req), id(req), req.body));
    }),
    desativarBloqueio: h(async (req, res) => {
      await agenda.desativarBloqueio(atorDe(req), id(req));
      res.status(204).end();
    }),
    listarConsultorios: h(async (req, res) => {
      res.json({ itens: await agenda.listarConsultorios(id(req, 'unidadeId')) });
    }),
    criarConsultorio: h(async (req, res) => {
      const { nome } = req.body as { nome: string };
      res.status(201).json(await agenda.criarConsultorio(atorDe(req), id(req, 'unidadeId'), nome));
    }),
    atualizarConsultorio: h(async (req, res) => {
      res.json(await agenda.atualizarConsultorio(atorDe(req), id(req), req.body));
    }),

    // --- Médico logado -------------------------------------------------------
    medicoMe: h(async (req, res) => {
      const ator = atorDe(req);
      const medico = await chamados.medicoDoAtor(ator);
      const sessao = await plantoes.atual(ator);
      res.json({
        medico: apresentarMedico(medico, fuso),
        plantao: sessao ? apresentarSessao(sessao, fuso) : null,
      });
    }),
    agendaDoMedico: h(async (req, res) => {
      const data = typeof req.query.data === 'string' ? req.query.data : undefined;
      await responderChamados(res, await chamados.agendaDoMedico(atorDe(req), data));
    }),

    // --- Chamados ------------------------------------------------------------
    agendar: h(async (req, res) => {
      const ator = atorDe(req);
      const origem = ator.perfil === 'paciente' ? 'app' : 'recepcao';
      const c = await chamados.agendar(ator, req.body as DadosAgendar, origem);
      res.location(`/api/v1/chamados/${c.id}`);
      await responderChamado(res, c, 201);
    }),
    meus: h(async (req, res) => {
      await responderChamados(res, await chamados.listarDoPaciente(atorDe(req).uid));
    }),
    buscar: h(async (req, res) => {
      await responderChamado(res, await chamados.buscarVisivel(atorDe(req), id(req)));
    }),
    cancelar: h(async (req, res) => {
      await responderChamado(res, await chamados.cancelar(atorDe(req), id(req)));
    }),
    reagendar: h(async (req, res) => {
      await responderChamado(res, await chamados.reagendar(atorDe(req), id(req), req.body));
    }),
    agendaDaUnidade: h(async (req, res) => {
      const data = typeof req.query.data === 'string' ? req.query.data : undefined;
      await responderChamados(
        res,
        await chamados.agendaDaUnidade(atorDe(req), id(req, 'unidadeId'), data),
      );
    }),
    confirmarChegada: h(async (req, res) => {
      await responderChamado(res, await chamados.confirmarChegada(atorDe(req), id(req)));
    }),
    marcarFalta: h(async (req, res) => {
      await responderChamado(res, await chamados.marcarFalta(atorDe(req), id(req)));
    }),
    espontaneo: h(async (req, res) => {
      const dados = req.body as {
        unidadeId: string;
        pacienteId: string;
        especialidadeId: string;
        urgencia: Urgencia;
      };
      await responderChamado(res, await chamados.registrarEspontaneo(atorDe(req), dados), 201);
    }),
    aceitar: h(async (req, res) => {
      await responderChamado(res, await chamados.aceitar(atorDe(req), id(req)));
    }),
    chamarNovamente: h(async (req, res) => {
      await chamados.chamarNovamente(atorDe(req), id(req));
      res.status(204).end();
    }),
    mudarAtendimento: h(async (req, res) => {
      const { acao } = req.body as { acao: 'iniciar' | 'nao_compareceu' | 'emergencia' };
      await responderChamado(res, await chamados.mudarAtendimento(atorDe(req), id(req), acao));
    }),
    concluir: h(async (req, res) => {
      const r = await chamados.concluir(atorDe(req), id(req), req.body);
      const [item] = await chamados.enriquecer([r.chamado]);
      res.json({
        chamado: apresentarChamado(item!, fuso),
        documentos: r.documentos.map((d) => apresentarDocumento(d, fuso)),
      });
    }),
    documentosDoChamado: h(async (req, res) => {
      const docs = await chamados.documentosDoChamado(atorDe(req), id(req));
      res.json({ itens: docs.map((d) => apresentarDocumento(d, fuso)) });
    }),
    meusDocumentos: h(async (req, res) => {
      const docs = await chamados.documentosDoPaciente(atorDe(req).uid);
      res.json({ itens: docs.map((d) => apresentarDocumento(d, fuso)) });
    }),
    documento: h(async (req, res) => {
      res.json(apresentarDocumento(await chamados.documento(atorDe(req), id(req)), fuso));
    }),
    indicadores: h(async (req, res) => {
      const data = typeof req.query.data === 'string' ? req.query.data : undefined;
      res.json(await chamados.indicadores(atorDe(req), id(req, 'unidadeId'), data));
    }),

    // --- Plantão ---------------------------------------------------------------
    abrirPlantao: h(async (req, res) => {
      res.status(201).json(apresentarSessao(await plantoes.abrir(atorDe(req), req.body), fuso));
    }),
    plantaoAtual: h(async (req, res) => {
      const s = await plantoes.atual(atorDe(req));
      res.json({ plantao: s ? apresentarSessao(s, fuso) : null });
    }),
    encerrarPlantao: h(async (req, res) => {
      res.json(apresentarSessao(await plantoes.encerrar(atorDe(req)), fuso));
    }),
    fila: h(async (req, res) => {
      const f = await chamados.fila(atorDe(req));
      const [aguardando, emAndamento] = await Promise.all([
        chamados.enriquecer(f.aguardando),
        chamados.enriquecer(f.emAndamento),
      ]);
      res.json({
        plantao: f.sessao ? apresentarSessao(f.sessao, fuso) : null,
        aguardando: aguardando.map((i) => apresentarChamado(i, fuso)),
        emAndamento: emAndamento.map((i) => apresentarChamado(i, fuso)),
      });
    }),

    // --- Pré-triagem -------------------------------------------------------------
    triar: h(async (req, res) => {
      const ator = atorDe(req);
      const usuario = await usuarios.buscarPorId(ator.uid);
      if (!usuario) throw erros.naoAutenticado();
      const r = await triagem.triar({
        relato: (req.body as { relato: string }).relato,
        idade: idadeDe(usuario.dataNascimento, hojeNoFuso(fuso)),
        sexo: usuario.sexo ?? null,
        pacienteId: usuario.id,
        telefone: null,
        origem: 'app',
      });
      res.status(201).json({
        ...apresentarPreTriagem(r.triagem, fuso),
        unidades: r.unidades.map((u) => apresentarUnidade(u, fuso)),
        aviso: r.aviso,
      });
    }),

    // --- Equipe e pacientes ----------------------------------------------------
    criarConta: h(async (req, res) => {
      const r = await equipe.criarConta(atorDe(req), req.body as DadosContaEquipe);
      res.status(201).json(r);
    }),
    listarContas: h(async (req, res) => {
      const perfil = (req.query as { perfil: Parameters<EquipeService['listarPorPerfil']>[1] })
        .perfil;
      const lista = await equipe.listarPorPerfil(atorDe(req), perfil);
      res.json({ itens: lista.map((u) => apresentarUsuario(u, fuso)) });
    }),
    listarEquipe: h(async (req, res) => {
      const r = await equipe.listarEquipe(atorDe(req), id(req, 'unidadeId'));
      res.json({
        contas: r.contas.map((u) => apresentarUsuario(u, fuso)),
        medicos: r.medicos.map((m) => ({
          ...apresentarMedico(m, fuso),
          temConta: Boolean(m.usuarioId),
        })),
      });
    }),
    redefinirSenha: h(async (req, res) => {
      res.json(await equipe.redefinirSenha(atorDe(req), id(req)));
    }),
    alterarStatus: h(async (req, res) => {
      await equipe.alterarStatus(atorDe(req), id(req), (req.body as { ativo: boolean }).ativo);
      res.status(204).end();
    }),
    buscarPaciente: h(async (req, res) => {
      const p = await equipe.buscarPacientePorCpf((req.query as { cpf: string }).cpf);
      if (!p)
        throw erros.naoEncontrado('Não há paciente com esse CPF. Você pode fazer o pré-cadastro.');
      res.json(apresentarUsuario(p, fuso));
    }),
    preCadastrar: h(async (req, res) => {
      res.status(201).json(await equipe.preCadastrarPaciente(atorDe(req), req.body));
    }),
    registrarPushToken: h(async (req, res) => {
      await usuarios.adicionarPushToken(atorDe(req).uid, (req.body as { token: string }).token);
      res.status(204).end();
    }),

    // --- Painel de TV ----------------------------------------------------------
    iniciarPareamento: h(async (_req, res) => {
      const p = await painel.iniciarPareamento();
      res.status(201).json({ ...p, expiraEm: p.expiraEm.toISOString() });
    }),
    consultarPareamento: h(async (req, res) => {
      const { codigo, segredo } = req.body as { codigo: string; segredo: string };
      res.json(await painel.consultarPareamento(codigo, segredo));
    }),
    aprovarPareamento: h(async (req, res) => {
      const { codigo, nome } = req.body as { codigo: string; nome: string };
      const d = await painel.aprovarPareamento(atorDe(req), id(req, 'unidadeId'), codigo, nome);
      res.status(201).json({ id: d.id, nome: d.nome, unidadeId: d.unidadeId });
    }),
    listarPaineis: h(async (req, res) => {
      const lista = await painel.listarDispositivos(atorDe(req), id(req, 'unidadeId'));
      res.json({ itens: lista.map((d) => ({ id: d.id, nome: d.nome, unidadeId: d.unidadeId })) });
    }),
    desativarPainel: h(async (req, res) => {
      await painel.desativarDispositivo(atorDe(req), id(req));
      res.status(204).end();
    }),
    estadoPainel: h(async (req, res) => {
      res
        .set('Cache-Control', 'no-store')
        .json(await painel.estado(req.dispositivo as PainelDispositivo));
    }),

    /**
     * SSE (ADR-013). Em hospedagem serverless (Vercel) a conexão dura no máximo
     * ~1 minuto: o servidor consulta o estado a cada 2 s, envia quando muda e
     * fecha; o EventSource reconecta sozinho (retry). O app de TV usa o polling
     * de /painel/estado, que é o fallback previsto no ADR.
     */
    eventosPainel: async (req: Request, res: Response) => {
      const dispositivo = req.dispositivo as PainelDispositivo;
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-store',
        Connection: 'keep-alive',
        'X-Accel-Buffering': 'no',
      });
      res.write('retry: 2000\n\n');
      let ultimo = '';
      let encerrado = false;
      const enviar = async () => {
        if (encerrado) return;
        try {
          const estado = await painel.estado(dispositivo);
          const chave = `${estado.atual?.id ?? ''}`;
          if (chave !== ultimo) {
            ultimo = chave;
            res.write(`event: estado\ndata: ${JSON.stringify(estado)}\n\n`);
          } else {
            res.write(': ping\n\n');
          }
        } catch {
          res.write(': erro\n\n');
        }
      };
      await enviar();
      const intervalo = setInterval(() => void enviar(), 2000);
      const limite = setTimeout(() => res.end(), 50_000);
      req.on('close', () => {
        encerrado = true;
        clearInterval(intervalo);
        clearTimeout(limite);
      });
    },
  };
}

export type AtendimentoController = ReturnType<typeof criarAtendimentoController>;
