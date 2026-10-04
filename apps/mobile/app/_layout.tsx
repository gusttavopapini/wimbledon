import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function LayoutRaiz() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
