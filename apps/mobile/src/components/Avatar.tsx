import { View } from 'react-native';

import { useTema } from '@/hooks/useTema';
import { iniciais } from '@/utils/texto';

import { Texto } from './Texto';

export interface AvatarProps {
  nome: string;
  /** 48, 64 ou 96. Padrão: 64. */
  tamanho?: 48 | 64 | 96;
  /** Sobre o Topo ganha um anel de 3px. */
  sobreTopo?: boolean;
  /** Só quando o avatar estiver sozinho, sem o nome escrito ao lado. */
  descricao?: string;
}

/**
 * Iniciais em primaria (design-system/components/Avatar). Ao lado do nome é
 * decorativo: o leitor de tela não repete o nome. Tamanho mínimo, não fixo:
 * com a fonte do sistema grande, o círculo cresce junto com as letras.
 */
export function Avatar({ nome, tamanho = 64, sobreTopo = false, descricao }: AvatarProps) {
  const { cores, modo, raio } = useTema();
  const fonte = Math.max(16, Math.round(tamanho * 0.36));
  return (
    <View
      accessible={Boolean(descricao)}
      accessibilityRole={descricao ? 'image' : undefined}
      accessibilityLabel={descricao}
      importantForAccessibility={descricao ? 'yes' : 'no-hide-descendants'}
      accessibilityElementsHidden={!descricao}
      style={{
        minWidth: tamanho,
        minHeight: tamanho,
        borderRadius: raio.raioChip,
        backgroundColor: cores.primaria,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
        ...(sobreTopo
          ? {
              borderWidth: 3,
              borderColor: modo === 'altoContraste' ? cores.texto : cores.textoSobrePrimaria,
            }
          : {}),
      }}
    >
      <Texto
        estilo="corpoForte"
        cor="textoSobrePrimaria"
        style={{ fontSize: fonte, lineHeight: Math.round(fonte * 1.25), letterSpacing: 0.4 }}
      >
        {iniciais(nome)}
      </Texto>
    </View>
  );
}
