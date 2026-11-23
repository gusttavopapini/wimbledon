import { describe, expect, it } from 'vitest';

import { extrairJson } from '../../src/integrations/ia/claudeClient.js';
import { ordenarFila } from '../../src/services/chamados.service.js';
import { checarAlertas, idadeDe } from '../../src/services/triagem.service.js';
import type { Chamado } from '../../src/types/atendimento.js';
import {
  diaDaSemana,
  fatiarJanelas,
  idReservaHorario,
  instanteLocal,
  nomeParaPainel,
  somarDias,
} from '../../src/utils/agenda.js';

describe('agenda', () => {
  it('converte dia e hora de Recife para UTC', () => {
    expect(instanteLocal('2026-11-25', '09:30').toISOString()).toBe('2026-11-25T12:30:00.000Z');
  });

  it('fatia as janelas em horários sem repetir', () => {
    expect(
      fatiarJanelas([
        { inicio: '08:00', fim: '09:30', duracaoMinutos: 30 },
        { inicio: '09:00', fim: '10:00', duracaoMinutos: 30 },
      ]),
    ).toEqual(['08:00', '08:30', '09:00', '09:30']);
  });

  it('não cria horário que passa do fim da janela', () => {
    expect(fatiarJanelas([{ inicio: '08:00', fim: '08:50', duracaoMinutos: 30 }])).toEqual([
      '08:00',
    ]);
  });

  it('calcula dia da semana e soma dias', () => {
    expect(diaDaSemana('2026-11-22')).toBe(0); // domingo
    expect(somarDias('2026-11-30', 1)).toBe('2026-12-01');
  });

  it('gera o id determinístico da reserva (RN02)', () => {
    expect(idReservaHorario('med1', '2026-11-25', '09:30')).toBe('med1_20261125T0930');
  });

  it('RN26: sem consentimento mostra primeiro nome e inicial', () => {
    expect(nomeParaPainel('Maria das Dores Silva', false)).toBe('Maria S.');
    expect(nomeParaPainel('Maria das Dores Silva', true)).toBe('Maria das Dores Silva');
  });
});

describe('fila (RN22)', () => {
  const base = (parcial: Partial<Chamado>) => parcial as Chamado;
  it('ordena por urgência, horário agendado e chegada', () => {
    const lista = [
      base({
        id: 'a',
        urgencia: 'rotina',
        inicio: new Date('2026-11-25T12:00:00Z'),
        chegadaEm: new Date(1),
      }),
      base({ id: 'b', urgencia: 'prioritario', inicio: null, chegadaEm: new Date(5) }),
      base({
        id: 'c',
        urgencia: 'rotina',
        inicio: new Date('2026-11-25T11:30:00Z'),
        chegadaEm: new Date(9),
      }),
      base({ id: 'd', urgencia: 'rotina', inicio: null, chegadaEm: new Date(2) }),
    ];
    expect(lista.sort(ordenarFila).map((c) => c.id)).toEqual(['b', 'c', 'a', 'd']);
  });
});

describe('pré-triagem', () => {
  it('detecta sinais de alerta sem depender da IA', () => {
    expect(checarAlertas('Estou com uma dor no peito desde cedo').sinais).toContain('Dor no peito');
    expect(checarAlertas('Às vezes penso em me matar').autolesao).toBe(true);
    expect(checarAlertas('Dor no joelho quando subo escada').sinais).toEqual([]);
  });

  it('extrai o JSON mesmo cercado de texto', () => {
    expect(extrairJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(extrairJson('sem json')).toBeNull();
  });

  it('calcula a idade', () => {
    expect(idadeDe('1950-11-23', '2026-11-22')).toBe(75);
    expect(idadeDe('1950-11-22', '2026-11-22')).toBe(76);
  });
});
