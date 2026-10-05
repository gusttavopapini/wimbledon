import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useTema } from '@/hooks/useTema';

import { Texto } from './Texto';

export interface TopoProps {
  /** Saudação em display (40px): "Olá!", "Bom dia, Ana!". */
  titulo?: string;
  /** Uma frase, em subtitulo (20px). */
  subtitulo?: string;
  /** Acima do título (ex.: Avatar). */
  antes?: ReactNode;
  /** Abaixo do subtítulo (ex.: botão branco sobre o gradiente). */
  children?: ReactNode;
}

/**
 * Faixa de topo em gradiente (design-system/components/Topo). Só nas telas de
 * entrada. Depois dela, o conteúdo vai numa Folha.
 */
export function Topo({ titulo, subtitulo, antes, children }: TopoProps) {
  const { cores, modo, espacamento, tamanho } = useTema();
  const { top } = useSafeAreaInsets();
  const altoContraste = modo === 'altoContraste';
  const corTexto = altoContraste ? 'texto' : 'textoSobrePrimaria';

  const conteudo = (
    <View style={{ gap: espacamento.espacamento8 }}>
      {antes ? <View style={{ marginBottom: espacamento.espacamento8 }}>{antes}</View> : null}
      {titulo ? (
        <Texto estilo="display" cor={corTexto} accessibilityRole="header">
          {titulo}
        </Texto>
      ) : null}
      {subtitulo ? (
        <Texto estilo="subtitulo" cor={corTexto}>
          {subtitulo}
        </Texto>
      ) : null}
      {children ? <View style={{ marginTop: espacamento.espacamento8 }}>{children}</View> : null}
    </View>
  );

  const espacos = {
    paddingTop: top + espacamento.espacamento48,
    paddingHorizontal: tamanho.margemLateral,
  };

  // Alto contraste: sem gradiente e sem onda, fundo preto e linha branca embaixo.
  if (altoContraste) {
    return (
      <View
        style={[
          espacos,
          {
            paddingBottom: espacamento.espacamento24,
            backgroundColor: cores.superficie,
            borderBottomWidth: tamanho.espessuraBorda,
            borderBottomColor: cores.texto,
          },
        ]}
      >
        {conteudo}
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[cores.primaria, cores.primariaEscura]}
      style={[
        estilos.topo,
        espacos,
        { paddingBottom: espacamento.espacamento48 + espacamento.espacamento32 },
      ]}
    >
      {/* Onda decorativa em primariaClara: recua para a borda antes do subtítulo. */}
      <Svg
        viewBox="0 0 220 112"
        preserveAspectRatio="none"
        style={[estilos.onda, { top }]}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
      >
        <Path
          d="M40 0H220V112C196 108 176 92 158 72 132 44 112 40 84 32 62 26 46 16 40 0Z"
          fill={cores.primariaClara}
        />
      </Svg>
      {conteudo}
    </LinearGradient>
  );
}

const estilos = StyleSheet.create({
  topo: { overflow: 'hidden' },
  onda: { position: 'absolute', right: 0, width: '56%', height: 112 },
});
