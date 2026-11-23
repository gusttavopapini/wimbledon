import { Stack } from 'expo-router';

import { useTema } from '@/hooks/useTema';

export default function Layout() {
  const { cores } = useTema();
  return (
    <Stack
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.superficie } }}
    />
  );
}
