import { describe, expect, it } from 'vitest';

import {
  dataParaIso,
  dataPorExtenso,
  lerData,
  mascararCpf,
  mascararData,
  mascararTelefone,
} from '@/utils/mascaras';

describe('máscaras', () => {
  it('CPF: aceita parcial e limita a 11 números', () => {
    expect(mascararCpf('529')).toBe('529');
    expect(mascararCpf('5299822')).toBe('529.982.2');
    expect(mascararCpf('529.982.247-25999')).toBe('529.982.247-25');
  });

  it('data: dd/mm/aaaa', () => {
    expect(mascararData('1203')).toBe('12/03');
    expect(mascararData('12031948')).toBe('12/03/1948');
  });

  it('telefone: celular e fixo com DDD', () => {
    expect(mascararTelefone('81999991234')).toBe('(81) 99999-1234');
    expect(mascararTelefone('8133331234')).toBe('(81) 3333-1234');
    expect(mascararTelefone('81')).toBe('(81');
  });
});

describe('datas', () => {
  it('lê só datas que existem', () => {
    expect(lerData('12/03/1948')).toEqual({ dia: 12, mes: 3, ano: 1948 });
    expect(lerData('30/02/1948')).toBeNull();
    expect(lerData('12/03/48')).toBeNull();
  });

  it('converte para o formato da API', () => {
    expect(dataParaIso('12/03/1948')).toBe('1948-03-12');
  });

  it('confirma por extenso, como no design system', () => {
    expect(dataPorExtenso('12/03/1948')).toBe('Sexta-feira, 12 de março de 1948');
    expect(dataPorExtenso('12/03')).toBeNull();
  });
});
