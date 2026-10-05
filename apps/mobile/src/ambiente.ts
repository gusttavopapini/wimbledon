// Variáveis EXPO_PUBLIC_* são embutidas no pacote do app: são públicas.
// O acesso precisa ser literal (process.env.EXPO_PUBLIC_X) para o Expo substituir.

export const ambiente = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3333/api/v1',
  firebase: {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  },
  /** Só em desenvolvimento: "127.0.0.1:9099" liga o app ao emulador do Auth. */
  authEmulador: process.env.EXPO_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST ?? '',
};
