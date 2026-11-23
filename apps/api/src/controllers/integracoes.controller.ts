import type { Request } from 'express';

import { erros } from '../errors/AppError.js';
import type { MedicosRepository } from '../repositories/medicos.repository.js';
import type { UnidadesRepository } from '../repositories/unidades.repository.js';
import type { UsuariosRepository } from '../repositories/usuarios.repository.js';
import type { Ator } from '../services/acesso.js';
import type { AgendaService } from '../services/agenda.service.js';
import type { ChamadosService } from '../services/chamados.service.js';
import { idadeDe, type TriagemService } from '../services/triagem.service.js';
import { hojeNoFuso } from '../utils/datas.js';
import { apresentarChamado, apresentarPreTriagem, h } from './apresentadores-atendimento.js';

/**
 * Ferramentas do agente de IA do N8N (WhatsApp). Ele nunca toca no banco:
 * chama só estas rotas, com X-Api-Key. O paciente é identificado pelo
 * telefone cadastrado; a IA nunca recebe nome, CPF ou e-mail (RN12).
 */
export function criarIntegracoesController(deps: {
  usuarios: UsuariosRepository;
  unidades: UnidadesRepository;
  medicos: MedicosRepository;
  agenda: AgendaService;
  chamados: ChamadosService;
  triagem: TriagemService;
  fuso: string;
}) {
  const { usuarios, unidades, medicos, agenda, chamados, triagem, fuso } = deps;

  async function pacientePorTelefone(telefone: string) {
    const p = await usuarios.buscarPorTelefone(telefone);
    if (!p || p.perfil !== 'paciente') {
      throw erros.naoEncontrado(
        'Não encontramos cadastro com este telefone. Peça para a pessoa se cadastrar no app ou na recepção.',
      );
    }
    return p;
  }
  const comoAtor = (pacienteId: string): Ator => ({
    uid: pacienteId,
    perfil: 'paciente',
    unidadeIds: [],
  });
  const telefoneDe = (req: Request) =>
    String((req.body as { telefone?: string }).telefone ?? req.params.telefone);

  return {
    triar: h(async (req, res) => {
      const corpo = req.body as { telefone: string; relato: string; idade?: number; sexo?: string };
      const paciente = await usuarios.buscarPorTelefone(corpo.telefone);
      const r = await triagem.triar({
        relato: corpo.relato,
        idade: corpo.idade ?? idadeDe(paciente?.dataNascimento, hojeNoFuso(fuso)),
        sexo: corpo.sexo ?? paciente?.sexo ?? null,
        pacienteId: paciente?.perfil === 'paciente' ? paciente.id : null,
        telefone: corpo.telefone,
        origem: 'whatsapp',
      });
      res.json({
        ...apresentarPreTriagem(r.triagem, fuso),
        pacienteCadastrado: Boolean(paciente),
        unidades: r.unidades.map((u) => ({ id: u.id, nome: u.nome, bairro: u.endereco.bairro })),
        aviso: r.aviso,
      });
    }),

    unidadesDaEspecialidade: h(async (req, res) => {
      const lista = await unidades.listarAtivas({ especialidadeId: String(req.params.id) });
      res.json({
        itens: lista.map((u) => ({
          id: u.id,
          nome: u.nome,
          bairro: u.endereco.bairro,
          telefone: u.telefone,
        })),
      });
    }),

    medicos: h(async (req, res) => {
      const { unidadeId, especialidadeId } = req.query as {
        unidadeId?: string;
        especialidadeId?: string;
      };
      const lista = await medicos.listarAtivos({ unidadeId, especialidadeId });
      res.json({
        itens: lista.map((m) => ({ id: m.id, nome: m.nome, especialidadeIds: m.especialidadeIds })),
      });
    }),

    horarios: h(async (req, res) => {
      const { medicoId, unidadeId, de } = req.query as {
        medicoId: string;
        unidadeId: string;
        de?: string;
      };
      // Para o WhatsApp, só os 3 primeiros dias com horário e até 6 horários por dia.
      const dias = await agenda.horariosLivres(medicoId, unidadeId, de, 14);
      res.json({
        itens: dias.slice(0, 3).map((d) => ({ data: d.data, horarios: d.horarios.slice(0, 6) })),
      });
    }),

    consultas: h(async (req, res) => {
      const p = await pacientePorTelefone(telefoneDe(req));
      const lista = (await chamados.listarDoPaciente(p.id)).filter((c) =>
        ['agendado', 'aguardando_recepcao'].includes(c.status),
      );
      const itens = await chamados.enriquecer(lista);
      res.json({
        itens: itens.map((i) => {
          const c = apresentarChamado(i, fuso);
          return {
            id: c.id,
            data: c.data,
            hora: c.hora,
            medico: c.medico?.nome,
            unidade: c.unidade.nome,
            especialidade: c.especialidade.nome,
            podeAlterar: c.podeAlterar,
          };
        }),
      });
    }),

    agendar: h(async (req, res) => {
      const corpo = req.body as {
        telefone: string;
        medicoId: string;
        unidadeId: string;
        especialidadeId: string;
        data: string;
        hora: string;
        preTriagemId?: string;
      };
      const p = await pacientePorTelefone(corpo.telefone);
      const { telefone: _t, ...dados } = corpo;
      const c = await chamados.agendar(comoAtor(p.id), dados, 'whatsapp');
      const [item] = await chamados.enriquecer([c]);
      const a = apresentarChamado(item!, fuso);
      res.status(201).json({
        id: a.id,
        data: a.data,
        hora: a.hora,
        medico: a.medico?.nome,
        unidade: a.unidade.nome,
      });
    }),

    cancelar: h(async (req, res) => {
      const p = await pacientePorTelefone(telefoneDe(req));
      const c = await chamados.cancelar(comoAtor(p.id), String(req.params.id));
      res.json({ id: c.id, status: c.status });
    }),
  };
}
