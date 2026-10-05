import { useState } from 'react';
import { Pressable, View } from 'react-native';

import type { Unidade } from '@/api/cadastros';
import { useTema } from '@/hooks/useTema';
import { focoVeioDoTeclado } from '@/utils/focoPorTeclado';

import { estiloFoco } from './foco';
import { Icone } from './Icone';
import { Texto } from './Texto';

const TIPO: Record<Unidade['tipo'], string> = { hospital: 'Hospital', clinica: 'Clínica' };

export function enderecoLegivel(unidade: Unidade): string {
  const { logradouro, numero, bairro, cidade } = unidade.endereco;
  return `${logradouro}, ${numero}, ${bairro}, ${cidade}`;
}

/**
 * Adição ao design system: o Cartao interno (16px, contorno de 2px) como botão,
 * do mesmo jeito que o CartaoProfissional. O cartão inteiro é o alvo de toque.
 */
export function CartaoUnidade({ unidade, aoTocar }: { unidade: Unidade; aoTocar: () => void }) {
  const { cores, espacamento, raio, tamanho } = useTema();
  const [focado, setFocado] = useState(false);
  const tipoEBairro = `${TIPO[unidade.tipo]} · ${unidade.endereco.bairro}`;
  const endereco = enderecoLegivel(unidade);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${unidade.nome}, ${TIPO[unidade.tipo]} no bairro ${unidade.endereco.bairro}, ${endereco}`}
      onPress={aoTocar}
      onFocus={() => setFocado(focoVeioDoTeclado())}
      onBlur={() => setFocado(false)}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: espacamento.espacamento12,
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
      <View style={{ flex: 1, minWidth: 0, gap: espacamento.espacamento4 }}>
        <Texto estilo="corpoForte">{unidade.nome}</Texto>
        <Texto estilo="rotulo" cor="primaria">
          {tipoEBairro}
        </Texto>
        <View
          style={{ flexDirection: 'row', gap: espacamento.espacamento4, alignItems: 'flex-start' }}
        >
          <Icone nome="map-pin" cor="textoSecundario" />
          <Texto estilo="apoio" cor="textoSecundario" style={{ flex: 1 }}>
            {endereco}
          </Texto>
        </View>
      </View>
      <Icone nome="chevron-right" />
    </Pressable>
  );
}
