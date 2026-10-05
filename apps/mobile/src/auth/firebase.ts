import { getAuth, type Auth } from 'firebase/auth';

import { appFirebase, ligarEmuladorSeConfigurado } from './appFirebase';

// Web (PWA): getAuth já guarda a sessão no navegador.
let instancia: Auth | undefined;

export function obterAuth(): Auth {
  instancia ??= ligarEmuladorSeConfigurado(getAuth(appFirebase()));
  return instancia;
}
