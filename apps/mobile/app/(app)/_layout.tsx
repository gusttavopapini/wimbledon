import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/tabs';

import { NavegacaoInferior, type Destino } from '@/components/NavegacaoInferior';
import { useTema } from '@/hooks/useTema';

const ROTA_DO_DESTINO: Record<Destino, string> = {
  inicio: 'index',
  consultas: 'consultas',
  perfil: 'perfil',
  ajustes: 'ajustes',
};

/** As telas do fluxo de marcar consulta pertencem ao Início. */
function destinoDaRota(nome: string): Destino {
  if (nome === 'consultas' || nome === 'perfil' || nome === 'ajustes') return nome;
  return 'inicio';
}

function Barra({ state, navigation }: BottomTabBarProps) {
  const atual = state.routes[state.index]?.name ?? 'index';
  return (
    <NavegacaoInferior
      ativo={destinoDaRota(atual)}
      aoNavegar={(destino) => navigation.navigate(ROTA_DO_DESTINO[destino])}
    />
  );
}

/**
 * Navegação inferior com 4 destinos. As telas de especialidades, unidades e
 * médicos ficam fora da barra (href: null) e voltam pelo histórico.
 */
export default function LayoutApp() {
  const { cores } = useTema();
  return (
    <Tabs
      tabBar={(props) => <Barra {...props} />}
      backBehavior="history"
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: cores.superficie } }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="consultas" />
      <Tabs.Screen name="perfil" />
      <Tabs.Screen name="ajustes" />
      <Tabs.Screen name="especialidades" options={{ href: null }} />
      <Tabs.Screen name="especialidades/[id]/unidades" options={{ href: null }} />
      <Tabs.Screen name="unidades/[id]/medicos" options={{ href: null }} />
    </Tabs>
  );
}
