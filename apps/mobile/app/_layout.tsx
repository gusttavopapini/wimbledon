import { Heebo_400Regular } from '@expo-google-fonts/heebo/400Regular';
import { Heebo_700Bold } from '@expo-google-fonts/heebo/700Bold';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { useTema } from '@/hooks/useTema';
import { TemaProvider } from '@/theme/TemaProvider';

// Segura a splash até a Heebo carregar: sem isso a primeira tela pisca com a
// fonte do sistema e muda de tamanho.
void SplashScreen.preventAutoHideAsync();

export default function LayoutRaiz() {
  const [fontesCarregadas, erroFontes] = useFonts({ Heebo_400Regular, Heebo_700Bold });
  const pronto = fontesCarregadas || Boolean(erroFontes);

  useEffect(() => {
    if (pronto) void SplashScreen.hideAsync();
  }, [pronto]);

  // Se a fonte falhar, o app segue com a fonte do sistema em vez de travar na splash.
  if (!pronto) return null;

  return (
    <TemaProvider>
      <Navegacao />
    </TemaProvider>
  );
}

function Navegacao() {
  const { cores, modo } = useTema();
  return (
    <>
      <StatusBar style={modo === 'altoContraste' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.superficie } }}
      />
    </>
  );
}
