const DIAS = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];
const DIAS_CURTOS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
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

function partes(iso: string) {
  const [ano, mes, dia] = iso.slice(0, 10).split('-').map(Number) as [number, number, number];
  const semana = new Date(Date.UTC(ano, mes - 1, dia)).getUTCDay();
  return { ano, mes, dia, semana };
}

/** "2026-11-25" -> "Quarta-feira, 25 de novembro" */
export function diaPorExtenso(iso: string): string {
  const { mes, dia, semana } = partes(iso);
  const frase = `${DIAS[semana]}, ${dia} de ${MESES[mes - 1]}`;
  return frase.charAt(0).toUpperCase() + frase.slice(1);
}

/** "2026-11-25" -> { semana: "Qua", dia: "25", mes: "nov" } para os botões de dia. */
export function diaCurto(iso: string) {
  const { mes, dia, semana } = partes(iso);
  return { semana: DIAS_CURTOS[semana]!, dia: String(dia), mes: MESES[mes - 1]!.slice(0, 3) };
}

/** "2026-11-25", "09:30" -> "Quarta-feira, 25 de novembro, às 9h30" */
export function quandoPorExtenso(data: string, hora: string | null): string {
  if (!hora) return diaPorExtenso(data);
  const [h, m] = hora.split(':');
  return `${diaPorExtenso(data)}, às ${Number(h)}h${m === '00' ? '' : m}`;
}

/** "AAAA-MM-DD" de hoje no Recife (UTC-3, sem horário de verão). */
export function hojeNoRecife(agora: Date = new Date()): string {
  return new Date(agora.getTime() - 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** ISO com offset -> "14h32" */
export function horaDe(isoComOffset: string | null): string {
  if (!isoComOffset) return '';
  const m = /T(\d{2}):(\d{2})/.exec(isoComOffset);
  return m ? `${Number(m[1])}h${m[2]}` : '';
}

export const NOMES_DIAS = DIAS;
