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
