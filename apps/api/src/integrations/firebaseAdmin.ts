import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

import type { Ambiente } from '../config/env.js';

export interface ServicosFirebase {
  auth: Auth;
  db: Firestore;
}

/**
 * O .env guarda a chave com as quebras de linha escapadas ("\n" literal). Sem
 * converter de volta, o SDK falha com um erro de DECODER/PEM que não aponta a causa.
 */
export function normalizarChavePrivada(chave: string): string {
  return chave.replace(/\\n/g, '\n');
}

function usaEmulador(ambiente: Ambiente): boolean {
  return Boolean(ambiente.FIRESTORE_EMULATOR_HOST && ambiente.FIREBASE_AUTH_EMULATOR_HOST);
}

/** Inicializa o Admin SDK uma vez por projeto e reaproveita nas chamadas seguintes. */
export function inicializarFirebase(ambiente: Ambiente): ServicosFirebase {
  const nome = `saude-${ambiente.FIREBASE_PROJECT_ID}`;
  let app: App | undefined = getApps().find((existente) => existente.name === nome);

  if (!app) {
    if (usaEmulador(ambiente)) {
      // Emuladores não validam credencial: basta o projectId. Sem isto, a
      // google-auth-library procura credenciais no servidor de metadados da GCP.
      process.env.METADATA_SERVER_DETECTION ??= 'none';
      app = initializeApp({ projectId: ambiente.FIREBASE_PROJECT_ID }, nome);
    } else {
      app = initializeApp(
        {
          projectId: ambiente.FIREBASE_PROJECT_ID,
          credential: cert({
            projectId: ambiente.FIREBASE_PROJECT_ID,
            clientEmail: ambiente.FIREBASE_CLIENT_EMAIL,
            privateKey: normalizarChavePrivada(ambiente.FIREBASE_PRIVATE_KEY ?? ''),
          }),
        },
        nome,
      );
    }
    getFirestore(app).settings({ ignoreUndefinedProperties: true });
  }

  return { auth: getAuth(app), db: getFirestore(app) };
}
