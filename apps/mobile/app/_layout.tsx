import { Heebo_400Regular } from '@expo-google-fonts/heebo/400Regular';
import { Heebo_700Bold } from '@expo-google-fonts/heebo/700Bold';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { criarQueryClient } from '@/api/consultas';
import { SessaoProvider } from '@/auth/SessaoProvider';
import { Botao } from '@/components/Botao';
import { Folha } from '@/components/Folha';
import { Mensagem } from '@/components/Mensagem';
import { Tela } from '@/components/Tela';
import { Topo } from '@/components/Topo';
import { useSessao } from '@/hooks/useSessao';
import { useTema } from '@/hooks/useTema';
import { TemaProvider } from '@/theme/TemaProvider';

// Segura a splash até a Heebo carregar e a sessão ser conhecida: sem isso a
// primeira tela pisca com a fonte do sistema ou mostra "Entrar" a quem já entrou.
void SplashScreen.preventAutoHideAsync();

export default function LayoutRaiz() {
  const [fontesCarregadas, erroFontes] = useFonts({ Heebo_400Regular, Heebo_700Bold });
  const [queryClient] = useState(criarQueryClient);

  // Se a fonte falhar, o app segue com a fonte do sistema em vez de travar na splash.
  if (!fontesCarregadas && !erroFontes) return null;

  return (
    <TemaProvider>
      <QueryClientProvider client={queryClient}>
        <SessaoProvider>
          <Navegacao />
        </SessaoProvider>
      </QueryClientProvider>
    </TemaProvider>
  );
}

function Navegacao() {
  const { cores } = useTema();
  const { estado, falha } = useSessao();
  const pronto = estado !== 'carregando' || falha !== null;

  useEffect(() => {
    if (pronto) void SplashScreen.hideAsync();
  }, [pronto]);

  if (!pronto) return null;
  if (falha) return <FalhaAoCarregarSessao />;

  return (
    <>
      {/* Toda tela começa no Topo (gradiente escuro ou preto): ícones claros. */}
      <StatusBar style="light" />
      <Stack
        screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.superficie } }}
      >
        {/* Quem entrou não vê as telas públicas; quem não entrou vai para Entrar. */}
        <Stack.Protected guard={estado === 'entrou'}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={estado === 'deslogado'}>
          <Stack.Screen name="(publico)" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

/** Logou no Firebase, mas a API não respondeu: diz o que fazer, sem sumir. */
function FalhaAoCarregarSessao() {
  const { falha, tentarDeNovo, sair } = useSessao();
  return (
    <Tela>
      <Topo titulo="Olá!" subtitulo="Que bom ter você aqui." />
      <Folha>
        <Mensagem tipo="erro" titulo="Não conseguimos carregar sua conta">
          {falha?.message}
        </Mensagem>
        <Botao principal aoTocar={tentarDeNovo}>
          Tentar de novo
        </Botao>
        <Botao variante="secundario" larguraTotal aoTocar={() => void sair()}>
          Sair da conta
        </Botao>
      </Folha>
    </Tela>
  );
}
