import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useTema } from '@/hooks/useTema';
import { focoVeioDoTeclado } from '@/utils/focoPorTeclado';

import { estiloFoco } from './foco';
import { Icone } from './Icone';
import { Texto } from './Texto';

export interface CaixaMarcacaoProps {
  /** O texto do aceite, sempre visível ao lado da caixa. */
  rotulo: string;
  marcado: boolean;
  aoMudar: (marcado: boolean) => void;
  erro?: string;
}

/**
 * Adição ao design system (não há caixa de marcação nele). Segue as regras do
 * Chip: marcado tem fundo cheio E sinal de visto, nunca só a cor; a linha
 * inteira é o alvo de toque, com no mínimo 48px.
 */
export function CaixaMarcacao({ rotulo, marcado, aoMudar, erro }: CaixaMarcacaoProps) {
  const { cores, espacamento, tamanho } = useTema();
  const [focado, setFocado] = useState(false);
  const lado = espacamento.espacamento32;

  return (
    <View style={{ gap: espacamento.espacamento8 }}>
      {erro ? (
        <View
          style={[estilos.linha, { gap: espacamento.espacamento8 }]}
          accessible
          accessibilityRole="alert"
          accessibilityLabel={`Erro: ${erro}`}
          accessibilityLiveRegion="polite"
        >
          <Icone nome="circle-alert" cor="erro" />
          <Texto estilo="rotulo" cor="erro" style={estilos.flex}>
            {erro}
          </Texto>
        </View>
      ) : null}
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={rotulo}
        aria-checked={marcado}
        onPress={() => aoMudar(!marcado)}
        onFocus={() => setFocado(focoVeioDoTeclado())}
        onBlur={() => setFocado(false)}
        style={({ pressed }) => [
          estilos.linha,
          {
            minHeight: tamanho.alvoToqueMinimo,
            gap: espacamento.espacamento12,
            paddingVertical: espacamento.espacamento8,
            borderRadius: espacamento.espacamento8,
          },
          pressed && { backgroundColor: cores.teal50 },
          focado && estiloFoco(cores, tamanho.espessuraFoco),
        ]}
      >
        <View
          style={[
            estilos.caixa,
            {
              width: lado,
              height: lado,
              borderWidth: tamanho.espessuraBorda + (erro ? 1 : 0),
              borderColor: erro ? cores.erro : cores.contorno,
              borderRadius: espacamento.espacamento8,
              backgroundColor: marcado ? cores.primaria : cores.superficie,
            },
          ]}
        >
          {marcado ? <Icone nome="check" cor="textoSobrePrimaria" /> : null}
        </View>
        <Texto estilo="corpo" style={estilos.flex}>
          {rotulo}
        </Texto>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center' },
  caixa: { alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1, minWidth: 0 },
});
