import { readdirSync } from 'node:fs';

import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { criarCadastrosBase } from '../../../../infra/seed/cadastros-base.js';
import { criarApp } from '../../src/app.js';
import { inicializarFirebase } from '../../src/integrations/firebaseAdmin.js';
import { ambienteDeTeste } from '../apoio/ambiente.js';
import { limparEmuladores } from '../apoio/emulador.js';

const ambiente = ambienteDeTeste();
const firebase = inicializarFirebase(ambiente);
const app = criarApp(ambiente, { firebase });

const ICONES = readdirSync(
  new URL('../../../../design-system/assets/Especialidades/', import.meta.url),
)
  .filter((arquivo) => arquivo.endsWith('.svg'))
  .map((arquivo) => arquivo.replace('.svg', ''))
  .sort();

beforeEach(limparEmuladores);

describe('seed dos cadastros base', () => {
  it('cria 13 especialidades com o id igual ao arquivo do ícone, 4 unidades e 8 médicos', async () => {
    const resultado = await criarCadastrosBase(firebase);
    expect(resultado).toEqual({
      especialidades: { criadas: 13, existentes: 0 },
      unidades: { criadas: 4, existentes: 0 },
      medicos: { criados: 8, existentes: 0 },
    });

    const { body: esp } = await request(app).get('/api/v1/especialidades').expect(200);
    expect(esp.itens.map((e: { id: string }) => e.id).sort()).toEqual(ICONES);

    const { body: uni } = await request(app).get('/api/v1/unidades').expect(200);
    expect(uni.itens).toHaveLength(4);
    expect(new Set(uni.itens.map((u: { tipo: string }) => u.tipo))).toEqual(
      new Set(['hospital', 'clinica']),
    );
    expect(
      uni.itens.map((u: { endereco: { bairro: string } }) => u.endereco.bairro).sort(),
    ).toEqual(['Boa Vista', 'Derby', 'Ilha do Leite', 'Paissandu']);

    const { body: med } = await request(app).get('/api/v1/medicos').expect(200);
    expect(med.itens).toHaveLength(8);
    for (const m of med.itens) {
      expect(m.especialidadeIds.length).toBeGreaterThanOrEqual(1);
      expect(m.especialidadeIds.length).toBeLessThanOrEqual(2);
      expect(m.nome).toMatch(/^Dra?\. /);
    }
  });

  it('é idempotente: a segunda vez não duplica nada', async () => {
    await criarCadastrosBase(firebase);
    const segunda = await criarCadastrosBase(firebase);
    expect(segunda).toEqual({
      especialidades: { criadas: 0, existentes: 13 },
      unidades: { criadas: 0, existentes: 4 },
      medicos: { criados: 0, existentes: 8 },
    });
    expect((await firebase.db.collection('medicos').get()).size).toBe(8);
  });
});
