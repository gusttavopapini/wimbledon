import { createHash, randomBytes, randomInt, timingSafeEqual } from 'node:crypto';

import { erros } from '../errors/AppError.js';
import type { ChamadosRepository } from '../repositories/chamados.repository.js';
import type { PainelRepository } from '../repositories/painel.repository.js';
import type { UnidadesRepository } from '../repositories/unidades.repository.js';
import type { ChamadaPainel, PainelDispositivo } from '../types/atendimento.js';
import { hojeNoFuso } from '../utils/datas.js';
import { exigirGestaoUnidade, type Ator } from './acesso.js';

const VALIDADE_PAREAMENTO_MS = 10 * 60 * 1000;

export const sha256 = (texto: string) => createHash('sha256').update(texto).digest('hex');

function iguais(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Painel de TV (RN25): autentica por token de dispositivo, só lê, e só da
 * própria unidade. O token nunca é guardado puro: só o SHA-256.
 */
export function criarPainelService(deps: {
  painel: PainelRepository;
  chamados: ChamadosRepository;
  unidades: UnidadesRepository;
  fuso: string;
}) {
  const { painel, chamados, unidades, fuso } = deps;

  return {
    /** A TV pede um código de 6 números para mostrar na tela. */
    async iniciarPareamento() {
      const segredo = randomBytes(24).toString('base64url');
      const expiraEm = new Date(Date.now() + VALIDADE_PAREAMENTO_MS);
      for (let tentativa = 0; tentativa < 5; tentativa++) {
        const codigo = String(randomInt(0, 1_000_000)).padStart(6, '0');
        if (await painel.criarPareamento(codigo, sha256(segredo), expiraEm)) {
          return { codigo, segredo, expiraEm };
        }
      }
      throw erros.limiteExcedido();
    },

    /** A TV pergunta se o código já foi aprovado. Quando sim, recebe o token UMA vez. */
    async consultarPareamento(codigo: string, segredo: string) {
      const p = await painel.buscarPareamento(codigo);
      if (!p || !iguais(p.segredoHash, sha256(segredo)))
        throw erros.naoProcessavel('PAREAMENTO_INVALIDO');
      if (p.token) {
        const retirado = await painel.retirarToken(codigo);
        if (retirado) return { status: 'aprovado' as const, ...retirado };
      }
      if (p.expiraEm.getTime() < Date.now()) throw erros.naoProcessavel('PAREAMENTO_INVALIDO');
      return { status: 'aguardando' as const };
    },

    /** A manutenção (ou o administrativo) digita o código da TV no app. */
    async aprovarPareamento(ator: Ator, unidadeId: string, codigo: string, nome: string) {
      exigirGestaoUnidade(ator, unidadeId);
      if (!(await unidades.buscarPorId(unidadeId))) throw erros.naoEncontrado();
      const token = `pnl_${randomBytes(32).toString('base64url')}`;
      const dispositivo = await painel.aprovarPareamento(
        codigo,
        { unidadeId, nome, tokenHash: sha256(token), ativo: true, criadoPor: ator.uid },
        token,
      );
      if (!dispositivo) throw erros.naoProcessavel('PAREAMENTO_INVALIDO');
      return dispositivo;
    },

    async listarDispositivos(ator: Ator, unidadeId: string): Promise<PainelDispositivo[]> {
      exigirGestaoUnidade(ator, unidadeId);
      return (await painel.listarDaUnidade(unidadeId)).filter((d) => d.ativo);
    },

    async desativarDispositivo(ator: Ator, id: string): Promise<void> {
      const d = await painel.buscar(id);
      if (!d) throw erros.naoEncontrado();
      exigirGestaoUnidade(ator, d.unidadeId);
      await painel.desativar(id);
    },

    async autenticarToken(token: string): Promise<PainelDispositivo | null> {
      const d = await painel.buscarPorTokenHash(sha256(token));
      return d?.ativo ? d : null;
    },

    /** O que a TV mostra: a chamada atual e as anteriores do dia. */
    async estado(dispositivo: PainelDispositivo) {
      const [unidade, chamadas] = await Promise.all([
        unidades.buscarPorId(dispositivo.unidadeId),
        chamados.chamadasDoDia(dispositivo.unidadeId, hojeNoFuso(fuso)),
      ]);
      const apresentar = (c: ChamadaPainel) => ({
        id: c.id,
        chamadoId: c.chamadoId,
        nome: c.nomeExibicao,
        consultorio: c.consultorioNome,
        medico: c.medicoNome,
        em: c.em.toISOString(),
      });
      const [atual, ...resto] = chamadas;
      // Anteriores sem repetir o mesmo paciente (o "chamar de novo" não duplica a lista).
      const vistos = new Set(atual ? [atual.chamadoId] : []);
      const anteriores = resto
        .filter((c) => !vistos.has(c.chamadoId) && vistos.add(c.chamadoId))
        .slice(0, 4);
      return {
        unidade: { id: dispositivo.unidadeId, nome: unidade?.nome ?? '' },
        dispositivo: { id: dispositivo.id, nome: dispositivo.nome },
        atual: atual ? apresentar(atual) : null,
        anteriores: anteriores.map(apresentar),
        geradoEm: new Date().toISOString(),
      };
    },
  };
}

export type PainelService = ReturnType<typeof criarPainelService>;
