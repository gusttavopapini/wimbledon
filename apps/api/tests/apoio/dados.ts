import { randomInt, randomUUID } from 'node:crypto';

import { VERSAO_TERMO_ATUAL } from '../../src/config/termo.js';
import { cpfTemDigitosValidos } from '../../src/schemas/campos.js';

/**
 * CPF com dígitos verificadores válidos, gerado a cada execução. Nenhum teste
 * usa dados de pessoas reais: nomes e e-mails são fictícios (domínio .test).
 */
export function gerarCpf(): string {
  for (;;) {
    const base = Array.from({ length: 9 }, () => randomInt(10)).join('');
    for (let dv = 0; dv < 100; dv++) {
      const cpf = base + String(dv).padStart(2, '0');
      if (cpfTemDigitosValidos(cpf)) return cpf;
    }
  }
}

export function gerarEmail(prefixo = 'paciente'): string {
  return `${prefixo}-${randomUUID().slice(0, 8)}@saude-palma.test`;
}

export function formatarCpf(cpf: string): string {
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function dadosCadastro(extra: Record<string, unknown> = {}) {
  return {
    nome: 'Maria Teste da Silva',
    cpf: formatarCpf(gerarCpf()),
    dataNascimento: '1948-03-12',
    telefone: '(81) 99999-1234',
    email: gerarEmail(),
    senha: 'senha-de-teste-123',
    consentimento: {
      versaoTermo: VERSAO_TERMO_ATUAL,
      aceito: true,
      canal: 'app',
      exibicaoPainel: false,
    },
    ...extra,
  };
}

/** CNPJ com dígitos verificadores válidos, gerado a cada execução. */
export function gerarCnpj(): string {
  const digito = (base: string) => {
    const pesos =
      base.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const resto = [...base].reduce((t, d, i) => t + Number(d) * pesos[i]!, 0) % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const base = Array.from({ length: 8 }, () => randomInt(10)).join('') + '0001';
  const d1 = digito(base);
  return base + d1 + digito(base + d1);
}

export function dadosEspecialidade(extra: Record<string, unknown> = {}) {
  return {
    nome: 'Cardiologia',
    descricao: 'Cuida do coração e da circulação do sangue.',
    palavrasChave: ['coração', 'pressão alta', 'palpitação'],
    ...extra,
  };
}

export function dadosUnidade(especialidadeIds: string[], extra: Record<string, unknown> = {}) {
  return {
    nome: 'Hospital Teste das Marés',
    tipo: 'hospital',
    cnpj: gerarCnpj(),
    endereco: {
      logradouro: 'Rua das Jangadas',
      numero: '100',
      bairro: 'Ilha do Leite',
      cidade: 'Recife',
      uf: 'pe',
      cep: '50070-000',
    },
    telefone: '(81) 3333-1234',
    especialidadeIds,
    ...extra,
  };
}

export function gerarCrm(): string {
  return String(100000 + randomInt(899999));
}

export function dadosMedico(
  especialidadeIds: string[],
  unidadeIds: string[],
  extra: Record<string, unknown> = {},
) {
  return {
    nome: 'Dra. Helena Teste Duarte',
    conselho: { tipo: 'CRM', numero: gerarCrm(), uf: 'PE' },
    especialidadeIds,
    unidadeIds,
    ...extra,
  };
}
