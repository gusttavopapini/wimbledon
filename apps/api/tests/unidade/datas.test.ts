import { describe, expect, it } from 'vitest';

import { hojeNoFuso, paraIsoLocal } from '../../src/utils/datas.js';

describe('paraIsoLocal', () => {
  it('converte UTC para o horário do Recife com offset -03:00', () => {
    expect(paraIsoLocal(new Date('2026-10-04T23:44:29.090Z'))).toBe(
      '2026-10-04T20:44:29.090-03:00',
    );
  });

  it('mantém o mesmo instante', () => {
    const instante = new Date('2026-01-01T02:00:00.005Z');
    const local = paraIsoLocal(instante);
    expect(local).toBe('2025-12-31T23:00:00.005-03:00');
    expect(new Date(local).getTime()).toBe(instante.getTime());
  });

  it('respeita outro fuso', () => {
    expect(paraIsoLocal(new Date('2026-07-01T12:00:00.000Z'), 'UTC')).toBe(
      '2026-07-01T12:00:00.000+00:00',
    );
  });
});

describe('hojeNoFuso', () => {
  it('usa a data local, não a de UTC', () => {
    expect(hojeNoFuso('America/Recife', new Date('2026-10-05T01:00:00Z'))).toBe('2026-10-04');
  });
});
