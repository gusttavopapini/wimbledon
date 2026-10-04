import { Writable } from 'node:stream';

import { describe, expect, it } from 'vitest';

import { criarLogger, mascararCpf, mascararToken } from '../../src/config/logger.js';

describe('mascaramento nos logs', () => {
  it('mascara o CPF deixando só os 4 últimos dígitos', () => {
    expect(mascararCpf('12345678901')).toBe('***.***.*89-01');
    expect(mascararCpf('1')).toBe('***');
  });

  it('mascara o token mantendo o esquema', () => {
    expect(mascararToken('Bearer eyJhbGciOi.abc.xyz123456')).toBe('Bearer ***123456');
  });

  it('aplica as máscaras no JSON escrito pelo logger', () => {
    const linhas: string[] = [];
    const destino = new Writable({
      write(pedaco, _codificacao, pronto) {
        linhas.push(String(pedaco));
        pronto();
      },
    });
    const logger = criarLogger('info', destino);

    logger.info(
      { usuario: { cpf: '12345678901', senha: 'segredo' }, idToken: 'abcdefghij' },
      'teste',
    );

    const registro = linhas.join('');
    expect(registro).not.toContain('12345678901');
    expect(registro).not.toContain('segredo');
    expect(registro).not.toContain('abcdefghij');
    expect(registro).toContain('***.***.*89-01');
  });
});
