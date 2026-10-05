import { z } from 'zod';

import { lerData, soDigitos } from '@/utils/mascaras';

// Mensagens iguais às da API e do glossário (design-system/linguagem.md):
// dizem o que fazer, não o que deu errado. A API valida de novo e é quem decide.

function cpfTemDigitosValidos(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  for (let t = 9; t < 11; t++) {
    let soma = 0;
    for (let i = 0; i < t; i++) soma += Number(cpf[i]) * (t + 1 - i);
    if (((soma * 10) % 11) % 10 !== Number(cpf[t])) return false;
  }
  return true;
}

export const cpf = z.string().superRefine((valor, ctx) => {
  const d = soDigitos(valor);
  let mensagem: string | null = null;
  if (d.length === 0) mensagem = 'Digite os 11 números do seu CPF.';
  else if (d.length < 11) {
    const falta = 11 - d.length;
    mensagem =
      falta === 1
        ? 'Falta 1 número. Confira no seu documento e digite os 11 números.'
        : `Faltam ${falta} números. Confira no seu documento e digite os 11 números.`;
  } else if (!cpfTemDigitosValidos(d)) {
    mensagem = 'Esse CPF não confere. Confira os números no seu documento.';
  }
  if (mensagem) ctx.addIssue({ code: 'custom', message: mensagem });
});

export const nome = z.string().superRefine((valor, ctx) => {
  const limpo = valor.trim().replace(/\s+/g, ' ');
  let mensagem: string | null = null;
  if (!limpo) mensagem = 'Digite seu nome completo, como está no documento.';
  else if (limpo.length > 120) mensagem = 'O nome ficou longo demais. Use no máximo 120 letras.';
  else if (limpo.split(' ').length < 2)
    mensagem = 'Digite também o sobrenome, como está no documento.';
  else if (!/^[\p{L}' .-]+$/u.test(limpo))
    mensagem = 'Use só letras no nome. Confira se não entrou número ou símbolo.';
  if (mensagem) ctx.addIssue({ code: 'custom', message: mensagem });
});

export const email = z.string().superRefine((bruto, ctx) => {
  const valor = bruto.trim().toLowerCase();
  const [usuario, dominio] = valor.split('@');
  let mensagem: string | null = null;
  if (!valor) mensagem = 'Digite seu e-mail. Exemplo: ana@gmail.com';
  else if (!valor.includes('@') || !usuario)
    mensagem = 'Falta o @ no e-mail. Exemplo: ana@gmail.com';
  else if (!dominio || !/^[^.\s]+(\.[^.\s]+)+$/.test(dominio))
    mensagem = 'Falta o final do e-mail. Exemplo: ana@gmail.com';
  else if (!z.email().safeParse(valor).success)
    mensagem =
      'Confira o e-mail: tem algum espaço ou símbolo fora do lugar. Exemplo: ana@gmail.com';
  if (mensagem) ctx.addIssue({ code: 'custom', message: mensagem });
});

export const telefone = z
  .string()
  .refine((valor) => /^[1-9][1-9](9\d{8}|[2-5]\d{7})$/.test(soDigitos(valor)), {
    message: 'Digite o telefone com DDD. Exemplo: (81) 99999-1234',
  });

export function dataNascimento(hoje: () => Date = () => new Date()) {
  return z.string().superRefine((valor, ctx) => {
    let mensagem: string | null = null;
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
      mensagem = 'Digite a data com dia, mês e ano. Exemplo: 12/03/1948';
    } else {
      const data = lerData(valor);
      const agora = hoje();
      if (!data) mensagem = 'Essa data não existe. Confira o dia e o mês. Exemplo: 12/03/1948';
      else if (Date.UTC(data.ano, data.mes - 1, data.dia) > agora.getTime())
        mensagem = 'A data de nascimento não pode ser depois de hoje. Confira o ano.';
      else if (data.ano < agora.getFullYear() - 130)
        mensagem = 'Confira o ano de nascimento. Exemplo: 12/03/1948';
    }
    if (mensagem) ctx.addIssue({ code: 'custom', message: mensagem });
  });
}

export const senhaNova = z
  .string()
  .min(1, 'Crie uma senha com pelo menos 8 letras ou números.')
  .min(8, 'A senha precisa ter pelo menos 8 letras ou números.')
  .max(128, 'A senha ficou longa demais. Use no máximo 128 caracteres.');

export const senhaAtual = z.string().min(1, 'Digite sua senha.');
