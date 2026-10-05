import { View } from 'react-native';

import { useTema } from '@/hooks/useTema';

import { Botao } from './Botao';
import { Texto } from './Texto';

export interface CabecalhoTelaProps {
  /** Diz onde a pessoa está ("Minhas consultas"), não a ação. É o h1 da tela. */
  titulo: string;
  subtitulo?: string;
  /** null esconde o Voltar (abas da navegação inferior). */
  aoVoltar: (() => void) | null;
  /** Padrão "Voltar"; pode dizer o destino: "Voltar ao início". */
  rotuloVoltar?: string;
}

/** Cabeçalho das telas internas (design-system/components/CabecalhoTela). */
export function CabecalhoTela({
  titulo,
  subtitulo,
  aoVoltar,
  rotuloVoltar = 'Voltar',
}: CabecalhoTelaProps) {
  const { espacamento } = useTema();
  return (
    <View style={{ alignItems: 'flex-start', gap: espacamento.espacamento16 }}>
      {aoVoltar ? (
        // Alinhado à esquerda: quem usa lupa ou zoom acha o começo sem procurar.
        <View style={{ alignSelf: 'flex-start' }}>
          <Botao variante="secundario" icone="arrow-left" aoTocar={aoVoltar}>
            {rotuloVoltar}
          </Botao>
        </View>
      ) : null}
      <Texto estilo="tituloTela" cor="primariaEscura" accessibilityRole="header">
        {titulo}
      </Texto>
      {subtitulo ? (
        <Texto estilo="subtitulo" style={{ marginTop: -espacamento.espacamento8 }}>
          {subtitulo}
        </Texto>
      ) : null}
    </View>
  );
}
