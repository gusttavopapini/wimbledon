import type { Logger } from 'pino';

import { saidaTriagem, type ProvedorIA } from '../integrations/ia/ProvedorIA.js';
import type { EspecialidadesRepository } from '../repositories/especialidades.repository.js';
import type { PreTriagensRepository } from '../repositories/pretriagens.repository.js';
import type { UnidadesRepository } from '../repositories/unidades.repository.js';
import type { PreTriagem, ResultadoTriagem } from '../types/atendimento.js';
import type { Unidade } from '../types/cadastros.js';
import { normalizarBusca } from '../utils/texto.js';

export const AVISO_IA =
  'Esta é uma orientação inicial feita por inteligência artificial. Ela não substitui a avaliação de um médico.';

/**
 * Sinais de alerta checados na API, independentemente da IA (DAES, seção IA).
 * Em alerta: orientar o SAMU 192 (e o CVV 188 em autolesão) e NÃO abrir chamado.
 */
const ALERTAS: { sinal: string; termos: string[]; autolesao?: boolean }[] = [
  {
    sinal: 'Dor no peito',
    termos: ['dor no peito', 'aperto no peito', 'peito apertado', 'dor forte no peito'],
  },
  {
    sinal: 'Falta de ar intensa',
    termos: [
      'falta de ar intensa',
      'nao consigo respirar',
      'sem conseguir respirar',
      'muita falta de ar',
      'falta de ar forte',
    ],
  },
  {
    sinal: 'Sinais de AVC',
    termos: [
      'boca torta',
      'rosto torto',
      'fala enrolada',
      'fraqueza de um lado',
      'lado do corpo dormente',
      'avc',
      'derrame',
    ],
  },
  {
    sinal: 'Sangramento intenso',
    termos: ['sangramento intenso', 'sangrando muito', 'muito sangue', 'hemorragia'],
  },
  {
    sinal: 'Desmaio ou convulsão',
    termos: ['desmaiei', 'desmaio', 'desmaiou', 'convulsao', 'convulsionando', 'ataque epileptico'],
  },
  {
    sinal: 'Febre alta em bebê',
    termos: [
      'bebe com febre',
      'febre alta no bebe',
      'bebe esta com febre',
      'recem-nascido com febre',
    ],
  },
  {
    sinal: 'Risco de autolesão',
    termos: [
      'me matar',
      'tirar minha vida',
      'suicidio',
      'me machucar',
      'nao quero mais viver',
      'acabar com tudo',
    ],
    autolesao: true,
  },
];

export function checarAlertas(relato: string): { sinais: string[]; autolesao: boolean } {
  const texto = normalizarBusca(relato);
  const achados = ALERTAS.filter((a) => a.termos.some((t) => texto.includes(normalizarBusca(t))));
  return { sinais: achados.map((a) => a.sinal), autolesao: achados.some((a) => a.autolesao) };
}

export function orientacaoDeEmergencia(autolesao: boolean): string {
  return autolesao
    ? 'Você não está sozinho. Ligue agora para o CVV, no 188, a qualquer hora. Se houver perigo imediato, ligue para o SAMU, no 192.'
    : 'Isso pode ser uma emergência. Ligue agora para o SAMU, no 192, ou vá ao pronto-socorro mais próximo. Não espere a consulta.';
}

const CONFIANCA_MINIMA = 0.5;
const FALLBACK = 'clinicoGeral';

export function criarTriagemService(deps: {
  provedor: ProvedorIA;
  reserva: ProvedorIA;
  especialidades: EspecialidadesRepository;
  unidades: UnidadesRepository;
  preTriagens: PreTriagensRepository;
  logger?: Logger;
}) {
  const { provedor, reserva, especialidades, unidades, preTriagens, logger } = deps;

  async function perguntar(entrada: Parameters<ProvedorIA['triar']>[0]) {
    try {
      return { bruto: await provedor.triar(entrada), nome: provedor.nome };
    } catch (erro) {
      // IA fora do ar: segue com o provedor de palavras-chave para não travar o paciente.
      logger?.warn(
        { err: erro, provedor: provedor.nome },
        'IA indisponível; usando palavras-chave',
      );
      return { bruto: await reserva.triar(entrada), nome: `${reserva.nome} (reserva)` };
    }
  }

  return {
    async triar(dados: {
      relato: string;
      idade: number | null;
      sexo: string | null;
      pacienteId: string | null;
      telefone: string | null;
      origem: PreTriagem['origem'];
    }): Promise<{ triagem: PreTriagem; unidades: Unidade[]; aviso: string }> {
      const lista = await especialidades.listarAtivas();
      const nomeDe = (id: string) => lista.find((e) => e.id === id)?.nome ?? 'Clínico geral';
      const alerta = checarAlertas(dados.relato);

      let resultado: ResultadoTriagem;
      let nomeProvedor = 'regras-de-alerta';

      if (alerta.sinais.length > 0) {
        resultado = {
          especialidadeId: FALLBACK,
          especialidadeNome: nomeDe(FALLBACK),
          confianca: 1,
          urgencia: 'emergencia',
          sinaisAlerta: alerta.sinais,
          justificativa: `Você contou um sinal de alerta: ${alerta.sinais.join(', ').toLowerCase()}.`,
          orientacao: orientacaoDeEmergencia(alerta.autolesao),
        };
      } else {
        const { bruto, nome } = await perguntar({
          idade: dados.idade,
          sexo: dados.sexo,
          relato: dados.relato,
          especialidades: lista.map((e) => ({ id: e.id, nome: e.nome, descricao: e.descricao })),
        });
        nomeProvedor = nome;
        const saida = saidaTriagem.safeParse(bruto);
        const valida =
          saida.success &&
          saida.data.confianca >= CONFIANCA_MINIMA &&
          lista.some((e) => e.id === saida.data.especialidade);
        const especialidadeId = valida ? saida.data!.especialidade : FALLBACK;
        const urgencia = saida.success ? saida.data.urgencia : 'rotina';
        resultado = {
          especialidadeId,
          especialidadeNome: nomeDe(especialidadeId),
          confianca: saida.success ? saida.data.confianca : 0,
          urgencia,
          sinaisAlerta: saida.success ? saida.data.sinaisAlerta : [],
          justificativa: valida
            ? saida.data!.justificativa
            : 'Para começar, o clínico geral avalia seus sintomas e indica o especialista, se precisar.',
          orientacao:
            urgencia === 'emergencia'
              ? orientacaoDeEmergencia(false)
              : saida.success
                ? saida.data.orientacao
                : 'Se os sintomas piorarem antes da consulta, procure atendimento.',
        };
      }

      const emAlerta = resultado.urgencia === 'emergencia';
      const triagem = await preTriagens.criar({
        pacienteId: dados.pacienteId,
        telefone: dados.telefone,
        relato: dados.relato,
        idade: dados.idade,
        sexo: dados.sexo,
        alerta: emAlerta,
        resultado,
        provedor: nomeProvedor,
        origem: dados.origem,
        criadoEm: new Date(),
      });

      // A IA indica a especialidade; a API calcula as unidades e o paciente escolhe (RF45).
      const opcoes = emAlerta
        ? []
        : await unidades.listarAtivas({ especialidadeId: resultado.especialidadeId });
      return { triagem, unidades: opcoes, aviso: AVISO_IA };
    },
  };
}

export type TriagemService = ReturnType<typeof criarTriagemService>;

/** Idade em anos a partir de "AAAA-MM-DD". */
export function idadeDe(dataNascimento: string | undefined, hoje: string): number | null {
  if (!dataNascimento) return null;
  const [a, m, d] = dataNascimento.split('-').map(Number) as [number, number, number];
  const [ha, hm, hd] = hoje.split('-').map(Number) as [number, number, number];
  return ha - a - (hm < m || (hm === m && hd < d) ? 1 : 0);
}
