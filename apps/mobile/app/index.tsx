import { StyleSheet, Text, View } from 'react-native';

export default function Inicio() {
  return (
    <View style={estilos.tela}>
      <Text
        accessibilityRole="header"
        accessibilityLabel="Saúde na Palma da Mão"
        style={estilos.titulo}
      >
        Saúde na Palma da Mão
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  titulo: { fontSize: 32, lineHeight: 40, fontWeight: '700' },
});
