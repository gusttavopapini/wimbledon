import { describe, expect, it } from 'vitest';

import { carregarAmbiente } from '../../src/config/env.js';

const BASE = { FIREBASE_PROJECT_ID: 'demo-saude-palma' };

describe('carregarAmbiente', () => {
  it('aplica os padrões documentados no .env.example', () => {
    const ambiente = carregarAmbiente({
      ...BASE,
      FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
      FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
    });

    expect(ambiente.PORT).toBe(3333);
    expect(ambiente.TZ_PADRAO).toBe('America/Recife');
    expect(ambiente.CORS_ORIGINS).toEqual([]);
  });

  it('separa CORS_ORIGINS por vírgula', () => {
    const ambiente = carregarAmbiente({
      ...BASE,
      FIRESTORE_EMULATOR_HOST: 'x',
      FIREBASE_AUTH_EMULATOR_HOST: 'y',
      CORS_ORIGINS: 'http://a.com, http://b.com,',
    });

    expect(ambiente.CORS_ORIGINS).toEqual(['http://a.com', 'http://b.com']);
  });

  it('falha rápido listando as credenciais que faltam fora do emulador', () => {
    expect(() => carregarAmbiente(BASE)).toThrow(
      /FIREBASE_CLIENT_EMAIL[\s\S]*FIREBASE_PRIVATE_KEY/,
    );
  });

  it('falha sem o id do projeto', () => {
    expect(() => carregarAmbiente({})).toThrow(/FIREBASE_PROJECT_ID/);
  });

  it('recusa emulador em produção', () => {
    expect(() =>
      carregarAmbiente({
        ...BASE,
        NODE_ENV: 'production',
        FIRESTORE_EMULATOR_HOST: 'x',
        FIREBASE_AUTH_EMULATOR_HOST: 'y',
      }),
    ).toThrow(/produção/);
  });
});
