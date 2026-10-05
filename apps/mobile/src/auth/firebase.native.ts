import AsyncStorage from '@react-native-async-storage/async-storage';
// getReactNativePersistence só existe nos tipos de React Native do Firebase:
// o tsconfig aponta @firebase/auth para eles (o pacote publica os da web primeiro).
import { getReactNativePersistence, initializeAuth, type Auth } from 'firebase/auth';

import { appFirebase, ligarEmuladorSeConfigurado } from './appFirebase';

// Android/iOS: getAuth sozinho guarda a sessão só na memória e a pessoa teria
// de entrar de novo toda vez que abrisse o app. initializeAuth com AsyncStorage
// mantém a sessão. Continua sendo só o módulo de autenticação.
let instancia: Auth | undefined;

export function obterAuth(): Auth {
  instancia ??= ligarEmuladorSeConfigurado(
    initializeAuth(appFirebase(), { persistence: getReactNativePersistence(AsyncStorage) }),
  );
  return instancia;
}
