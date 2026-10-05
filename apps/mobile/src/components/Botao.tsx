import { useState } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';

import { useTema } from '@/hooks/useTema';
import { focoVeioDoTeclado } from '@/utils/focoPorTeclado';
import type { NomeCor } from '@/theme/tema';

import { estiloFoco } from './foco';
import { Girando } from './Girando';
import { Icone, type NomeIcone } from './Icone';
import { Texto } from './Texto';

export interface BotaoProps {
  /** O rótulo: um verbo que diz o que acontece. */
  children: string;
  /** Padrão: primario. No máximo um primário por tela. */
  variante?: 'primario' | 'secundario' | 'terciario' | 'destrutivo';
  /** Ação principal da tela: 64px de altura mínima e largura total. */
  principal?: boolean;
  /** Largura total sem subir para 64px (ex.: secundário abaixo do principal). */
  larguraTotal?: boolean;
  desabilitado?: boolean;
  /** Mostra o indicador, troca o texto por rotuloCarregando e ignora toques. */
  carregando?: boolean;
  rotuloCarregando?: string;
  icone?: NomeIcone;
  iconeFim?: NomeIcone;
  aoTocar?: () => void;
  /** Explica o que acontece ao tocar, quando o rótulo não basta. */
  dica?: string;
  /** Sobre o gradiente do Topo, o secundário ganha contorno claro. */
  sobreTopo?: boolean;
}

/** Botao do design system (design-system/components/Botao). */
export function Botao({
  children,
  variante = 'primario',
  principal = false,
  larguraTotal = false,
  desabilitado = false,
  carregando = false,
  rotuloCarregando = 'Aguarde…',
  icone,
  iconeFim,
  aoTocar,
  dica,
  sobreTopo = false,
}: BotaoProps) {
  const { cores, tamanho, espacamento, raio, modo } = useTema();
  const [focado, setFocado] = useState(false);
  const rotulo = carregando ? rotuloCarregando : children;
  const inativo = desabilitado || carregando;

  function aparencia(pressionado: boolean): { caixa: ViewStyle; texto: NomeCor } {
    if (desabilitado) {
      return {
        caixa: {
          backgroundColor: cores.teal50,
          borderColor: cores.textoSecundario,
          borderStyle: 'dashed',
        },
        texto: 'textoSecundario',
      };
    }
    switch (variante) {
      case 'secundario': {
        const borda = sobreTopo && modo === 'claro' ? cores.superficie : cores.contorno;
        return pressionado
          ? {
              caixa: { backgroundColor: cores.teal50, borderColor: cores.primariaEscura },
              texto: 'primariaEscura',
            }
          : { caixa: { backgroundColor: cores.superficie, borderColor: borda }, texto: 'primaria' };
      }
      case 'terciario':
        return pressionado
          ? {
              caixa: { backgroundColor: cores.teal50, borderColor: 'transparent' },
              texto: 'primariaEscura',
            }
          : {
              caixa: { backgroundColor: 'transparent', borderColor: 'transparent' },
              texto: 'primaria',
            };
      case 'destrutivo':
        return pressionado
          ? {
              caixa: { backgroundColor: cores.textoSobreStatus, borderColor: cores.erro },
              texto: 'erro',
            }
          : {
              caixa: { backgroundColor: cores.erro, borderColor: cores.erro },
              texto: 'textoSobreStatus',
            };
      default:
        return pressionado
          ? {
              caixa: { backgroundColor: cores.primariaEscura, borderColor: cores.primariaEscura },
              texto: 'textoSobrePrimaria',
            }
          : {
              caixa: { backgroundColor: cores.primaria, borderColor: cores.primaria },
              texto: 'textoSobrePrimaria',
            };
    }
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotulo}
      accessibilityHint={dica}
      aria-disabled={inativo}
      aria-busy={carregando}
      disabled={inativo}
      onPress={aoTocar}
      onFocus={() => setFocado(focoVeioDoTeclado())}
      onBlur={() => setFocado(false)}
      style={({ pressed }) => {
        const { caixa } = aparencia(pressed);
        return [
          estilos.base,
          {
            minHeight: principal ? tamanho.alturaBotaoPrincipal : tamanho.alturaBotao,
            minWidth: tamanho.alvoToqueMinimo,
            paddingVertical: espacamento.espacamento12,
            paddingHorizontal:
              variante === 'terciario' ? espacamento.espacamento16 : espacamento.espacamento24,
            borderWidth: tamanho.espessuraBorda,
            borderRadius: raio.raioBotao,
            gap: espacamento.espacamento8,
          },
          (principal || larguraTotal) && estilos.larguraTotal,
          caixa,
          focado && estiloFoco(cores, tamanho.espessuraFoco),
        ];
      }}
    >
      {({ pressed }) => {
        const { texto } = aparencia(pressed);
        return (
          <>
            {carregando ? (
              <Girando cor={texto} />
            ) : icone ? (
              <Icone nome={icone} cor={texto} />
            ) : null}
            <View style={estilos.rotulo}>
              <Texto
                estilo="corpoForte"
                cor={texto}
                style={[
                  estilos.centro,
                  variante === 'terciario' && !desabilitado && estilos.sublinhado,
                ]}
              >
                {rotulo}
              </Texto>
            </View>
            {!carregando && iconeFim ? <Icone nome={iconeFim} cor={texto} /> : null}
          </>
        );
      }}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  larguraTotal: { alignSelf: 'stretch' },
  // O texto quebra linha com letra grande: nunca é cortado.
  rotulo: { flexShrink: 1 },
  centro: { textAlign: 'center' },
  sublinhado: { textDecorationLine: 'underline' },
});
