import { describe, expect, it } from 'vitest';

import { dataIsoPorExtenso, telefoneLegivel } from '@/utils/mascaras';
import { horaNoRecife, saudacao } from '@/utils/saudacao';
import { contemTermo, iniciais, juntarComE } from '@/utils/texto';

// Recife é UTC-3 o ano todo: 12h UTC = 9h no Recife.
const emRecife = (hora: number) => new Date(Date.UTC(2026, 9, 5, hora + 3, 0));

describe('saudação pelo horário do Recife', () => {
  it('usa o fuso do Recife, não o do aparelho', () => {
    expect(horaNoRecife(new Date('2026-10-05T12:00:00Z'))).toBe(9);
  });

  it.each([
    [5, 'Bom dia, Ana!'],
    [11, 'Bom dia, Ana!'],
    [12, 'Boa tarde, Ana!'],
    [17, 'Boa tarde, Ana!'],
    [18, 'Boa noite, Ana!'],
    [23, 'Boa noite, Ana!'],
    [2, 'Boa noite, Ana!'],
  ])('às %ih diz "%s" com o primeiro nome', (hora, esperado) => {
    expect(saudacao('Ana Teste Souza', emRecife(hora))).toBe(esperado);
  });

  it('sem nome, só o cumprimento', () => {
    expect(saudacao('', emRecife(9))).toBe('Bom dia!');
  });
});

describe('busca sem acento', () => {
  it('acha por trecho, sem diferenciar acento e maiúscula', () => {
    expect(contemTermo('CORACAO', ['Cardiologia', 'coração', 'pressão alta'])).toBe(true);
    expect(contemTermo('boa vis', ['Boa Vista'])).toBe(true);
    expect(contemTermo('derby', ['Ilha do Leite'])).toBe(false);
  });

  it('termo vazio mostra tudo', () => {
    expect(contemTermo('   ', ['Qualquer'])).toBe(true);
  });
});

describe('textos', () => {
  it('iniciais ignoram Dr./Dra., como o Avatar do design system', () => {
    expect(iniciais('Dra. Helena Marinho Duarte')).toBe('HD');
    expect(iniciais('Ana Souza')).toBe('AS');
    expect(iniciais('Maria')).toBe('M');
  });

  it('junta especialidades com "e"', () => {
    expect(juntarComE(['Cardiologia'])).toBe('Cardiologia');
    expect(juntarComE(['Cardiologia', 'Clínico geral'])).toBe('Cardiologia e Clínico geral');
    expect(juntarComE(['A', 'B', 'C'])).toBe('A, B e C');
  });

  it('data da API por extenso e telefone legível', () => {
    expect(dataIsoPorExtenso('1948-03-12')).toBe('12 de março de 1948');
    expect(telefoneLegivel('5581999991234')).toBe('(81) 99999-1234');
  });
});
