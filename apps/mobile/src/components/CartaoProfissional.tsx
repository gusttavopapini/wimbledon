import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { useTema } from '@/hooks/useTema';
import { focoVeioDoTeclado } from '@/utils/focoPorTeclado';

import { Avatar } from './Avatar';
import { estiloFoco } from './foco';
import { Icone } from './Icone';
import { Texto } from './Texto';

export interface CartaoProfissionalProps {
  /** Com "Dr." ou "Dra." */
  nome: string;
  especialidade: string;
  unidade: string;
  detalhe?: string;
  aoTocar: () => void;
}

/**
 * Cartão-botão de um profissional (design-system/components/CartaoProfissional).
 * O leitor de tela lê nome, especialidade e unidade, nessa ordem. Sem estrelas,
 * nota ou ranking: avaliação não existe neste produto.
 */
export function CartaoProfissional({
  nome,
  especialidade,
  unidade,
  detalhe,
  aoTocar,
}: CartaoProfissionalProps) {
  const { cores, espacamento, raio, tamanho } = useTema();
  const [focado, setFocado] = useState(false);
  const leitura = [nome, especialidade, unidade, detalhe].filter(Boolean).join(', ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={leitura}
      onPress={aoTocar}
      onFocus={() => setFocado(focoVeioDoTeclado())}
      onBlur={() => setFocado(false)}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: espacamento.espacamento16,
          minHeight: tamanho.alvoToqueMinimo,
          padding: espacamento.espacamento16,
          borderWidth: tamanho.espessuraBorda,
          borderColor: cores.contorno,
          borderRadius: raio.raioCartaoInterno,
          backgroundColor: pressed ? cores.teal50 : cores.superficie,
        },
        focado && estiloFoco(cores, tamanho.espessuraFoco),
      ]}
    >
      <Avatar nome={nome} tamanho={64} />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Texto estilo="corpoForte">{nome}</Texto>
        <Texto estilo="rotulo" cor="primaria">
          {especialidade}
        </Texto>
        <View
          style={{ flexDirection: 'row', gap: espacamento.espacamento4, alignItems: 'flex-start' }}
        >
          <Icone nome="map-pin" cor="textoSecundario" />
          <Texto estilo="apoio" cor="textoSecundario" style={{ flex: 1 }}>
            {unidade}
          </Texto>
        </View>
        {detalhe ? <Texto estilo="apoio">{detalhe}</Texto> : null}
      </View>
      <Icone nome="chevron-right" />
    </Pressable>
  );
}
