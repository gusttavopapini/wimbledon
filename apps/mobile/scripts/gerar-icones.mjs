#!/usr/bin/env node
/**
 * Gera src/components/iconesEspecialidade.ts a partir dos SVG em
 * assets/especialidades/ (cópia de design-system/assets/Especialidades/).
 *
 * Guarda só a geometria (path e circle). Ficam de fora os metadados e o
 * stroke fixo do arquivo: a cor vem do tema, no componente IconeEspecialidade.
 * Nunca edite o arquivo gerado; rode `npm run icones`.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const pasta = join(raiz, 'assets/especialidades');
const saida = join(raiz, 'src/components/iconesEspecialidade.ts');

const arquivos = readdirSync(pasta)
  .filter((nome) => nome.endsWith('.svg'))
  .sort();

const icones = {};
for (const arquivo of arquivos) {
  const svg = readFileSync(join(pasta, arquivo), 'utf8').replace(
    /<metadata>[\s\S]*?<\/metadata>/g,
    '',
  );
  if (!/viewBox="0 0 24 24"/.test(svg))
    throw new Error(`${arquivo}: viewBox diferente de 0 0 24 24`);
  const formas = [...svg.matchAll(/<(path|circle)\b([^>]*)\/?>/g)].map(([, tipo, atributos]) => {
    const attr = Object.fromEntries(
      [...atributos.matchAll(/([a-z-]+)="([^"]*)"/g)].map(([, nome, valor]) => [nome, valor]),
    );
    if (tipo === 'path') return { tipo, d: attr.d };
    return { tipo, cx: Number(attr.cx), cy: Number(attr.cy), r: Number(attr.r) };
  });
  if (formas.length === 0) throw new Error(`${arquivo}: nenhuma forma encontrada`);
  icones[basename(arquivo, '.svg')] = formas;
}

const conteudo = `// GERADO POR apps/mobile/scripts/gerar-icones.mjs A PARTIR DE assets/especialidades/*.svg
// (cópia de design-system/assets/Especialidades). NÃO EDITE À MÃO: rode npm run icones.
// Só a geometria, em grade de 24; traço e cor vêm do componente IconeEspecialidade.

export type FormaIcone =
  | { tipo: 'path'; d: string }
  | { tipo: 'circle'; cx: number; cy: number; r: number };

export const ICONES_ESPECIALIDADE = ${JSON.stringify(icones, null, 2)} as const satisfies Record<string, readonly FormaIcone[]>;

export type IdIconeEspecialidade = keyof typeof ICONES_ESPECIALIDADE;
`;

writeFileSync(saida, conteudo, 'utf8');
console.log(`${Object.keys(icones).length} ícones gerados em ${saida}`);
