import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, type Auth } from 'firebase/auth';

import { ambiente } from '@/ambiente';

// O Firebase JS SDK serve SÓ para o login (firebase/auth). Dados vêm da API:
// nunca importe firebase/firestore no app (o ESLint bloqueia).

export function appFirebase(): FirebaseApp {
  return getApps().length ? getApp() : initializeApp(ambiente.firebase);
}

export function ligarEmuladorSeConfigurado(auth: Auth): Auth {
  if (ambiente.authEmulador) {
    connectAuthEmulator(auth, `http://${ambiente.authEmulador}`, { disableWarnings: true });
  }
  return auth;
}
