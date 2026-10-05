import { Children, useState, type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { useEscalaTexto } from '@/hooks/useEscalaTexto';
import { useTema } from '@/hooks/useTema';
import { focoVeioDoTeclado } from '@/utils/focoPorTeclado';

import { estiloFoco } from './foco';
import { Icone } from './Icone';
import { IconeEspecialidade } from './IconeEspecialidade';
import { Texto } from './Texto';

export interface CartaoEspecialidadeProps {
  /** Id da especialidade (nome do ícone). */
  especialidade: string;
  /** Nome completo e correto: "Gastroenterologia", nunca abreviado. */
  nome: string;
  aoTocar: () => void;
}

/**
 * Botão com o ícone num círculo de 88px e o nome embaixo
 * (design-system/components/CartaoEspecialidade). Com letra grande ou fonte
 * acima de ~120% vira linha de lista com contorno e seta; perto de 200% o
 * círculo sai para o nome caber inteiro.
 */
export function CartaoEspecialidade({ especialidade, nome, aoTocar }: CartaoEspecialidadeProps) {
  const { cores, espacamento, raio, tamanho, tipo } = useTema();
  const { gradeViraLista: lista, semCirculo } = useEscalaTexto();
  const [focado, setFocado] = useState(false);
  const circulo = lista ? 64 : tamanho.circuloEspecialidade;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={nome}
      onPress={aoTocar}
      onFocus={() => setFocado(focoVeioDoTeclado())}
      onBlur={() => setFocado(false)}
      style={({ pressed }) => [
        {
          flex: 1,
          alignItems: 'center',
          borderWidth: tamanho.espessuraBorda,
          borderRadius: raio.raioCartaoInterno,
          minHeight: tamanho.alvoToqueMinimo,
        },
        lista
          ? {
              flexDirection: 'row',
              gap: espacamento.espacamento16,
              paddingVertical: espacamento.espacamento12,
              paddingHorizontal: espacamento.espacamento16,
              borderColor: cores.contorno,
              backgroundColor: pressed ? cores.teal50 : cores.superficie,
            }
          : {
              flexDirection: 'column',
              gap: espacamento.espacamento8,
              paddingTop: espacamento.espacamento8,
              paddingHorizontal: espacamento.espacamento4,
              paddingBottom: espacamento.espacamento12,
              borderColor: 'transparent',
              backgroundColor: pressed ? cores.teal50 : 'transparent',
            },
        focado && estiloFoco(cores, tamanho.espessuraFoco),
      ]}
    >
      {semCirculo ? null : (
        <View
          style={{
            width: circulo,
            height: circulo,
            borderRadius: circulo / 2,
            backgroundColor: cores.teal50,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconeEspecialidade especialidade={especialidade} tamanho={lista ? 40 : 48} />
        </View>
      )}
      <Texto
        estilo="corpoForte"
        cor="primariaEscura"
        style={[
          // Como no design system: tamanho do corpo com a altura de linha do rótulo.
          { lineHeight: tipo.rotulo.lineHeight },
          lista ? { flex: 1, textAlign: 'left' } : { textAlign: 'center', maxWidth: '100%' },
        ]}
      >
        {nome}
      </Texto>
      {lista ? <Icone nome="chevron-right" /> : null}
    </Pressable>
  );
}

/**
 * Grade de 2 colunas (três não cabem: "Gastroenterologia" em 18px negrito
 * precisa de ~160px). Vira lista de uma coluna junto com os cartões.
 */
export function GradeEspecialidades({ children }: { children: ReactNode }) {
  const { espacamento, tamanho } = useTema();
  const { gradeViraLista: lista } = useEscalaTexto();
  const itens = Children.toArray(children);
  const meio = tamanho.respiroEntreAlvos / 2;

  return (
    <View
      role="list"
      style={
        lista
          ? { gap: tamanho.respiroEntreAlvos }
          : {
              flexDirection: 'row',
              flexWrap: 'wrap',
              marginHorizontal: -meio,
              rowGap: espacamento.espacamento16,
            }
      }
    >
      {itens.map((item, i) => (
        <View
          key={i}
          role="listitem"
          style={
            lista ? undefined : { width: '50%', paddingHorizontal: meio, flexDirection: 'row' }
          }
        >
          {item}
        </View>
      ))}
    </View>
  );
}
