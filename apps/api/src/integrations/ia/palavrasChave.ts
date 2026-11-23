import { normalizarBusca } from '../../utils/texto.js';
import type { EntradaTriagem, ProvedorIA } from './ProvedorIA.js';

/**
 * Provedor sem IA, usado quando não há ANTHROPIC_API_KEY (desenvolvimento,
 * demonstração offline). Pontua as especialidades pelas palavras-chave do relato.
 */
export function criarProvedorPalavrasChave(
  buscarPalavras: () => Promise<Map<string, string[]>>,
): ProvedorIA {
  return {
    nome: 'palavras-chave',
    async triar(entrada: EntradaTriagem) {
      const relato = normalizarBusca(entrada.relato);
      const palavrasPorEspecialidade = await buscarPalavras();
      let melhor = { id: 'clinicoGeral', pontos: 0 };
      for (const e of entrada.especialidades) {
        const palavras = [e.nome, ...(palavrasPorEspecialidade.get(e.id) ?? [])].map(
          normalizarBusca,
        );
        const pontos = palavras.filter((p) => p && relato.includes(p)).length;
        if (pontos > melhor.pontos) melhor = { id: e.id, pontos };
      }
      const nome = entrada.especialidades.find((e) => e.id === melhor.id)?.nome ?? 'Clínico geral';
      return {
        especialidade: melhor.id,
        confianca: melhor.pontos > 0 ? Math.min(0.5 + melhor.pontos * 0.15, 0.9) : 0.4,
        urgencia: 'rotina',
        sinaisAlerta: [],
        justificativa: `Pelo que você contou, ${nome} é a especialidade indicada para começar.`,
        orientacao: 'Se os sintomas piorarem antes da consulta, procure atendimento.',
      };
    },
  };
}
