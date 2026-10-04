export default function exigirEmulador(): void {
  const faltando = ['FIRESTORE_EMULATOR_HOST', 'FIREBASE_AUTH_EMULATOR_HOST'].filter(
    (chave) => !process.env[chave],
  );
  if (faltando.length > 0) {
    throw new Error(
      `Testes de integração precisam do Firebase Emulator Suite (faltam ${faltando.join(', ')}).\n` +
        'Rode na raiz do repositório: npm run test:emulador',
    );
  }
}
