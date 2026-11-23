/**
 * Seed completo: a primeira conta administrativa e os cadastros base fictícios.
 *
 *   npm run seed -- --emulador   # Firebase Emulator Suite local
 *   npm run seed                 # projeto real (lê o .env)
 */
import { carregarAmbiente } from '../../apps/api/src/config/env.js';
import { inicializarFirebase } from '../../apps/api/src/integrations/firebaseAdmin.js';
import { criarCadastrosBase } from './cadastros-base.js';
import { executarSeedAdministrador } from './criar-administrador.js';
import { criarDemo, SENHA_DEMO_PADRAO } from './demo.js';

const EMULADOR = {
  FIREBASE_PROJECT_ID: 'demo-saude-palma',
  FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
  FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
};

async function principal(): Promise<void> {
  const noEmulador = process.argv.includes('--emulador');
  if (noEmulador) Object.assign(process.env, EMULADOR);
  const ambiente = carregarAmbiente();
  const firebase = inicializarFirebase(ambiente);

  // Sem ADMIN_EMAIL, a conta administrativa de demonstração (abaixo) cumpre o papel.
  if (noEmulador || process.env.ADMIN_EMAIL) {
    await executarSeedAdministrador(firebase, ambiente.FIREBASE_PROJECT_ID, noEmulador);
  }

  const r = await criarCadastrosBase(firebase);
  console.log('Cadastros base (dados fictícios):');
  console.log(
    `  especialidades: ${r.especialidades.criadas} criadas, ${r.especialidades.existentes} já existiam`,
  );
  console.log(
    `  unidades:       ${r.unidades.criadas} criadas, ${r.unidades.existentes} já existiam`,
  );
  console.log(
    `  médicos:        ${r.medicos.criados} criados, ${r.medicos.existentes} já existiam`,
  );

  if (!process.argv.includes('--sem-demo')) {
    const senha = process.env.SENHA_DEMO ?? SENHA_DEMO_PADRAO;
    const d = await criarDemo(firebase, senha);
    console.log(
      `Demonstração: ${d.consultorios} consultórios e ${d.janelas} janelas de agenda criados.`,
    );
    console.log(`Contas de teste (senha: ${senha}):`);
    for (const linha of d.linhas) console.log(linha);
  }
}

principal().catch((erro: unknown) => {
  console.error(erro instanceof Error ? erro.message : erro);
  process.exit(1);
});
