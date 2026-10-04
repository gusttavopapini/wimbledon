import { readFileSync } from 'node:fs';

// src/config e dist/config ficam no mesmo nível: ../../package.json é o da API nos dois casos.
const pacote = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8')) as {
  version: string;
};

export const VERSAO_API = pacote.version;
