import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { criarApp } from '../../src/app.js';
import { inicializarFirebase } from '../../src/integrations/firebaseAdmin.js';
import { ambienteDeTeste } from '../apoio/ambiente.js';
import { tokenDe } from '../apoio/contas.js';
import { dadosEspecialidade } from '../apoio/dados.js';
import { limparEmuladores } from '../apoio/emulador.js';

const ambiente = ambienteDeTeste();
const firebase = inicializarFirebase(ambiente);
const app = criarApp(ambiente, { firebase, limites: { cadastro: 1000, geral: 10000 } });

let admin: string;
beforeEach(async () => {
  await limparEmuladores();
  admin = (await tokenDe(firebase, 'administrativo')).token;
});

const criar = (dados: Record<string, unknown>, token = admin) =>
  request(app).post('/api/v1/especialidades').set('Authorization', `Bearer ${token}`).send(dados);

describe('POST /api/v1/especialidades', () => {
  it('administrativo cria: 201, Location e id igual ao nome do ícone', async () => {
    const resposta = await criar(dadosEspecialidade({ nome: 'Clínico geral' }));

    expect(resposta.status).toBe(201);
    expect(resposta.headers.location).toBe('/api/v1/especialidades/clinicoGeral');
    expect(resposta.body).toMatchObject({
      id: 'clinicoGeral',
      nome: 'Clínico geral',
      palavrasChave: ['coração', 'pressão alta', 'palpitação'],
      ativa: true,
    });
    expect(resposta.body.criadoEm).toMatch(/-03:00$/);
  });

  it('nome repetido responde 409 ESPECIALIDADE_JA_CADASTRADA', async () => {
    await criar(dadosEspecialidade()).expect(201);
    const resposta = await criar(dadosEspecialidade({ nome: '  cardiologia ' }));
    expect(resposta.status).toBe(409);
    expect(resposta.body.erro.codigo).toBe('ESPECIALIDADE_JA_CADASTRADA');
  });

  it('dados inválidos respondem 400 com detalhe por campo', async () => {
    const resposta = await criar({ nome: 'C', descricao: 'curta' });
    expect(resposta.status).toBe(400);
    const campos = resposta.body.erro.detalhes.map((d: { campo: string }) => d.campo);
    expect(campos).toEqual(expect.arrayContaining(['nome', 'descricao']));
  });

  it.each(['paciente', 'manutencao', 'recepcionista', 'medico'] as const)(
    '%s não cria (403 ACESSO_NEGADO)',
    async (perfil) => {
      const { token } = await tokenDe(firebase, perfil, { unidadeId: 'u1', unidadeIds: ['u1'] });
      const resposta = await criar(dadosEspecialidade(), token);
      expect(resposta.status).toBe(403);
      expect(resposta.body.erro.codigo).toBe('ACESSO_NEGADO');
    },
  );

  it('sem login responde 401', async () => {
    const resposta = await request(app).post('/api/v1/especialidades').send(dadosEspecialidade());
    expect(resposta.status).toBe(401);
  });
});

describe('GET /api/v1/especialidades', () => {
  it('é público, lista só as ativas e em ordem de nome', async () => {
    await criar(dadosEspecialidade({ nome: 'Pediatria' })).expect(201);
    await criar(dadosEspecialidade({ nome: 'Cardiologia' })).expect(201);
    await criar(dadosEspecialidade({ nome: 'Neurologia' })).expect(201);
    await request(app)
      .delete('/api/v1/especialidades/neurologia')
      .set('Authorization', `Bearer ${admin}`)
      .expect(204);

    const resposta = await request(app).get('/api/v1/especialidades');

    expect(resposta.status).toBe(200);
    expect(resposta.body.itens.map((e: { id: string }) => e.id)).toEqual([
      'cardiologia',
      'pediatria',
    ]);
  });

  it('GET por id: 200, 404 se não existe e 400 para id em formato estranho', async () => {
    await criar(dadosEspecialidade()).expect(201);
    expect((await request(app).get('/api/v1/especialidades/cardiologia')).status).toBe(200);
    const inexistente = await request(app).get('/api/v1/especialidades/nao-existe');
    expect(inexistente.status).toBe(404);
    expect(inexistente.body.erro.codigo).toBe('NAO_ENCONTRADO');
    // %2F chegaria como "/" e apontaria para outra coleção.
    expect((await request(app).get('/api/v1/especialidades/a%2Fb')).status).toBe(400);
  });
});

describe('PUT e DELETE /api/v1/especialidades/{id}', () => {
  it('PUT substitui os dados e mantém o id', async () => {
    await criar(dadosEspecialidade()).expect(201);
    const resposta = await request(app)
      .put('/api/v1/especialidades/cardiologia')
      .set('Authorization', `Bearer ${admin}`)
      .send({
        nome: 'Cardiologia',
        descricao: 'Coração, pressão e circulação.',
        palavrasChave: ['coração'],
        ativa: true,
      });
    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({ id: 'cardiologia', palavrasChave: ['coração'] });
  });

  it('DELETE desativa sem apagar, e o PUT reativa', async () => {
    await criar(dadosEspecialidade()).expect(201);
    await request(app)
      .delete('/api/v1/especialidades/cardiologia')
      .set('Authorization', `Bearer ${admin}`)
      .expect(204);

    const doc = await firebase.db.doc('especialidades/cardiologia').get();
    expect(doc.exists).toBe(true);
    expect(doc.get('ativa')).toBe(false);
    expect((await request(app).get('/api/v1/especialidades/cardiologia')).status).toBe(404);

    await request(app)
      .put('/api/v1/especialidades/cardiologia')
      .set('Authorization', `Bearer ${admin}`)
      .send({ ...dadosEspecialidade(), ativa: true })
      .expect(200);
    expect((await request(app).get('/api/v1/especialidades/cardiologia')).status).toBe(200);
  });

  it('PUT e DELETE de id inexistente respondem 404', async () => {
    const auth = { Authorization: `Bearer ${admin}` };
    expect(
      (
        await request(app)
          .put('/api/v1/especialidades/nada')
          .set(auth)
          .send({ ...dadosEspecialidade(), ativa: true })
      ).status,
    ).toBe(404);
    expect((await request(app).delete('/api/v1/especialidades/nada').set(auth)).status).toBe(404);
  });
});
