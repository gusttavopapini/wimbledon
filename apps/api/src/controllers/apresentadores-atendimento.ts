import type { NextFunction, Request, RequestHandler, Response } from 'express';

import { erros } from '../errors/AppError.js';
import type { ChamadosService } from '../services/chamados.service.js';
import type { Ator } from '../services/acesso.js';
import type {
  Bloqueio,
  Chamado,
  Consultorio,
  Disponibilidade,
  Documento,
  PreTriagem,
  SessaoPlantao,
} from '../types/atendimento.js';
import { paraIsoLocal } from '../utils/datas.js';

/** Controller sem repetir try/catch: qualquer erro vai para o errorHandler. */
export function h(fn: (req: Request, res: Response) => Promise<void>): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res);
    } catch (erro) {
      next(erro);
    }
  };
}

export function atorDe(req: Request): Ator {
  if (!req.usuario) throw erros.naoAutenticado();
  return req.usuario;
}

const iso = (d: Date | null | undefined, fuso: string) => (d ? paraIsoLocal(d, fuso) : null);

/** Etapa do acompanhamento que o paciente vê (0 a 5), igual ao protótipo. */
export function etapaDoChamado(c: Chamado): number {
  switch (c.status) {
    case 'agendado':
      return 0;
    case 'aguardando_recepcao':
      return 0;
    case 'aguardando_medico':
      return 2;
    case 'chamando':
      return 3;
    case 'em_atendimento':
      return 4;
    case 'concluido':
      return 5;
    default:
      return -1;
  }
}

/** RN04: o paciente só altera até 2 h antes. */
function podeAlterar(c: Chamado, agora = Date.now()): boolean {
  return (
    (c.status === 'agendado' || c.status === 'aguardando_recepcao') &&
    Boolean(c.inicio) &&
    c.inicio!.getTime() - agora >= 2 * 60 * 60 * 1000
  );
}

type Enriquecido = Awaited<ReturnType<ChamadosService['enriquecer']>>[number];

export function apresentarChamado(item: Enriquecido, fuso: string) {
  const { chamado: c, unidade } = item;
  return {
    id: c.id,
    tipo: c.tipo,
    status: c.status,
    etapa: etapaDoChamado(c),
    urgencia: c.urgencia,
    data: c.data,
    hora: c.hora,
    inicio: iso(c.inicio, fuso),
    paciente: { id: c.pacienteId, nome: c.pacienteNome, nomePainel: c.pacienteNomePainel },
    unidade: unidade
      ? {
          id: unidade.id,
          nome: unidade.nome,
          endereco: unidade.endereco,
          telefone: unidade.telefone,
        }
      : { id: c.unidadeId, nome: '', endereco: null, telefone: null },
    especialidade: { id: c.especialidadeId, nome: item.especialidadeNome ?? c.especialidadeId },
    medico: c.medicoId
      ? { id: c.medicoId, nome: item.medicoNome ?? '', conselho: item.medicoConselho }
      : null,
    consultorio: c.consultorioNome,
    formaPagamento: c.formaPagamento,
    preTriagemId: c.preTriagemId,
    origem: c.origem,
    chegadaEm: iso(c.chegadaEm, fuso),
    aceitoEm: iso(c.aceitoEm, fuso),
    inicioAtendimentoEm: iso(c.inicioAtendimentoEm, fuso),
    concluidoEm: iso(c.concluidoEm, fuso),
    canceladoEm: iso(c.canceladoEm, fuso),
    orientacao: c.orientacao,
    podeAlterar: podeAlterar(c),
    historico: c.historico.map((e) => ({ status: e.status, em: iso(e.em, fuso) })),
    criadoEm: iso(c.criadoEm, fuso),
  };
}

export function apresentarDocumento(d: Documento, fuso: string) {
  return {
    id: d.id,
    chamadoId: d.chamadoId,
    tipo: d.tipo,
    titulo: d.titulo,
    conteudo: d.conteudo,
    itens: d.itens,
    medico: { id: d.medicoId, nome: d.medicoNome, conselho: d.medicoConselho },
    unidadeId: d.unidadeId,
    emitidoEm: iso(d.emitidoEm, fuso),
  };
}

export function apresentarSessao(s: SessaoPlantao, fuso: string) {
  return {
    id: s.id,
    medicoId: s.medicoId,
    medicoNome: s.medicoNome,
    unidadeId: s.unidadeId,
    consultorio: { id: s.consultorioId, nome: s.consultorioNome },
    ativa: s.ativa,
    abertaEm: iso(s.abertaEm, fuso),
    encerradaEm: iso(s.encerradaEm, fuso),
  };
}

export function apresentarPreTriagem(t: PreTriagem, fuso: string) {
  return {
    id: t.id,
    alerta: t.alerta,
    especialidade: { id: t.resultado.especialidadeId, nome: t.resultado.especialidadeNome },
    confianca: t.resultado.confianca,
    urgencia: t.resultado.urgencia,
    sinaisAlerta: t.resultado.sinaisAlerta,
    justificativa: t.resultado.justificativa,
    orientacao: t.resultado.orientacao,
    criadoEm: iso(t.criadoEm, fuso),
  };
}

export const apresentarConsultorio = (c: Consultorio) => c;
export const apresentarDisponibilidade = (d: Disponibilidade) => d;
export const apresentarBloqueio = (b: Bloqueio) => b;
