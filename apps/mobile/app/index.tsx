import { StyleSheet, Text, View } from 'react-native';

import { useTema } from '@/hooks/useTema';

export default function Inicio() {
  const { cores, tipo, tamanho, espacamento } = useTema();

  return (
    <View
      style={[
        estilos.tela,
        { backgroundColor: cores.superficie, paddingHorizontal: tamanho.margemLateral },
      ]}
    >
      <Text
        accessibilityRole="header"
        accessibilityLabel="Saúde na Palma da Mão"
        style={[tipo.tituloTela, { color: cores.primariaEscura }]}
      >
        Saúde na Palma da Mão
      </Text>
      <Text
        accessibilityLabel="Pré-triagem, consultas e fila na palma da sua mão."
        style={[tipo.corpo, { color: cores.texto, marginTop: espacamento.espacamento8 }]}
      >
        Pré-triagem, consultas e fila na palma da sua mão.
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, justifyContent: 'center' },
});
