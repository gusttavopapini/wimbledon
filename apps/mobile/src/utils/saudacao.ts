const FUSO = 'America/Recife';

/** Hora (0–23) no fuso do Recife, qualquer que seja o fuso do aparelho. */
export function horaNoRecife(agora: Date = new Date()): number {
  const hora = new Intl.DateTimeFormat('pt-BR', {
    timeZone: FUSO,
    hour: 'numeric',
    hourCycle: 'h23',
  }).format(agora);
  return Number(hora);
}

/** "Bom dia, Ana!" (5h–11h59), "Boa tarde" (12h–17h59), "Boa noite" (18h–4h59). */
export function saudacao(nomeCompleto: string, agora: Date = new Date()): string {
  const hora = horaNoRecife(agora);
  const cumprimento =
    hora >= 5 && hora < 12 ? 'Bom dia' : hora >= 12 && hora < 18 ? 'Boa tarde' : 'Boa noite';
  const primeiroNome = nomeCompleto.trim().split(/\s+/)[0];
  return primeiroNome ? `${cumprimento}, ${primeiroNome}!` : `${cumprimento}!`;
}
