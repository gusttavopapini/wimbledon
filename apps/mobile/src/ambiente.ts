import Constants from 'expo-constants';
import { Platform } from 'react-native';

import { resolverApiUrl } from './utils/apiUrl';

// Variáveis EXPO_PUBLIC_* são embutidas no pacote do app: são públicas.
// O acesso precisa ser literal (process.env.EXPO_PUBLIC_X) para o Expo substituir.

export const ambiente = {
  apiUrl: resolverApiUrl(
    process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333/api/v1',
    Constants.expoConfig?.hostUri,
    Platform.OS,
  ),
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  },
  /** "tv" no build do painel (Android TV): o app abre direto no painel. */
  modoTv: process.env.EXPO_PUBLIC_MODO === 'tv',
  /** Só em desenvolvimento: "127.0.0.1:9099" liga o app ao emulador do Auth. */
  authEmulador: process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST ?? '',
};
