import { describe, expect, it } from 'vitest';

import { resolverApiUrl } from '../src/utils/apiUrl';
import { diaCurto, diaPorExtenso, quandoPorExtenso } from '../src/utils/datas';

describe('resolverApiUrl', () => {
  it('troca localhost pelo IP do computador no Expo Go', () => {
    expect(resolverApiUrl('http://localhost:3333/api/v1', '192.168.0.10:8081', 'android')).toBe(
      'http://192.168.0.10:3333/api/v1',
    );
  });
  it('mantém a URL publicada e a do navegador', () => {
    expect(resolverApiUrl('https://x.vercel.app/api/v1', '192.168.0.10:8081', 'ios')).toBe(
      'https://x.vercel.app/api/v1',
    );
    expect(resolverApiUrl('http://localhost:3333/api/v1', '192.168.0.10:8081', 'web')).toBe(
      'http://localhost:3333/api/v1',
    );
  });
});

describe('datas por extenso', () => {
  it('escreve o dia como as pessoas falam', () => {
    expect(diaPorExtenso('2026-11-25')).toBe('Quarta-feira, 25 de novembro');
    expect(quandoPorExtenso('2026-11-25', '09:00')).toBe('Quarta-feira, 25 de novembro, às 9h');
    expect(quandoPorExtenso('2026-11-25', '14:30')).toBe('Quarta-feira, 25 de novembro, às 14h30');
    expect(diaCurto('2026-11-25')).toEqual({ semana: 'Qua', dia: '25', mes: 'nov' });
  });
});
