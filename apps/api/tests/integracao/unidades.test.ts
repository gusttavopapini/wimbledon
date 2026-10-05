import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { criarApp } from '../../src/app.js';
import { inicializarFirebase } from '../../src/integrations/firebaseAdmin.js';
import { ambienteDeTeste } from '../apoio/ambiente.js';
import { tokenDe } from '../apoio/contas.js';
import { dadosEspecialidade, dadosUnidade, gerarCnpj } from '../apoio/dados.js';
import { limparEmuladores } from '../apoio/emulador.js';

const ambiente = ambienteDeTeste();
const firebase = inicializarFirebase(ambiente);
const app = criarApp(ambiente, { firebase, limites: { cadastro: 1000, geral: 10000 } });

let admin: string;
const comAdmin = () => ({ Authorization: `Bearer ${admin}` });
const criar = (dados: Record<string, unknown>) =>
  request(app).post('/api/v1/unidades').set(comAdmin()).send(dados);

beforeEach(async () => {
  await limparEmuladores();
  admin = (await tokenDe(firebase, 'administrativo')).token;
  for (const nome of ['Cardiologia', 'Pediatria']) {
    await request(app)
      .post('/api/v1/especialidades')
      .set(comAdmin())
      .send(dadosEspecialidade({ nome }))
      .expect(201);
  }
});

describe('POST /api/v1/unidades', () => {
  it('cria normalizando CNPJ, UF, telefone e gerando bairroBusca', async () => {
    const dados = dadosUnidade(['cardiologia'], {
      nome: 'Clínica Teste do Derby',
      tipo: 'clinica',
      endereco: { ...dadosUnidade([]).endereco, bairro: 'Derby' },
    });

    const resposta = await criar(dados);

    expect(resposta.status).toBe(201);
    expect(resposta.headers.location).toBe(`/api/v1/unidades/${resposta.body.id}`);
    expect(resposta.body).toMatchObject({
      nome: 'Clínica Teste do Derby',
      tipo: 'clinica',
      cnpj: dados.cnpj,
      telefone: '558133331234',
      bairroBusca: 'derby',
      endereco: { uf: 'PE', cep: '50070000', bairro: 'Derby' },
      ativa: true,
    });
  });

  it('especialidade inexistente responde 422 ESPECIALIDADE_NAO_CADASTRADA', async () => {
    const resposta = await criar(dadosUnidade(['cardiologia', 'astrologia']));
    expect(resposta.status).toBe(422);
    expect(resposta.body.erro.codigo).toBe('ESPECIALIDADE_NAO_CADASTRADA');
    expect(resposta.body.erro.detalhes[0].mensagem).toContain('astrologia');
  });

  it('CNPJ repetido responde 409 CNPJ_JA_CADASTRADO', async () => {
    const cnpj = gerarCnpj();
    await criar(dadosUnidade(['cardiologia'], { cnpj })).expect(201);
    const resposta = await criar(dadosUnidade(['pediatria'], { cnpj, nome: 'Outra Unidade' }));
    expect(resposta.status).toBe(409);
    expect(resposta.body.erro.codigo).toBe('CNPJ_JA_CADASTRADO');
  });

  it('CNPJ com dígito errado responde 400 dizendo o que fazer', async () => {
    const resposta = await criar(dadosUnidade(['cardiologia'], { cnpj: '11222333000100' }));
    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.detalhes[0]).toEqual({
      campo: 'cnpj',
      mensagem: 'Esse CNPJ não confere. Confira os números no cartão do CNPJ.',
    });
  });

  it('só o administrativo cria (manutenção recebe 403)', async () => {
    const { token } = await tokenDe(firebase, 'manutencao', { unidadeId: 'u1' });
    const resposta = await request(app)
      .post('/api/v1/unidades')
      .set('Authorization', `Bearer ${token}`)
      .send(dadosUnidade(['cardiologia']));
    expect(resposta.status).toBe(403);
  });
});

describe('GET /api/v1/unidades (público)', () => {
  beforeEach(async () => {
    const base = dadosUnidade([]).endereco;
    await criar(dadosUnidade(['cardiologia', 'pediatria'], { nome: 'Hospital das Marés' }));
    await criar(
      dadosUnidade(['cardiologia'], {
        nome: 'Clínica Vento',
        tipo: 'clinica',
        endereco: { ...base, bairro: 'Boa Vista', logradouro: 'Rua da Aurora' },
      }),
    );
    const inativa = await criar(dadosUnidade(['cardiologia'], { nome: 'Unidade Fechada' }));
    await request(app).delete(`/api/v1/unidades/${inativa.body.id}`).set(comAdmin()).expect(204);
  });

  const nomes = async (query: string) =>
    (await request(app).get(`/api/v1/unidades${query}`).expect(200)).body.itens.map(
      (u: { nome: string }) => u.nome,
    );

  it('lista só as ativas, por nome', async () => {
    expect(await nomes('')).toEqual(['Clínica Vento', 'Hospital das Marés']);
  });

  it('filtra por especialidade', async () => {
    expect(await nomes('?especialidadeId=pediatria')).toEqual(['Hospital das Marés']);
  });

  it('filtra por bairro sem diferenciar maiúscula e acento', async () => {
    expect(await nomes('?bairro=ILHA%20DO%20LEITE')).toEqual(['Hospital das Marés']);
  });

  it('busca por trecho do nome, do bairro ou da rua, sem acento', async () => {
    expect(await nomes('?busca=mares')).toEqual(['Hospital das Marés']);
    expect(await nomes('?busca=boa%20vis')).toEqual(['Clínica Vento']);
    expect(await nomes('?busca=aurora&especialidadeId=cardiologia')).toEqual(['Clínica Vento']);
  });

  it('filtro desconhecido responde 400', async () => {
    expect((await request(app).get('/api/v1/unidades?cidade=Recife')).status).toBe(400);
  });
});

describe('PUT e DELETE /api/v1/unidades/{id}', () => {
  it('trocar o CNPJ libera o antigo; usar um CNPJ de outra unidade dá 409', async () => {
    const cnpjA = gerarCnpj();
    const cnpjB = gerarCnpj();
    const a = await criar(dadosUnidade(['cardiologia'], { cnpj: cnpjA }));
    await criar(dadosUnidade(['cardiologia'], { cnpj: cnpjB, nome: 'Unidade B' })).expect(201);
    const novo = gerarCnpj();

    const troca = await request(app)
      .put(`/api/v1/unidades/${a.body.id}`)
      .set(comAdmin())
      .send({ ...dadosUnidade(['pediatria'], { cnpj: novo }), ativa: true });
    expect(troca.status).toBe(200);
    expect(troca.body).toMatchObject({ cnpj: novo, especialidadeIds: ['pediatria'] });

    await criar(dadosUnidade(['cardiologia'], { cnpj: cnpjA, nome: 'Reaproveita' })).expect(201);
    const conflito = await request(app)
      .put(`/api/v1/unidades/${a.body.id}`)
      .set(comAdmin())
      .send({ ...dadosUnidade(['cardiologia'], { cnpj: cnpjB }), ativa: true });
    expect(conflito.status).toBe(409);
  });

  it('DELETE desativa sem apagar o documento', async () => {
    const { body } = await criar(dadosUnidade(['cardiologia']));
    await request(app).delete(`/api/v1/unidades/${body.id}`).set(comAdmin()).expect(204);
    expect((await firebase.db.doc(`unidades/${body.id}`).get()).get('ativa')).toBe(false);
    expect((await request(app).get(`/api/v1/unidades/${body.id}`)).status).toBe(404);
  });

  it('PUT e DELETE de unidade inexistente respondem 404', async () => {
    expect(
      (
        await request(app)
          .put('/api/v1/unidades/naoExiste')
          .set(comAdmin())
          .send({ ...dadosUnidade(['cardiologia']), ativa: true })
      ).status,
    ).toBe(404);
    expect((await request(app).delete('/api/v1/unidades/naoExiste').set(comAdmin())).status).toBe(
      404,
    );
  });
});
