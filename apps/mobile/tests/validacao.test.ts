import { describe, expect, it } from 'vitest';

import { esquemaCriarConta, esquemaEntrar } from '@/validacao/formularios';

const valido = {
  nome: 'Maria Teste da Silva',
  cpf: '529.982.247-25',
  dataNascimento: '12/03/1948',
  telefone: '(81) 99999-1234',
  email: 'maria@exemplo.test',
  senha: 'senha-123',
  aceiteTermo: true,
  exibicaoPainel: false,
};

function erros(dados: Record<string, unknown>) {
  const resultado = esquemaCriarConta.safeParse({ ...valido, ...dados });
  return resultado.success
    ? {}
    : Object.fromEntries(resultado.error.issues.map((i) => [i.path.join('.'), i.message]));
}

describe('criar conta', () => {
  it('aceita o formulário completo, com ou sem o aceite do painel', () => {
    expect(esquemaCriarConta.safeParse(valido).success).toBe(true);
    expect(esquemaCriarConta.safeParse({ ...valido, exibicaoPainel: true }).success).toBe(true);
  });

  it('usa as mensagens do glossário, palavra por palavra', () => {
    expect(erros({ cpf: '529.982.247-2' }).cpf).toBe(
      'Falta 1 número. Confira no seu documento e digite os 11 números.',
    );
    expect(erros({ cpf: '123.456.789-01' }).cpf).toBe(
      'Esse CPF não confere. Confira os números no seu documento.',
    );
    expect(erros({ email: 'ana@gmail' }).email).toBe(
      'Falta o final do e-mail. Exemplo: ana@gmail.com',
    );
    expect(erros({ dataNascimento: '30/02/1948' }).dataNascimento).toBe(
      'Essa data não existe. Confira o dia e o mês. Exemplo: 12/03/1948',
    );
  });

  it('nunca diz só "inválido"', () => {
    const todas = Object.values(
      erros({ nome: 'M', cpf: '1', dataNascimento: '1', telefone: '1', email: 'x', senha: '1' }),
    );
    expect(todas.length).toBeGreaterThanOrEqual(6);
    for (const mensagem of todas) expect(mensagem.toLowerCase()).not.toContain('inválid');
  });

  it('exige o aceite do termo', () => {
    expect(erros({ aceiteTermo: false }).aceiteTermo).toBe(
      'Para criar a conta, marque que leu e aceita o termo de uso e privacidade.',
    );
  });
});

describe('entrar', () => {
  it('pede e-mail e senha', () => {
    const resultado = esquemaEntrar.safeParse({ email: '', senha: '' });
    expect(resultado.success).toBe(false);
    expect(resultado.error?.issues.map((i) => i.message)).toEqual([
      'Digite seu e-mail. Exemplo: ana@gmail.com',
      'Digite sua senha.',
    ]);
  });
});
