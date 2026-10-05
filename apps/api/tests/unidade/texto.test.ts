import { describe, expect, it } from 'vitest';

import { cnpjTemDigitosValidos } from '../../src/schemas/campos.js';
import { idDoNome, normalizarBusca } from '../../src/utils/texto.js';

describe('texto', () => {
  it('normaliza para busca: minúsculo, sem acento e sem espaços extras', () => {
    expect(normalizarBusca('  Ilha  do LEITE ')).toBe('ilha do leite');
    expect(normalizarBusca('Paissandu')).toBe('paissandu');
    expect(normalizarBusca('Clínica Marés')).toBe('clinica mares');
  });

  it('gera o id da especialidade igual ao nome do ícone', () => {
    expect(idDoNome('Clínico geral')).toBe('clinicoGeral');
    expect(idDoNome('Obstetrícia')).toBe('obstetricia');
    expect(idDoNome('Otorrinolaringologia')).toBe('otorrinolaringologia');
  });

  it('confere os dígitos do CNPJ', () => {
    expect(cnpjTemDigitosValidos('11222333000181')).toBe(true);
    expect(cnpjTemDigitosValidos('11222333000180')).toBe(false);
    expect(cnpjTemDigitosValidos('11111111111111')).toBe(false);
  });
});
