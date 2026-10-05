#!/usr/bin/env node
// Hook PreToolUse (Write|Edit|MultiEdit): impede que um agente importe o SDK
// do Firestore em apps/mobile (app, PWA e painel de TV). O cliente usa o
// Firebase JS SDK só para login; todo dado passa pela API (ver AGENTS.md).
// O ESLint também bloqueia, mas este hook avisa o agente antes de gravar.

import path from 'node:path';

const IMPORT_FIRESTORE =
  /(?:\bfrom\s*|\bimport\s*\(\s*|\brequire\s*\(\s*|\bimport\s+)['"]@?firebase\/firestore\b/;

let entrada = '';
for await (const pedaco of process.stdin) entrada += pedaco;

let evento;
try {
  evento = JSON.parse(entrada);
} catch {
  process.exit(0);
}

const { tool_input: dados = {} } = evento;
const raiz = process.env.CLAUDE_PROJECT_DIR ?? evento.cwd ?? process.cwd();
const relativo = path.relative(raiz, path.resolve(raiz, dados.file_path ?? ''));

if (!relativo.split(path.sep).join('/').startsWith('apps/mobile/')) process.exit(0);

const textos = [dados.content, dados.new_string, ...(dados.edits ?? []).map((e) => e.new_string)];

if (textos.some((texto) => typeof texto === 'string' && IMPORT_FIRESTORE.test(texto))) {
  process.stderr.write(
    `Bloqueado: ${relativo} importa firebase/firestore. Em apps/mobile o Firebase JS SDK ` +
      'serve só para login (Firebase Auth). Busque e grave dados pela API REST ' +
      '(Axios + TanStack Query); o Firestore é acessado apenas pela API via Admin SDK.\n',
  );
  process.exit(2);
}
