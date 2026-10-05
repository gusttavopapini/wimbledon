import type { ReactNode } from 'react';
import { View, type ViewStyle } from 'react-native';

import { useTema } from '@/hooks/useTema';

import { Texto } from './Texto';

export interface CartaoProps {
  /** conteudo (32px, sombra), interno (16px, contorno) ou alternativo (16px, fundo teal50). */
  variante?: 'conteudo' | 'interno' | 'alternativo';
  /** Vira um título de seção (tituloSecao). */
  titulo?: string;
  children: ReactNode;
}

/** Superfície que agrupa um assunto (design-system/components/Cartao). */
export function Cartao({ variante = 'conteudo', titulo, children }: CartaoProps) {
  const { cores, raio, espacamento, tamanho, sombras } = useTema();
  const estilo: Record<NonNullable<CartaoProps['variante']>, ViewStyle> = {
    conteudo: {
      borderRadius: raio.raioCartao,
      padding: espacamento.espacamento24,
      backgroundColor: cores.superficie,
      ...sombras.sombraCartao,
    },
    interno: {
      borderRadius: raio.raioCartaoInterno,
      padding: espacamento.espacamento16,
      borderWidth: tamanho.espessuraBorda,
      borderColor: cores.contorno,
      backgroundColor: cores.superficie,
    },
    alternativo: {
      borderRadius: raio.raioCartaoInterno,
      padding: espacamento.espacamento16,
      backgroundColor: cores.teal50,
    },
  };
  return (
    <View style={[estilo[variante], { gap: espacamento.espacamento8 }]}>
      {titulo ? (
        <Texto
          estilo="tituloSecao"
          cor="primariaEscura"
          accessibilityRole="header"
          style={{ marginBottom: espacamento.espacamento8 }}
        >
          {titulo}
        </Texto>
      ) : null}
      {children}
    </View>
  );
}
