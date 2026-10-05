const FUSO_PADRAO = 'America/Recife';

function dois(numero: number): string {
  return String(numero).padStart(2, '0');
}

/**
 * Converte um instante (gravado em UTC) para ISO 8601 com o offset do fuso:
 * 2026-10-04T23:44:29.090Z -> 2026-10-04T20:44:29.090-03:00.
 */
export function paraIsoLocal(data: Date, fuso: string = FUSO_PADRAO): string {
  const partes = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: fuso,
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
      .formatToParts(data)
      .map((parte) => [parte.type, parte.value]),
  ) as Record<string, string>;

  const comoSeFosseUtc = Date.UTC(
    Number(partes.year),
    Number(partes.month) - 1,
    Number(partes.day),
    Number(partes.hour),
    Number(partes.minute),
    Number(partes.second),
  );
  const segundosInteiros = Math.floor(data.getTime() / 1000) * 1000;
  const offsetMin = Math.round((comoSeFosseUtc - segundosInteiros) / 60_000);
  const sinal = offsetMin < 0 ? '-' : '+';
  const absoluto = Math.abs(offsetMin);
  const ms = String(data.getUTCMilliseconds()).padStart(3, '0');

  return (
    `${partes.year}-${partes.month}-${partes.day}T${partes.hour}:${partes.minute}:${partes.second}.${ms}` +
    `${sinal}${dois(Math.floor(absoluto / 60))}:${dois(absoluto % 60)}`
  );
}

/** "AAAA-MM-DD" de hoje no fuso informado. */
export function hojeNoFuso(fuso: string = FUSO_PADRAO, agora: Date = new Date()): string {
  return paraIsoLocal(agora, fuso).slice(0, 10);
}
