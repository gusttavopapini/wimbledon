import type { TextStyle } from 'react-native';

import {
  cores,
  espacamento,
  raio,
  sombras,
  tamanho,
  tipo,
  tipoGrande,
  type ModoCor,
} from './tokens';

export type NomeCor = keyof (typeof cores)['claro'];
export type PaletaCores = Record<NomeCor, string>;
export type NomeEstiloTexto = keyof typeof tipo;
export interface EstiloTexto {
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  fontWeight: TextStyle['fontWeight'];
}

export interface PreferenciasVisuais {
  altoContraste: boolean;
  letraGrande: boolean;
}

export interface Tema {
  modo: ModoCor;
  letraGrande: boolean;
  cores: PaletaCores;
  tipo: Record<NomeEstiloTexto, EstiloTexto>;
  espacamento: typeof espacamento;
  raio: typeof raio;
  tamanho: typeof tamanho;
  sombras: (typeof sombras)[ModoCor];
}

/**
 * Monta o tema a partir dos tokens gerados. Letra grande troca cada estilo pelo
 * equivalente do grupo "Letra grande" (corpo -> corpoGrande); combina com
 * qualquer modo de cor.
 */
export function montarTema({ altoContraste, letraGrande }: PreferenciasVisuais): Tema {
  const modo: ModoCor = altoContraste ? 'altoContraste' : 'claro';
  const nomes = Object.keys(tipo) as NomeEstiloTexto[];
  const estilos = Object.fromEntries(
    nomes.map((nome) => {
      const grande = (tipoGrande as Record<string, EstiloTexto>)[`${nome}Grande`];
      return [nome, letraGrande && grande ? grande : tipo[nome]];
    }),
  ) as Record<NomeEstiloTexto, EstiloTexto>;

  return {
    modo,
    letraGrande,
    cores: cores[modo],
    tipo: estilos,
    espacamento,
    raio,
    tamanho,
    sombras: sombras[modo],
  };
}
