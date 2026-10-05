const projeto = () => process.env.FIREBASE_PROJECT_ID ?? 'demo-saude-palma';
const hostAuth = () => process.env.FIREBASE_AUTH_EMULATOR_HOST ?? '127.0.0.1:9099';
const hostFirestore = () => process.env.FIRESTORE_EMULATOR_HOST ?? '127.0.0.1:8080';

/** Apaga todos os documentos e todas as contas dos emuladores. */
export async function limparEmuladores(): Promise<void> {
  await Promise.all([
    fetch(
      `http://${hostFirestore()}/emulator/v1/projects/${projeto()}/databases/(default)/documents`,
      { method: 'DELETE' },
    ),
    fetch(`http://${hostAuth()}/emulator/v1/projects/${projeto()}/accounts`, { method: 'DELETE' }),
  ]);
}

/** Faz login no emulador do Auth como o app faria e devolve o ID token. */
export async function entrar(email: string, senha: string): Promise<string> {
  const resposta = await fetch(
    `http://${hostAuth()}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=chave-falsa`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: senha, returnSecureToken: true }),
    },
  );
  const corpo = (await resposta.json()) as { idToken?: string; error?: unknown };
  if (!corpo.idToken) throw new Error(`Login no emulador falhou: ${JSON.stringify(corpo.error)}`);
  return corpo.idToken;
}
