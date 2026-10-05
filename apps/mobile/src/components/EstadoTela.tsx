import { useEffect, useState } from 'react';
import { Animated, Easing, View } from 'react-native';

import { useReduzirMovimento } from '@/hooks/useReduzirMovimento';
import { useTema } from '@/hooks/useTema';

import { Botao } from './Botao';
import { Icone, type NomeIcone } from './Icone';
import { Texto } from './Texto';

type TipoEstado = 'carregando' | 'vazio' | 'erro';

const PADRAO: Record<
  TipoEstado,
  { icone: NomeIcone; titulo: string; mensagem: string; acao?: string }
> = {
  carregando: {
    icone: 'loader-circle',
    titulo: 'Carregando suas consultas',
    mensagem: 'Isso pode levar alguns segundos. Não precisa fazer nada.',
  },
  vazio: {
    icone: 'calendar',
    titulo: 'Você ainda não tem consultas marcadas',
    mensagem: 'Quando você marcar uma consulta, ela aparece aqui com o dia, a hora e o endereço.',
    acao: 'Marcar consulta',
  },
  erro: {
    icone: 'wifi-off',
    titulo: 'Não conseguimos carregar suas consultas',
    mensagem:
      'Confira se o celular está conectado à internet e toque em Tentar de novo. Suas consultas continuam marcadas.',
    acao: 'Tentar de novo',
  },
};

export interface EstadoTelaProps {
  tipo: TipoEstado;
  /** Diga o que carrega: "Carregando as especialidades", nunca só "Carregando…". */
  titulo?: string;
  mensagem?: string;
  icone?: NomeIcone;
  /** Vazio e erro mostram um botão principal com este texto. */
  rotuloAcao?: string;
  aoAgir?: () => void;
}

/** Estado de tela para carregando, vazio e erro (design-system/components/EstadoTela). */
export function EstadoTela({ tipo, titulo, mensagem, icone, rotuloAcao, aoAgir }: EstadoTelaProps) {
  const { cores, espacamento, tamanho } = useTema();
  const padrao = PADRAO[tipo];
  const acao = rotuloAcao ?? padrao.acao;
  const tituloFinal = titulo ?? padrao.titulo;

  return (
    <View
      accessibilityRole={tipo === 'erro' ? 'alert' : 'summary'}
      accessibilityLiveRegion="polite"
      aria-busy={tipo === 'carregando'}
      style={{
        alignItems: 'center',
        gap: espacamento.espacamento16,
        paddingVertical: espacamento.espacamento32,
        paddingHorizontal: espacamento.espacamento24,
      }}
    >
      <View
        style={{
          width: tamanho.circuloEspecialidade,
          height: tamanho.circuloEspecialidade,
          borderRadius: tamanho.circuloEspecialidade / 2,
          backgroundColor: cores.teal50,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {tipo === 'carregando' ? (
          <IconeGirando nome={icone ?? padrao.icone} />
        ) : (
          <Icone
            nome={icone ?? padrao.icone}
            tamanho={44}
            cor={tipo === 'erro' ? 'erro' : 'primaria'}
          />
        )}
      </View>
      <Texto
        estilo="tituloSecao"
        cor="primariaEscura"
        accessibilityRole="header"
        style={{ textAlign: 'center' }}
      >
        {tituloFinal}
      </Texto>
      <Texto style={{ textAlign: 'center', maxWidth: 576 }}>{mensagem ?? padrao.mensagem}</Texto>
      {acao && tipo !== 'carregando' && aoAgir ? (
        <View style={{ alignSelf: 'stretch', marginTop: espacamento.espacamento8 }}>
          <Botao
            principal
            icone={tipo === 'erro' ? 'refresh-cw' : 'calendar-plus'}
            aoTocar={aoAgir}
          >
            {acao}
          </Botao>
        </View>
      ) : null}
    </View>
  );
}

/** Gira devagar (1,2 s por volta) e para se o sistema pedir menos movimento. */
function IconeGirando({ nome }: { nome: NomeIcone }) {
  const reduzir = useReduzirMovimento();
  const [giro] = useState(() => new Animated.Value(0));
  const [rotate] = useState(() =>
    giro.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }),
  );
  useEffect(() => {
    if (reduzir) return;
    const animacao = Animated.loop(
      Animated.timing(giro, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animacao.start();
    return () => animacao.stop();
  }, [giro, reduzir]);
  return (
    <Animated.View style={reduzir ? undefined : { transform: [{ rotate }] }}>
      <Icone nome={nome} tamanho={44} />
    </Animated.View>
  );
}
