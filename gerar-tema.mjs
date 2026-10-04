#!/usr/bin/env node
/**
 * Gera apps/mobile/src/theme/tokens.ts a partir de project/tokens.json.
 *
 * Rode sempre que o design system mudar, nunca edite tokens.ts à mão:
 *   node gerar-tema.mjs [caminho/para/tokens.json] [caminho/de/saida.ts]
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const entrada = resolve(process.argv[2] ?? 'project/tokens.json');
const saida = resolve(process.argv[3] ?? 'apps/mobile/src/theme/tokens.ts');

const t = JSON.parse(readFileSync(entrada, 'utf8'));

const TEMAS = { claro: 'claro', altocontraste: 'altoContraste' };

/** "#015f6866" -> "rgba(1, 95, 104, 0.4)"; o React Native não aceita hex de 8 dígitos. */
function corRN(v) {
  if (typeof v !== 'string') return v;
  const m = /^#([0-9a-f]{6})([0-9a-f]{2})$/i.exec(v.trim());
  if (!m) return v.toUpperCase();
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16));
  const a = Math.round((parseInt(m[2], 16) / 255) * 100) / 100;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** Resolve "{outroToken}" até o valor final, por tema. */
function resolver(tokens, nome, tema, vistos = new Set()) {
  if (vistos.has(nome)) throw new Error(`Alias circular em "${nome}"`);
  vistos.add(nome);
  const tk = tokens.find((x) => x.name === nome);
  if (!tk) throw new Error(`Token "${nome}" não existe`);
  const bruto = typeof tk.value === 'string' ? tk.value : tk.value[tema] ?? tk.value.claro;
  const alias = /^\{(.+)\}$/.exec(String(bruto).trim());
  return alias ? resolver(tokens, alias[1], tema, vistos) : bruto;
}

const num = (v) => Number(String(v).replace('px', ''));

// --- cores -------------------------------------------------------------
const nomesCor = t.color.tokens.map((x) => x.name);
const cores = {};
for (const [id, chave] of Object.entries(TEMAS)) {
  cores[chave] = Object.fromEntries(
    nomesCor.map((n) => [n, corRN(resolver(t.color.tokens, n, id))]),
  );
}

// --- escalas numéricas -------------------------------------------------
const escala = (familia) =>
  Object.fromEntries(t[familia].tokens.map((x) => [x.name, num(x.value)]));

const espacamento = escala('spacing');
const raio = escala('radius');
const tamanho = escala('tamanho');

// --- tipografia --------------------------------------------------------
const grupo = (nome) => {
  const g = t.type.groups.find((x) => x.name === nome);
  if (!g) throw new Error(`Grupo de tipografia "${nome}" não existe`);
  return Object.fromEntries(
    g.styles.map((s) => [
      s.name,
      {
        fontSize: num(s.fontSize),
        lineHeight: num(s.lineHeight),
        fontFamily: Number(s.fontWeight) >= 700 ? 'Heebo_700Bold' : 'Heebo_400Regular',
        fontWeight: String(s.fontWeight),
      },
    ]),
  );
};

const tipo = grupo('Padrão');
const tipoGrande = grupo('Letra grande');
const tipoPainel = grupo('Painel de TV');

// o fator de letra grande sai dos próprios tokens, não de um número solto
const FATOR = tipoGrande.corpoGrande.fontSize / tipo.corpo.fontSize;

// --- sombras -----------------------------------------------------------
// As sombras do sistema são CSS. No React Native elas viram elevation (Android)
// e shadow* (iOS); no alto contraste viram contorno, tratado nos componentes.
const sombras = {
  claro: {
    sombraCartao: { elevation: 3, shadowColor: '#014A52', shadowOpacity: 0.12, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
    sombraNavegacao: { elevation: 8, shadowColor: '#014A52', shadowOpacity: 0.16, shadowRadius: 10, shadowOffset: { width: 0, height: -2 } },
    sombraDialogo: { elevation: 16, shadowColor: '#1A1A1A', shadowOpacity: 0.32, shadowRadius: 24, shadowOffset: { width: 0, height: 8 } },
  },
  altoContraste: {
    sombraCartao: { elevation: 0, borderWidth: 2, borderColor: '#FFFFFF' },
    sombraNavegacao: { elevation: 0, borderWidth: 2, borderColor: '#FFFFFF' },
    sombraDialogo: { elevation: 0, borderWidth: 3, borderColor: '#FFFFFF' },
  },
};

const j = (v) => JSON.stringify(v, null, 2).replace(/"([A-Za-z_$][\w$]*)":/g, '$1:');

const conteudo = `// GERADO POR gerar-tema.mjs A PARTIR DO DESIGN SYSTEM — NÃO EDITE À MÃO.
// Fonte: "${t.name}" v${t.version}. Para mudar um valor, mude no design system
// e rode: node gerar-tema.mjs
//
// Fonte Heebo: @expo-google-fonts/heebo (Heebo_400Regular, Heebo_700Bold).

export const cores = ${j(cores)} as const;

export type ModoCor = keyof typeof cores;

export const espacamento = ${j(espacamento)} as const;

export const raio = ${j(raio)} as const;

export const tamanho = ${j(tamanho)} as const;

export const tipo = ${j(tipo)} as const;

export const tipoGrande = ${j(tipoGrande)} as const;

export const tipoPainel = ${j(tipoPainel)} as const;

/** Multiplicador do modo "Letra grande" (${tipo.corpo.fontSize}px -> ${tipoGrande.corpoGrande.fontSize}px). */
export const FATOR_LETRA_GRANDE = ${FATOR.toFixed(4)};

export const sombras = ${j(sombras)} as const;

/**
 * A borda do campo em repouso mede 1,98:1 sobre branco e NÃO passa no
 * WCAG 1.4.11 (mínimo 3:1). Ver project/contraste.md. Correção recomendada,
 * quando o design system for atualizado: opacidade 0,65 (3,31:1) ou 0,70 (3,70:1).
 */
export const BORDA_CAMPO_REPROVA_CONTRASTE = true;
`;

mkdirSync(dirname(saida), { recursive: true });
writeFileSync(saida, conteudo, 'utf8');

console.log(`tokens.ts gerado em ${saida}`);
console.log(
  `  ${nomesCor.length} cores x ${Object.keys(cores).length} modos · ` +
    `${Object.keys(espacamento).length} espaçamentos · ${Object.keys(raio).length} raios · ` +
    `${Object.keys(tamanho).length} tamanhos · ` +
    `${Object.keys(tipo).length}+${Object.keys(tipoGrande).length}+${Object.keys(tipoPainel).length} estilos de texto`,
);
