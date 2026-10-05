import { z } from 'zod';

// Mensagens dizem o que fazer, não o que deu errado (design-system/linguagem.md).

export const PERFIS = [
  'paciente',
  'recepcionista',
  'medico',
  'manutencao',
  'administrativo',
] as const;
export type Perfil = (typeof PERFIS)[number];

export const STATUS_USUARIO = ['ativo', 'pre_cadastro', 'inativo'] as const;
export type StatusUsuario = (typeof STATUS_USUARIO)[number];

export const SEXOS = ['feminino', 'masculino', 'outro', 'prefiro_nao_informar'] as const;

const plural = (n: number, singular: string, varios: string) => (n === 1 ? singular : varios);

/** Dígitos verificadores do CPF (módulo 11). */
export function cpfTemDigitosValidos(cpf: string): boolean {
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  const digito = (base: string) => {
    const soma = [...base].reduce((total, d, i) => total + Number(d) * (base.length + 1 - i), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  const primeiro = digito(cpf.slice(0, 9));
  const segundo = digito(cpf.slice(0, 9) + primeiro);
  return cpf.endsWith(`${primeiro}${segundo}`);
}

export const cpf = z
  .string({ error: 'Digite os 11 números do seu CPF.' })
  .transform((valor) => valor.replace(/\D/g, ''))
  .superRefine((digitos, ctx) => {
    if (digitos.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Digite os 11 números do seu CPF.' });
    } else if (digitos.length < 11) {
      const falta = 11 - digitos.length;
      ctx.addIssue({
        code: 'custom',
        message: `Falta${falta === 1 ? '' : 'm'} ${falta} ${plural(falta, 'número', 'números')}. Confira no seu documento e digite os 11 números.`,
      });
    } else if (digitos.length > 11) {
      const sobra = digitos.length - 11;
      ctx.addIssue({
        code: 'custom',
        message: `${sobra === 1 ? 'Tem 1 número' : `Têm ${sobra} números`} a mais. Confira no seu documento e digite só os 11 números.`,
      });
    } else if (!cpfTemDigitosValidos(digitos)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Esse CPF não confere. Confira os números no seu documento.',
      });
    }
  });

export const nome = z
  .string({ error: 'Digite seu nome completo, como está no documento.' })
  .transform((valor) => valor.trim().replace(/\s+/g, ' '))
  .pipe(
    z
      .string()
      .min(1, 'Digite seu nome completo, como está no documento.')
      .max(120, 'O nome ficou longo demais. Use no máximo 120 letras.')
      .refine((valor) => valor.split(' ').length >= 2, {
        message: 'Digite também o sobrenome, como está no documento.',
      })
      .refine((valor) => /^[\p{L}' .-]+$/u.test(valor), {
        message: 'Use só letras no nome. Confira se não entrou número ou símbolo.',
      }),
  );

export const email = z
  .string({ error: 'Digite seu e-mail. Exemplo: ana@gmail.com' })
  .transform((valor) => valor.trim().toLowerCase())
  .superRefine((valor, ctx) => {
    if (valor.length === 0) {
      ctx.addIssue({ code: 'custom', message: 'Digite seu e-mail. Exemplo: ana@gmail.com' });
      return;
    }
    const [usuario, dominio] = valor.split('@');
    if (!valor.includes('@') || !usuario) {
      ctx.addIssue({
        code: 'custom',
        message: 'Falta o @ no e-mail. Exemplo: ana@gmail.com',
      });
    } else if (!dominio || !/^[^.\s]+(\.[^.\s]+)+$/.test(dominio)) {
      ctx.addIssue({ code: 'custom', message: 'Falta o final do e-mail. Exemplo: ana@gmail.com' });
    } else if (!z.email().safeParse(valor).success) {
      ctx.addIssue({
        code: 'custom',
        message:
          'Confira o e-mail: tem algum espaço ou símbolo fora do lugar. Exemplo: ana@gmail.com',
      });
    }
  });

/**
 * Telefone brasileiro com DDD, gravado em E.164 sem o "+": 5581999991234.
 * Aceita com ou sem máscara e com ou sem o 55.
 */
export const telefone = z
  .string({ error: 'Digite o telefone com DDD. Exemplo: (81) 99999-1234' })
  .transform((valor) => valor.replace(/\D/g, ''))
  .transform((digitos) =>
    digitos.length === 10 || digitos.length === 11 ? `55${digitos}` : digitos,
  )
  .refine((digitos) => /^55[1-9][1-9](9\d{8}|[2-5]\d{7})$/.test(digitos), {
    message: 'Digite o telefone com DDD. Exemplo: (81) 99999-1234',
  });

/** "AAAA-MM-DD", dia que existe no calendário. */
export const dataCalendario = z
  .string({ error: 'Digite a data com dia, mês e ano. Exemplo: 12/03/1948' })
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Digite a data com dia, mês e ano. Exemplo: 12/03/1948')
  .refine(
    (valor) => {
      const [ano, mes, dia] = valor.split('-').map(Number) as [number, number, number];
      const data = new Date(Date.UTC(ano, mes - 1, dia));
      return (
        data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia
      );
    },
    { message: 'Essa data não existe. Confira o dia e o mês. Exemplo: 12/03/1948' },
  );

export function dataNascimento(hoje: () => string) {
  return dataCalendario.superRefine((valor, ctx) => {
    if (valor > hoje()) {
      ctx.addIssue({
        code: 'custom',
        message: 'A data de nascimento não pode ser depois de hoje. Confira o ano.',
      });
    } else if (Number(valor.slice(0, 4)) < Number(hoje().slice(0, 4)) - 130) {
      ctx.addIssue({ code: 'custom', message: 'Confira o ano de nascimento. Exemplo: 12/03/1948' });
    }
  });
}

export const senha = z
  .string({ error: 'Crie uma senha com pelo menos 8 letras ou números.' })
  .min(8, 'A senha precisa ter pelo menos 8 letras ou números.')
  .max(128, 'A senha ficou longa demais. Use no máximo 128 caracteres.');

export const sexo = z.enum(SEXOS, {
  error: 'Escolha uma das opções: feminino, masculino, outro ou prefiro não informar.',
});

export const preferencias = z.strictObject({
  letraGrande: z.boolean({ error: 'Escolha se quer letra grande: sim ou não.' }),
  altoContraste: z.boolean({ error: 'Escolha se quer alto contraste: sim ou não.' }),
  lembreteWhatsapp: z.boolean({ error: 'Escolha se quer lembrete no WhatsApp: sim ou não.' }),
});
export type Preferencias = z.infer<typeof preferencias>;

export const PREFERENCIAS_PADRAO: Preferencias = {
  letraGrande: false,
  altoContraste: false,
  lembreteWhatsapp: false,
};
