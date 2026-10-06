// Variáveis EXPO_PUBLIC_* são embutidas no pacote do app: são públicas.
// O acesso precisa ser literal (process.env.EXPO_PUBLIC_X) para o Expo substituir.

import Constants from 'expo-constants';
import { Platform } from 'react-native';

const API_PADRAO = 'http://localhost:3333/api/v1';

/** Um endereço que só existe dentro da própria máquina que roda o código. */
function ehEnderecoLocal(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(url);
}

/**
 * IP do computador que está servindo o Expo, como o aparelho o enxerga
 * (ex.: "192.168.0.15"). É o mesmo computador que roda a API em desenvolvimento.
 */
function hostDoServidorExpo(): string | null {
  const constantes = Constants as unknown as {
    expoConfig?: { hostUri?: string } | null;
    expoGoConfig?: { debuggerHost?: string } | null;
  };
  const uri = constantes.expoConfig?.hostUri ?? constantes.expoGoConfig?.debuggerHost ?? null;
  if (!uri) return null;
  const host = uri.split('/')[0]?.split(':')[0]?.trim();
  return host ? host : null;
}

/**
 * Em celular, "localhost" é o próprio aparelho — não o computador que roda a
 * API. Quando a URL configurada aponta para a máquina local, troca só o host
 * pelo IP do servidor do Expo, mantendo porta e caminho. Assim cada pessoa da
 * equipe roda em qualquer rede sem editar o .env, e um endereço público
 * (Render, em produção) é sempre respeitado como está.
 */
function resolverApiUrl(): string {
  const configurada = process.env.EXPO_PUBLIC_API_URL?.trim() || API_PADRAO;

  // Na web o navegador roda no mesmo computador da API: localhost funciona.
  if (Platform.OS === 'web' || !ehEnderecoLocal(configurada)) return configurada;

  const host = hostDoServidorExpo();
  if (!host) return configurada;

  return configurada.replace(/^(https?:\/\/)([^/:]+)/i, `$1${host}`);
}

export const ambiente = {
  apiUrl: resolverApiUrl(),
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  },
  /** Só em desenvolvimento: "127.0.0.1:9099" liga o app ao emulador do Auth. */
  authEmulador: process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST ?? '',
};
