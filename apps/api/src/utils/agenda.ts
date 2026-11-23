import { paraIsoLocal } from './datas.js';

/**
 * Recife não tem horário de verão desde 2019: o deslocamento é sempre -03:00.
 * Toda conversão "dia + hora local" -> instante UTC passa por aqui.
 */
export const OFFSET_RECIFE = '-03:00';

/** "2026-11-25" + "09:30" -> Date em UTC (12:30Z). */
export function instanteLocal(data: string, hora: string): Date {
  return new Date(`${data}T${hora}:00${OFFSET_RECIFE}`);
}

/** Date -> { data: "AAAA-MM-DD", hora: "HH:mm" } no fuso local. */
export function partesLocais(instante: Date, fuso?: string): { data: string; hora: string } {
  const iso = paraIsoLocal(instante, fuso);
  return { data: iso.slice(0, 10), hora: iso.slice(11, 16) };
}

/** "09:30" -> 570 */
export function minutosDoDia(hora: string): number {
  const [h, m] = hora.split(':').map(Number) as [number, number];
  return h * 60 + m;
}

/** 570 -> "09:30" */
export function horaDosMinutos(minutos: number): string {
  return `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;
}

/** 0 = domingo ... 6 = sábado, para uma data "AAAA-MM-DD". */
export function diaDaSemana(data: string): number {
  return new Date(`${data}T12:00:00Z`).getUTCDay();
}

/** "2026-11-25" + n dias. */
export function somarDias(data: string, dias: number): string {
  const d = new Date(`${data}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + dias);
  return d.toISOString().slice(0, 10);
}

/** Id da reserva de horário: {medicoId}_{AAAAMMDDTHHmm} (RN02). */
export function idReservaHorario(medicoId: string, data: string, hora: string): string {
  return `${medicoId}_${data.replace(/-/g, '')}T${hora.replace(':', '')}`;
}

/** Id da reserva do paciente no mesmo horário (RN03). */
export function idReservaPaciente(pacienteId: string, data: string, hora: string): string {
  return `p_${pacienteId}_${data.replace(/-/g, '')}T${hora.replace(':', '')}`;
}

export interface Janela {
  inicio: string;
  fim: string;
  duracaoMinutos: number;
}

/** Fatia as janelas de atendimento em horários: 08:00-10:00 a cada 30 min -> 08:00, 08:30... */
export function fatiarJanelas(janelas: Janela[]): string[] {
  const horarios = new Set<string>();
  for (const janela of janelas) {
    const fim = minutosDoDia(janela.fim);
    for (
      let m = minutosDoDia(janela.inicio);
      m + janela.duracaoMinutos <= fim;
      m += janela.duracaoMinutos
    ) {
      horarios.add(horaDosMinutos(m));
    }
  }
  return [...horarios].sort();
}

/** Nome para o painel de TV (RN26): sem consentimento, primeiro nome + inicial do último. */
export function nomeParaPainel(nome: string, consentiu: boolean): string {
  if (consentiu) return nome;
  const partes = nome.trim().split(/\s+/);
  if (partes.length < 2) return partes[0] ?? '';
  return `${partes[0]} ${partes[partes.length - 1]!.charAt(0).toUpperCase()}.`;
}
