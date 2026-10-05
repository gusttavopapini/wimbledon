import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useEscalaTexto } from '@/hooks/useEscalaTexto';
import { useTema } from '@/hooks/useTema';
import { focoVeioDoTeclado } from '@/utils/focoPorTeclado';

import { estiloFoco } from './foco';
import { Icone, type NomeIcone } from './Icone';
import { Texto } from './Texto';

export type Destino = 'inicio' | 'consultas' | 'perfil' | 'ajustes';

const DESTINOS: { id: Destino; rotulo: string; icone: NomeIcone }[] = [
  { id: 'inicio', rotulo: 'Início', icone: 'house' },
  { id: 'consultas', rotulo: 'Consultas', icone: 'calendar' },
  { id: 'perfil', rotulo: 'Meu perfil', icone: 'user-round' },
  { id: 'ajustes', rotulo: 'Ajustes', icone: 'settings' },
];

export interface NavegacaoInferiorProps {
  ativo: Destino | null;
  aoNavegar: (destino: Destino) => void;
}

/**
 * Barra inferior com 4 destinos fixos (design-system/components/NavegacaoInferior).
 * O ativo tem quatro sinais juntos: cor, negrito, fundo teal50 e uma marca de
 * 4px no alto; no alto contraste, amarelo com contorno. Com fonte muito grande
 * vira duas linhas de dois itens; nunca rola para o lado nem corta o rótulo.
 */
export function NavegacaoInferior({ ativo, aoNavegar }: NavegacaoInferiorProps) {
  const { cores, espacamento, raio, sombras } = useTema();
  const { navegacaoEmDuasLinhas } = useEscalaTexto();
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      style={{
        paddingHorizontal: espacamento.espacamento8,
        paddingBottom: espacamento.espacamento16 + bottom,
        paddingTop: espacamento.espacamento8,
        backgroundColor: cores.superficie,
      }}
    >
      <View
        accessibilityRole="tablist"
        accessibilityLabel="Navegação principal"
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: espacamento.espacamento4,
          padding: espacamento.espacamento4,
          borderRadius: raio.raioCartao,
          backgroundColor: cores.superficie,
          ...sombras.sombraNavegacao,
        }}
      >
        {DESTINOS.map((destino) => (
          <ItemComFoco
            key={destino.id}
            rotulo={destino.rotulo}
            icone={destino.icone}
            selecionado={destino.id === ativo}
            duasLinhas={navegacaoEmDuasLinhas}
            aoTocar={() => aoNavegar(destino.id)}
          />
        ))}
      </View>
    </View>
  );
}

function ItemComFoco({
  rotulo,
  icone,
  selecionado,
  duasLinhas,
  aoTocar,
}: {
  rotulo: string;
  icone: NomeIcone;
  selecionado: boolean;
  duasLinhas: boolean;
  aoTocar: () => void;
}) {
  const { cores, espacamento, raio, tamanho, tipo, modo } = useTema();
  const [focado, setFocado] = useState(false);
  const altoContraste = modo === 'altoContraste';
  const corAtiva = altoContraste ? 'primaria' : 'primariaEscura';

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityLabel={rotulo}
      aria-selected={selecionado}
      onPress={aoTocar}
      onFocus={() => setFocado(focoVeioDoTeclado())}
      onBlur={() => setFocado(false)}
      style={({ pressed }) => [
        {
          flexGrow: 1,
          flexBasis: duasLinhas ? '45%' : 0,
          minWidth: tamanho.alvoToqueMinimo,
          minHeight: 72,
          alignItems: 'center',
          justifyContent: 'center',
          gap: espacamento.espacamento4,
          paddingTop: espacamento.espacamento12,
          paddingHorizontal: espacamento.espacamento4,
          paddingBottom: espacamento.espacamento8,
          borderRadius: raio.raioCartaoInterno,
          backgroundColor: selecionado || pressed ? cores.teal50 : 'transparent',
        },
        selecionado &&
          altoContraste && { borderWidth: tamanho.espessuraBorda, borderColor: cores.primaria },
        focado && estiloFoco(cores, tamanho.espessuraFoco),
      ]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={{
          position: 'absolute',
          top: espacamento.espacamento4,
          width: espacamento.espacamento32,
          height: espacamento.espacamento4,
          borderRadius: 2,
          backgroundColor: selecionado ? cores[corAtiva] : 'transparent',
        }}
      />
      <Icone
        nome={icone}
        tamanho={tamanho.tamanhoIconeNavegacao}
        espessura={selecionado ? 2.5 : 2}
        cor={selecionado ? corAtiva : 'textoSecundario'}
      />
      <Texto
        estilo={selecionado ? 'rotulo' : 'apoio'}
        cor={selecionado ? corAtiva : 'textoSecundario'}
        style={{ textAlign: 'center', lineHeight: Math.round(tipo.apoio.fontSize * 1.25) }}
      >
        {rotulo}
      </Texto>
    </Pressable>
  );
}
