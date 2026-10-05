import { readdirSync, readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

import { ICONES_ESPECIALIDADE } from '@/components/iconesEspecialidade';

const pastaDs = new URL('../../../design-system/assets/Especialidades/', import.meta.url);
const pastaApp = new URL('../assets/especialidades/', import.meta.url);
const svgsDs = readdirSync(pastaDs)
  .filter((f) => f.endsWith('.svg'))
  .sort();

describe('ícones de especialidade', () => {
  it('os 13 SVG do app são cópia exata dos do design system', () => {
    expect(svgsDs).toHaveLength(13);
    for (const arquivo of svgsDs) {
      expect(readFileSync(new URL(arquivo, pastaApp))).toEqual(
        readFileSync(new URL(arquivo, pastaDs)),
      );
    }
  });

  it('o módulo gerado tem um ícone por arquivo, com o mesmo nome', () => {
    expect(Object.keys(ICONES_ESPECIALIDADE).sort()).toEqual(
      svgsDs.map((f) => f.replace('.svg', '')),
    );
  });

  it('guarda só a geometria: nenhuma cor fixa do arquivo', () => {
    const texto = JSON.stringify(ICONES_ESPECIALIDADE);
    expect(texto).not.toMatch(/#[0-9a-f]{3,8}/i);
    expect(texto).not.toMatch(/stroke|fill|metadata/i);
  });
});
