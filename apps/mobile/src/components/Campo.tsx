import { forwardRef, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { useTema } from '@/hooks/useTema';
import { dataPorExtenso, mascararCpf, mascararData, mascararTelefone } from '@/utils/mascaras';

import { estiloFoco } from './foco';
import { Icone } from './Icone';
import { Texto } from './Texto';

type TipoCampo = 'texto' | 'email' | 'senha' | 'data' | 'cpf' | 'telefone' | 'busca';

export interface CampoProps extends Pick<
  TextInputProps,
  'autoComplete' | 'textContentType' | 'returnKeyType' | 'onSubmitEditing' | 'autoCapitalize'
> {
  /** Sempre visível acima do campo. Nunca placeholder no lugar de rótulo. */
  rotulo: string;
  /** Formato, exemplo ou por que pedimos. Fica entre o rótulo e a caixa. */
  ajuda?: string;
  /** Diz o que fazer. Aparece acima da caixa, com ícone e "Erro:" para leitor de tela. */
  erro?: string;
  tipo?: TipoCampo;
  valor: string;
  /** Recebe o valor já mascarado (CPF, data, telefone). */
  aoMudar: (valor: string) => void;
  /** Validação ao sair do campo (nunca a cada tecla). */
  aoSair?: () => void;
  desabilitado?: boolean;
  /** Passe false para escrever "(opcional)" ao lado do rótulo. */
  obrigatorio?: boolean;
}

const MASCARAS: Partial<Record<TipoCampo, (valor: string) => string>> = {
  cpf: mascararCpf,
  data: mascararData,
  telefone: mascararTelefone,
};

const TECLADO: Partial<Record<TipoCampo, TextInputProps['keyboardType']>> = {
  cpf: 'number-pad',
  data: 'number-pad',
  telefone: 'phone-pad',
  email: 'email-address',
};

const TAMANHO_MAXIMO: Partial<Record<TipoCampo, number>> = { cpf: 14, data: 10, telefone: 15 };

/** Campo do design system (design-system/components/Campo). */
export const Campo = forwardRef<TextInput, CampoProps>(function Campo(
  {
    rotulo,
    ajuda,
    erro,
    tipo = 'texto',
    valor,
    aoMudar,
    aoSair,
    desabilitado = false,
    obrigatorio = true,
    autoComplete,
    textContentType,
    returnKeyType,
    onSubmitEditing,
    autoCapitalize,
  },
  ref,
) {
  const { cores, tipo: tipografia, tamanho, espacamento, raio } = useTema();
  const [focado, setFocado] = useState(false);
  const [revelar, setRevelar] = useState(false);
  const extenso = tipo === 'data' ? dataPorExtenso(valor) : null;
  const mascarar = MASCARAS[tipo];

  const borda = erro
    ? { borderColor: cores.erro, borderWidth: tamanho.espessuraBorda + 1 }
    : desabilitado
      ? { borderColor: cores.textoSecundario, borderStyle: 'dashed' as const }
      : { borderColor: focado ? cores.primaria : cores.bordaCampo };

  return (
    <View style={{ gap: espacamento.espacamento8 }}>
      <Texto
        estilo="rotulo"
        cor="primariaEscura"
        accessibilityElementsHidden
        importantForAccessibility="no"
      >
        {rotulo}
        {obrigatorio ? null : (
          <Texto estilo="apoio" cor="textoSecundario">
            {' (opcional)'}
          </Texto>
        )}
      </Texto>

      {ajuda ? (
        <Texto estilo="apoio" cor="textoSecundario" importantForAccessibility="no">
          {ajuda}
        </Texto>
      ) : null}

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

      <View
        accessibilityRole={tipo === 'busca' ? 'search' : undefined}
        style={[
          estilos.caixa,
          {
            minHeight: tamanho.alturaCampo,
            paddingLeft: espacamento.espacamento24,
            paddingRight: espacamento.espacamento8,
            gap: espacamento.espacamento8,
            borderWidth: tamanho.espessuraBorda,
            borderRadius: raio.raioCampo,
            backgroundColor: desabilitado ? cores.teal50 : cores.superficie,
          },
          borda,
          focado && estiloFoco(cores, tamanho.espessuraFoco),
        ]}
      >
        {tipo === 'busca' ? (
          <View style={{ marginLeft: -espacamento.espacamento4 }}>
            <Icone nome="search" />
          </View>
        ) : null}
        <TextInput
          ref={ref}
          value={valor}
          onChangeText={(texto) => aoMudar(mascarar ? mascarar(texto) : texto)}
          onFocus={() => setFocado(true)}
          onBlur={() => {
            setFocado(false);
            aoSair?.();
          }}
          editable={!desabilitado}
          allowFontScaling
          accessibilityLabel={obrigatorio ? rotulo : `${rotulo} (opcional)`}
          accessibilityHint={ajuda}
          aria-disabled={desabilitado}
          aria-invalid={erro ? true : undefined}
          keyboardType={TECLADO[tipo] ?? 'default'}
          maxLength={TAMANHO_MAXIMO[tipo]}
          secureTextEntry={tipo === 'senha' && !revelar}
          autoCapitalize={
            autoCapitalize ??
            (tipo === 'email' || tipo === 'senha' || tipo === 'busca' ? 'none' : 'sentences')
          }
          autoCorrect={tipo === 'texto'}
          returnKeyType={returnKeyType ?? (tipo === 'busca' ? 'search' : undefined)}
          autoComplete={autoComplete}
          textContentType={textContentType}
          onSubmitEditing={onSubmitEditing}
          cursorColor={cores.primaria}
          selectionColor={cores.primaria}
          style={[
            estilos.flex,
            {
              paddingVertical: espacamento.espacamento12,
              fontFamily: tipografia.corpo.fontFamily,
              fontSize: tipografia.corpo.fontSize,
              color: desabilitado ? cores.textoSecundario : cores.texto,
            },
            // Some com o contorno padrão do navegador: o foco é a borda + sombraFoco.
            estilos.semContornoWeb,
          ]}
        />
        {tipo === 'busca' && valor ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpar busca"
            onPress={() => aoMudar('')}
            style={({ pressed }) => [
              estilos.linha,
              {
                minHeight: tamanho.alvoToqueMinimo,
                minWidth: tamanho.alvoToqueMinimo,
                paddingHorizontal: espacamento.espacamento12,
                gap: espacamento.espacamento4,
                borderRadius: raio.raioChip,
                justifyContent: 'center',
              },
              pressed && { backgroundColor: cores.teal50 },
            ]}
          >
            <Icone nome="x" />
            <Texto estilo="rotulo" cor="primaria" importantForAccessibility="no">
              Limpar
            </Texto>
          </Pressable>
        ) : null}
        {tipo === 'senha' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={revelar ? 'Ocultar' : 'Mostrar'}
            accessibilityHint={revelar ? 'Esconde a senha digitada' : 'Mostra a senha digitada'}
            aria-selected={revelar}
            aria-disabled={desabilitado}
            disabled={desabilitado}
            onPress={() => setRevelar((atual) => !atual)}
            style={({ pressed }) => [
              estilos.linha,
              {
                minHeight: tamanho.alvoToqueMinimo,
                minWidth: tamanho.alvoToqueMinimo,
                paddingHorizontal: espacamento.espacamento12,
                gap: espacamento.espacamento4,
                borderRadius: raio.raioChip,
                justifyContent: 'center',
              },
              pressed && { backgroundColor: cores.teal50 },
            ]}
          >
            <Icone nome={revelar ? 'eye-off' : 'eye'} />
            <Texto estilo="rotulo" cor="primaria">
              {revelar ? 'Ocultar' : 'Mostrar'}
            </Texto>
          </Pressable>
        ) : null}
      </View>

      {extenso ? (
        <View style={[estilos.linha, { gap: espacamento.espacamento8 }]}>
          <Icone nome="calendar-check" cor="primariaEscura" />
          <Texto
            estilo="apoio"
            cor="primariaEscura"
            style={{
              fontFamily: tipografia.corpoForte.fontFamily,
              fontWeight: tipografia.corpoForte.fontWeight,
            }}
          >
            {extenso}
          </Texto>
        </View>
      ) : null}
    </View>
  );
});

const estilos = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center' },
  caixa: { flexDirection: 'row', alignItems: 'center' },
  flex: { flex: 1, minWidth: 0 },
  semContornoWeb: { outlineStyle: 'none' } as object,
});
