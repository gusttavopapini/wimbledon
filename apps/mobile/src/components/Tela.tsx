import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTema } from '@/hooks/useTema';

/** Tela rolável que sobe com o teclado. Nada de altura fixa: o conteúdo cresce. */
export function Tela({ children }: { children: ReactNode }) {
  const { cores } = useTema();
  const { bottom } = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={[estilos.flex, { backgroundColor: cores.superficie }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={estilos.flex}
        contentContainerStyle={[estilos.conteudo, { paddingBottom: bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  conteudo: { flexGrow: 1 },
});
