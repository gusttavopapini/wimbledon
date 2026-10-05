import { describe, expect, it } from 'vitest';
import type { ZodType } from 'zod';

import * as campo from '../../src/schemas/campos.js';
import { gerarCpf } from '../apoio/dados.js';

function mensagem(schema: ZodType, valor: unknown): string | undefined {
  const resultado = schema.safeParse(valor);
  return resultado.success ? undefined : resultado.error.issues[0]?.message;
}

describe('CPF', () => {
  it('aceita com ou sem máscara e guarda só os dígitos', () => {
    const cpf = gerarCpf();
    const formatado = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    expect(campo.cpf.parse(formatado)).toBe(cpf);
  });

  it('diz quantos números faltam, como no glossário', () => {
    expect(mensagem(campo.cpf, '1234567890')).toBe(
      'Falta 1 número. Confira no seu documento e digite os 11 números.',
    );
    expect(mensagem(campo.cpf, '123456789')).toBe(
      'Faltam 2 números. Confira no seu documento e digite os 11 números.',
    );
  });

  it('diz quantos números sobram', () => {
    expect(mensagem(campo.cpf, '123456789012')).toMatch(/^Tem 1 número a mais/);
    expect(mensagem(campo.cpf, '12345678901234')).toMatch(/^Têm 3 números a mais/);
  });

  it('recusa CPF que não existe com a mensagem do glossário, nunca "CPF inválido"', () => {
    expect(mensagem(campo.cpf, '12345678901')).toBe(
      'Esse CPF não confere. Confira os números no seu documento.',
    );
    expect(mensagem(campo.cpf, '111.111.111-11')).toBe(
      'Esse CPF não confere. Confira os números no seu documento.',
    );
  });

  it('pede o CPF quando vazio', () => {
    expect(mensagem(campo.cpf, '')).toBe('Digite os 11 números do seu CPF.');
    expect(mensagem(campo.cpf, undefined)).toBe('Digite os 11 números do seu CPF.');
  });
});

describe('e-mail', () => {
  it('normaliza para minúsculas sem espaços', () => {
    expect(campo.email.parse('  Ana@Gmail.COM ')).toBe('ana@gmail.com');
  });

  it('orienta quando falta o final', () => {
    expect(mensagem(campo.email, 'ana@gmail')).toBe(
      'Falta o final do e-mail. Exemplo: ana@gmail.com',
    );
    expect(mensagem(campo.email, 'ana@')).toBe('Falta o final do e-mail. Exemplo: ana@gmail.com');
  });

  it('orienta quando falta o @', () => {
    expect(mensagem(campo.email, 'ana.gmail.com')).toBe(
      'Falta o @ no e-mail. Exemplo: ana@gmail.com',
    );
  });

  it('orienta quando há símbolo fora do lugar', () => {
    expect(mensagem(campo.email, 'a na@gmail.com')).toMatch(/^Confira o e-mail/);
  });
});

describe('telefone', () => {
  it('grava em E.164 sem o +', () => {
    expect(campo.telefone.parse('(81) 99999-1234')).toBe('5581999991234');
    expect(campo.telefone.parse('+55 81 3333-1234')).toBe('558133331234');
  });

  it('pede o DDD com exemplo', () => {
    expect(mensagem(campo.telefone, '99999-1234')).toBe(
      'Digite o telefone com DDD. Exemplo: (81) 99999-1234',
    );
  });
});

describe('data de nascimento', () => {
  const nascimento = campo.dataNascimento(() => '2026-10-04');

  it('aceita uma data que existe', () => {
    expect(nascimento.parse('1948-03-12')).toBe('1948-03-12');
  });

  it('recusa data impossível com a mensagem do glossário', () => {
    expect(mensagem(nascimento, '1948-02-30')).toBe(
      'Essa data não existe. Confira o dia e o mês. Exemplo: 12/03/1948',
    );
    expect(mensagem(nascimento, '1948-13-01')).toBe(
      'Essa data não existe. Confira o dia e o mês. Exemplo: 12/03/1948',
    );
  });

  it('recusa data no futuro e ano distante demais', () => {
    expect(mensagem(nascimento, '2027-01-01')).toMatch(/depois de hoje/);
    expect(mensagem(nascimento, '1880-01-01')).toMatch(/Confira o ano/);
  });

  it('pede o formato quando vem fora do padrão', () => {
    expect(mensagem(nascimento, '12/03/1948')).toMatch(/dia, mês e ano/);
  });
});

describe('nome', () => {
  it('junta espaços repetidos', () => {
    expect(campo.nome.parse('  Maria   da  Silva ')).toBe('Maria da Silva');
  });

  it('pede o sobrenome', () => {
    expect(mensagem(campo.nome, 'Maria')).toBe(
      'Digite também o sobrenome, como está no documento.',
    );
  });

  it('aceita acentos e apóstrofo, recusa números', () => {
    expect(campo.nome.parse("João D'Ávila")).toBe("João D'Ávila");
    expect(mensagem(campo.nome, 'Maria 2')).toMatch(/só letras/);
  });
});
