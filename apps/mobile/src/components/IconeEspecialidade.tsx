import Svg, { Circle, Path } from 'react-native-svg';

import { useTema } from '@/hooks/useTema';
import type { NomeCor } from '@/theme/tema';

import { ICONES_ESPECIALIDADE, type IdIconeEspecialidade } from './iconesEspecialidade';

export interface IconeEspecialidadeProps {
  /** Id da especialidade na API, igual ao nome do arquivo do ícone. */
  especialidade: string;
  /** 48px no círculo do CartaoEspecialidade, 24px em chip. */
  tamanho?: number;
  /** Cor do texto ao lado; o stroke fixo do arquivo SVG é ignorado. */
  cor?: NomeCor;
  /** Só quando o ícone aparece sozinho, sem o nome escrito ao lado. */
  rotulo?: string;
}

function temIcone(id: string): id is IdIconeEspecialidade {
  return id in ICONES_ESPECIALIDADE;
}

/**
 * Ícones vetoriais das especialidades (design-system/components/IconeEspecialidade):
 * traço de 2px em grade de 24, cor do tema. Especialidade nova sem ícone usa o
 * estetoscópio do clínico geral; o nome escrito ao lado é o que informa.
 */
export function IconeEspecialidade({
  especialidade,
  tamanho = 48,
  cor = 'primaria',
  rotulo,
}: IconeEspecialidadeProps) {
  const { cores } = useTema();
  const formas = ICONES_ESPECIALIDADE[temIcone(especialidade) ? especialidade : 'clinicoGeral'];

  return (
    <Svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 24 24"
      fill="none"
      color={cores[cor]}
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      accessible={Boolean(rotulo)}
      accessibilityRole={rotulo ? 'image' : undefined}
      accessibilityLabel={rotulo}
      importantForAccessibility={rotulo ? 'yes' : 'no-hide-descendants'}
    >
      {formas.map((forma, i) =>
        forma.tipo === 'path' ? (
          <Path key={i} d={forma.d} />
        ) : (
          <Circle key={i} cx={forma.cx} cy={forma.cy} r={forma.r} />
        ),
      )}
    </Svg>
  );
}
