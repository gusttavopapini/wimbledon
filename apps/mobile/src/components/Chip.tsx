import { View } from 'react-native';

import { useTema } from '@/hooks/useTema';

import { IconeEspecialidade } from './IconeEspecialidade';
import { Texto } from './Texto';

export interface ChipEspecialidadeProps {
  /** Id da especialidade (nome do ícone). */
  especialidade: string;
  /** O nome escrito: 1 a 3 palavras. */
  children: string;
}

/**
 * Chip do tipo especialidade sem aoTocar: só uma etiqueta, com fundo teal50 e
 * o ícone em 24px (design-system/components/Chip).
 */
export function ChipEspecialidade({ especialidade, children }: ChipEspecialidadeProps) {
  const { cores, espacamento, raio, tamanho } = useTema();
  return (
    <View
      accessible
      accessibilityLabel={`Especialidade: ${children}`}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: espacamento.espacamento8,
        minHeight: tamanho.alvoToqueMinimo,
        paddingVertical: espacamento.espacamento8,
        paddingLeft: espacamento.espacamento12,
        paddingRight: espacamento.espacamento16,
        borderRadius: raio.raioChip,
        borderWidth: tamanho.espessuraBorda,
        borderColor: cores.teal50,
        backgroundColor: cores.teal50,
      }}
    >
      <IconeEspecialidade especialidade={especialidade} tamanho={24} cor="primariaEscura" />
      <Texto estilo="rotulo" cor="primariaEscura" style={{ flexShrink: 1 }}>
        {children}
      </Texto>
    </View>
  );
}
