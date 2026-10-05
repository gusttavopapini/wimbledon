// Mesmas regras de mascararCPF/mascararData/lerData do design system (bundle.js).

export function soDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

/** 12345678909 -> 123.456.789-09 (aceita parcial) */
export function mascararCpf(valor: string): string {
  const d = soDigitos(valor).slice(0, 11);
  let saida = '';
  for (let i = 0; i < d.length; i++) {
    if (i === 3 || i === 6) saida += '.';
    if (i === 9) saida += '-';
    saida += d[i];
  }
  return saida;
}

/** 12031948 -> 12/03/1948 (aceita parcial) */
export function mascararData(valor: string): string {
  const d = soDigitos(valor).slice(0, 8);
  let saida = '';
  for (let i = 0; i < d.length; i++) {
    if (i === 2 || i === 4) saida += '/';
    saida += d[i];
  }
  return saida;
}

/** 81999991234 -> (81) 99999-1234; 8133331234 -> (81) 3333-1234 (aceita parcial) */
export function mascararTelefone(valor: string): string {
  const d = soDigitos(valor).slice(0, 11);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const resto = d.slice(2);
  const corte = d.length === 11 ? 5 : 4;
  if (resto.length <= corte) return `(${ddd}) ${resto}`;
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`;
}

/** "12/03/1948" -> { dia: 12, mes: 3, ano: 1948 } se a data existir; senão null. */
export function lerData(texto: string): { dia: number; mes: number; ano: number } | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto);
  if (!m) return null;
  const [dia, mes, ano] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  if (
    data.getUTCFullYear() !== ano ||
    data.getUTCMonth() !== mes - 1 ||
    data.getUTCDate() !== dia
  ) {
    return null;
  }
  return { dia, mes, ano };
}

/** "12/03/1948" -> "1948-03-12", o formato que a API recebe. */
export function dataParaIso(texto: string): string {
  const data = lerData(texto);
  if (!data) return '';
  const dois = (n: number) => String(n).padStart(2, '0');
  return `${data.ano}-${dois(data.mes)}-${dois(data.dia)}`;
}

const DIAS = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];
const MESES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

/** "12/03/1948" -> "Sexta-feira, 12 de março de 1948" (confirmação do campo de data). */
export function dataPorExtenso(texto: string): string | null {
  const data = lerData(texto);
  if (!data) return null;
  const diaSemana = new Date(Date.UTC(data.ano, data.mes - 1, data.dia)).getUTCDay();
  const frase = `${DIAS[diaSemana]}, ${data.dia} de ${MESES[data.mes - 1]} de ${data.ano}`;
  return frase.charAt(0).toUpperCase() + frase.slice(1);
}
