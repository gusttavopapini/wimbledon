// Prepara o projeto Firebase para o app rodar, usando a conta de serviço do .env
// (não precisa de "firebase login"):
//   1. liga o login por e-mail e senha no Firebase Auth;
//   2. cria os índices compostos do Firestore (infra/firestore.indexes.json) e espera ficarem prontos;
//   3. publica as regras do Firestore (infra/firestore.rules: nenhum cliente acessa o banco).
// Uso: node --env-file=.env scripts/preparar-firebase.mjs
import { readFileSync } from 'node:fs';

import { cert } from 'firebase-admin/app';

const projeto = process.env.FIREBASE_PROJECT_ID;
const email = process.env.FIREBASE_CLIENT_EMAIL;
const chave = (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
if (!projeto || !email || !chave) {
  console.error(
    'Faltam FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL ou FIREBASE_PRIVATE_KEY no .env.',
  );
  process.exit(1);
}

const { access_token: token } = await cert({
  projectId: projeto,
  clientEmail: email,
  privateKey: chave,
}).getAccessToken();

async function chamar(metodo, url, corpo) {
  const r = await fetch(url, {
    method: metodo,
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: corpo ? JSON.stringify(corpo) : undefined,
  });
  const texto = await r.text();
  let json = {};
  try {
    json = texto ? JSON.parse(texto) : {};
  } catch {
    json = { texto };
  }
  return { status: r.status, json };
}

const console_ = `https://console.firebase.google.com/project/${projeto}`;
let tudoCerto = true;

// 1) Login por e-mail e senha
{
  const r = await chamar(
    'PATCH',
    `https://identitytoolkit.googleapis.com/admin/v2/projects/${projeto}/config?updateMask=signIn.email.enabled,signIn.email.passwordRequired`,
    { signIn: { email: { enabled: true, passwordRequired: true } } },
  );
  if (r.status === 200) console.log('✔ Login por e-mail e senha ligado no Firebase Auth.');
  else {
    tudoCerto = false;
    console.log(
      `✖ Não consegui ligar o login por e-mail (${r.status}). Ligue à mão em ${console_}/authentication/providers`,
    );
  }
}

// 2) Índices compostos
const { indexes } = JSON.parse(
  readFileSync(new URL('../infra/firestore.indexes.json', import.meta.url), 'utf8'),
);
const base = `https://firestore.googleapis.com/v1/projects/${projeto}/databases/(default)/collectionGroups`;
let criados = 0;
for (const indice of indexes) {
  const r = await chamar('POST', `${base}/${indice.collectionGroup}/indexes`, {
    queryScope: indice.queryScope,
    fields: indice.fields,
  });
  if (r.status === 200) criados++;
  else if (r.status !== 409) {
    tudoCerto = false;
    console.log(
      `✖ Índice de ${indice.collectionGroup} (${r.status}): ${r.json?.error?.message ?? ''}`,
    );
    if (r.status === 404)
      console.log(
        `  Crie o banco Firestore em ${console_}/firestore (modo produção, região southamerica-east1).`,
      );
  }
}
console.log(
  `✔ Índices do Firestore: ${criados} criados agora, ${indexes.length - criados} já existiam.`,
);

// Espera os índices ficarem prontos (o Firestore leva alguns minutos para montar).
for (let tentativa = 0; tentativa < 60; tentativa++) {
  const r = await chamar('GET', `${base}/-/indexes?pageSize=200`);
  const pendentes = (r.json.indexes ?? []).filter((i) => i.state && i.state !== 'READY').length;
  if (r.status !== 200 || pendentes === 0) break;
  if (tentativa === 0) process.stdout.write('… Montando os índices (pode levar alguns minutos)');
  process.stdout.write('.');
  await new Promise((ok) => setTimeout(ok, 10_000));
}
console.log('\n✔ Índices prontos.');

// 3) Regras do Firestore
{
  const fonte = readFileSync(new URL('../infra/firestore.rules', import.meta.url), 'utf8');
  const rules = `https://firebaserules.googleapis.com/v1/projects/${projeto}`;
  const rs = await chamar('POST', `${rules}/rulesets`, {
    source: { files: [{ name: 'firestore.rules', content: fonte }] },
  });
  if (rs.status !== 200) {
    tudoCerto = false;
    console.log(`✖ Não consegui publicar as regras (${rs.status}). Não impede o app de funcionar.`);
  } else {
    const nome = `projects/${projeto}/releases/cloud.firestore`;
    let rel = await chamar('PATCH', `${rules}/releases/cloud.firestore`, {
      release: { name: nome, rulesetName: rs.json.name },
    });
    if (rel.status === 404)
      rel = await chamar('POST', `${rules}/releases`, { name: nome, rulesetName: rs.json.name });
    console.log(
      rel.status === 200
        ? '✔ Regras do Firestore publicadas.'
        : `✖ Regras não publicadas (${rel.status}).`,
    );
  }
}

process.exit(tudoCerto ? 0 : 2);
