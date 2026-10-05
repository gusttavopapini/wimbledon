import { Stack } from 'expo-router';

export const unstable_settings = { initialRouteName: 'entrar' };

export default function LayoutPublico() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
