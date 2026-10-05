import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { criarApp } from '../../src/app.js';
import { VERSAO_TERMO_ATUAL } from '../../src/config/termo.js';
import { inicializarFirebase } from '../../src/integrations/firebaseAdmin.js';
import { criarUsuariosRepository } from '../../src/repositories/usuarios.repository.js';
import { criarAuthService } from '../../src/services/auth.service.js';
import { ambienteDeTeste } from '../apoio/ambiente.js';
import { tokenDe } from '../apoio/contas.js';
import {
  dadosEspecialidade,
  dadosMedico,
  dadosUnidade,
  gerarCpf,
  gerarEmail,
} from '../apoio/dados.js';
import { entrar, limparEmuladores } from '../apoio/emulador.js';

const ambiente = ambienteDeTeste();
const firebase = inicializarFirebase(ambiente);
const app = criarApp(ambiente, { firebase, limites: { cadastro: 1000, geral: 10000 } });

let admin: { uid: string; token: string };
let manutencaoA: string;
let unidadeA: string;
let unidadeB: string;
const bearer = (token: string) => ({ Authorization: `Bearer ${token}` });

async function criarMedico(extra: Record<string, unknown> = {}) {
  const resposta = await request(app)
    .post('/api/v1/medicos')
    .set(bearer(admin.token))
    .send(dadosMedico(['cardiologia'], [unidadeA], extra));
  expect(resposta.status).toBe(201);
  return resposta.body as { id: string };
}

beforeEach(async () => {
  await limparEmuladores();
  admin = await tokenDe(firebase, 'administrativo');
  for (const nome of ['Cardiologia', 'Pediatria']) {
    await request(app)
      .post('/api/v1/especialidades')
      .set(bearer(admin.token))
      .send(dadosEspecialidade({ nome }))
      .expect(201);
  }
  const criarUnidade = async (nome: string) =>
    (
      await request(app)
        .post('/api/v1/unidades')
        .set(bearer(admin.token))
        .send(dadosUnidade(['cardiologia', 'pediatria'], { nome }))
        .expect(201)
    ).body.id as string;
  unidadeA = await criarUnidade('Unidade A');
  unidadeB = await criarUnidade('Unidade B');
  manutencaoA = (await tokenDe(firebase, 'manutencao', { unidadeId: unidadeA })).token;
});

describe('POST /api/v1/medicos', () => {
  it('administrativo cadastra: 201, Location e quem cadastrou', async () => {
    const resposta = await request(app)
      .post('/api/v1/medicos')
      .set(bearer(admin.token))
      .send(
        dadosMedico(['cardiologia'], [unidadeA], {
          conselho: { tipo: 'CRM', numero: '012345', uf: 'pe' },
        }),
      );

    expect(resposta.status).toBe(201);
    expect(resposta.headers.location).toBe(`/api/v1/medicos/${resposta.body.id}`);
    expect(resposta.body).toMatchObject({
      nome: 'Dra. Helena Teste Duarte',
      conselho: { tipo: 'CRM', numero: '12345', uf: 'PE' },
      unidadeIds: [unidadeA],
      usuarioId: null,
      criadoPorAdministrativo: admin.uid,
      ativo: true,
    });
  });

  it('a manutenção não cadastra médico (403 ACESSO_NEGADO)', async () => {
    const resposta = await request(app)
      .post('/api/v1/medicos')
      .set(bearer(manutencaoA))
      .send(dadosMedico(['cardiologia'], [unidadeA]));
    expect(resposta.status).toBe(403);
    expect(resposta.body.erro.codigo).toBe('ACESSO_NEGADO');
  });

  it('registro repetido no conselho responde 409 CONSELHO_JA_CADASTRADO', async () => {
    const conselho = { tipo: 'CRM', numero: '765432', uf: 'PE' };
    await criarMedico({ conselho });
    const resposta = await request(app)
      .post('/api/v1/medicos')
      .set(bearer(admin.token))
      .send(dadosMedico(['pediatria'], [unidadeB], { conselho, nome: 'Dr. Outro Nome' }));
    expect(resposta.status).toBe(409);
    expect(resposta.body.erro.codigo).toBe('CONSELHO_JA_CADASTRADO');
  });

  it('unidade ou especialidade inexistente responde 422', async () => {
    const semUnidade = await request(app)
      .post('/api/v1/medicos')
      .set(bearer(admin.token))
      .send(dadosMedico(['cardiologia'], ['naoExiste']));
    expect(semUnidade.status).toBe(422);
    expect(semUnidade.body.erro.codigo).toBe('UNIDADE_NAO_CADASTRADA');

    const semEspecialidade = await request(app)
      .post('/api/v1/medicos')
      .set(bearer(admin.token))
      .send(dadosMedico(['astrologia'], [unidadeA]));
    expect(semEspecialidade.body.erro.codigo).toBe('ESPECIALIDADE_NAO_CADASTRADA');
  });

  it('usuarioId de quem não é médico responde 422 USUARIO_NAO_E_MEDICO', async () => {
    const resposta = await request(app)
      .post('/api/v1/medicos')
      .set(bearer(admin.token))
      .send(dadosMedico(['cardiologia'], [unidadeA], { usuarioId: admin.uid }));
    expect(resposta.status).toBe(422);
    expect(resposta.body.erro.codigo).toBe('USUARIO_NAO_E_MEDICO');
  });
});

describe('GET /api/v1/medicos (público)', () => {
  it('filtra por unidade, por especialidade e pelas duas, sem expor a conta ligada', async () => {
    await criarMedico({ nome: 'Dr. Bruno Cardoso' });
    await request(app)
      .post('/api/v1/medicos')
      .set(bearer(admin.token))
      .send(dadosMedico(['pediatria'], [unidadeA, unidadeB], { nome: 'Dra. Ana Pires' }))
      .expect(201);

    const nomes = async (query: string) => {
      const { body } = await request(app).get(`/api/v1/medicos${query}`).expect(200);
      for (const m of body.itens) expect(m).not.toHaveProperty('usuarioId');
      return body.itens.map((m: { nome: string }) => m.nome);
    };

    expect(await nomes('')).toEqual(['Dr. Bruno Cardoso', 'Dra. Ana Pires']);
    expect(await nomes(`?unidadeId=${unidadeB}`)).toEqual(['Dra. Ana Pires']);
    expect(await nomes('?especialidadeId=cardiologia')).toEqual(['Dr. Bruno Cardoso']);
    expect(await nomes(`?unidadeId=${unidadeA}&especialidadeId=pediatria`)).toEqual([
      'Dra. Ana Pires',
    ]);
  });
});

describe('alocação: POST e DELETE /api/v1/medicos/{id}/unidades', () => {
  const alocar = (id: string, unidadeId: string, token: string) =>
    request(app).post(`/api/v1/medicos/${id}/unidades`).set(bearer(token)).send({ unidadeId });
  const desalocar = (id: string, unidadeId: string, token: string) =>
    request(app).delete(`/api/v1/medicos/${id}/unidades/${unidadeId}`).set(bearer(token));

  it('manutenção aloca na própria unidade: 201 com Location, depois 200 (idempotente)', async () => {
    const { id } = await request(app)
      .post('/api/v1/medicos')
      .set(bearer(admin.token))
      .send(dadosMedico(['cardiologia'], [unidadeB]))
      .then((r) => r.body);

    const primeira = await alocar(id, unidadeA, manutencaoA);
    expect(primeira.status).toBe(201);
    expect(primeira.headers.location).toBe(`/api/v1/medicos/${id}/unidades/${unidadeA}`);
    expect(primeira.body.unidadeIds).toEqual([unidadeB, unidadeA]);

    const segunda = await alocar(id, unidadeA, manutencaoA);
    expect(segunda.status).toBe(200);
  });

  it('manutenção de uma unidade não aloca nem desaloca em outra (403 FORA_DA_UNIDADE)', async () => {
    const { id } = await criarMedico();
    await alocar(id, unidadeB, admin.token).expect(201);

    const aloca = await alocar(id, unidadeB, manutencaoA);
    expect(aloca.status).toBe(403);
    expect(aloca.body.erro.codigo).toBe('FORA_DA_UNIDADE');

    const desaloca = await desalocar(id, unidadeB, manutencaoA);
    expect(desaloca.status).toBe(403);
    expect(desaloca.body.erro.codigo).toBe('FORA_DA_UNIDADE');
  });

  it('recepcionista e paciente não alocam (403 ACESSO_NEGADO)', async () => {
    const { id } = await criarMedico();
    const recepcao = (await tokenDe(firebase, 'recepcionista', { unidadeId: unidadeA })).token;
    const paciente = (await tokenDe(firebase, 'paciente')).token;
    expect((await alocar(id, unidadeA, recepcao)).body.erro.codigo).toBe('ACESSO_NEGADO');
    expect((await alocar(id, unidadeA, paciente)).body.erro.codigo).toBe('ACESSO_NEGADO');
  });

  it('alocar médico inexistente responde 422 MEDICO_NAO_CADASTRADO', async () => {
    const resposta = await alocar('medicoQueNaoExiste', unidadeA, manutencaoA);
    expect(resposta.status).toBe(422);
    expect(resposta.body.erro.codigo).toBe('MEDICO_NAO_CADASTRADO');
  });

  it('alocar médico desativado responde 422 MEDICO_INATIVO', async () => {
    const { id } = await criarMedico();
    await request(app).delete(`/api/v1/medicos/${id}`).set(bearer(admin.token)).expect(204);
    const resposta = await alocar(id, unidadeA, manutencaoA);
    expect(resposta.status).toBe(422);
    expect(resposta.body.erro.codigo).toBe('MEDICO_INATIVO');
  });

  it('desalocar responde 204, também quando já não estava na unidade', async () => {
    const { id } = await criarMedico();
    expect((await desalocar(id, unidadeA, manutencaoA)).status).toBe(204);
    expect((await desalocar(id, unidadeA, manutencaoA)).status).toBe(204);
    const { body } = await request(app).get(`/api/v1/medicos/${id}`);
    expect(body.unidadeIds).toEqual([]);
  });

  it('sem unidadeId no corpo responde 400', async () => {
    const { id } = await criarMedico();
    const resposta = await request(app)
      .post(`/api/v1/medicos/${id}/unidades`)
      .set(bearer(manutencaoA))
      .send({});
    expect(resposta.status).toBe(400);
  });
});

describe('conta do médico: unidades nas claims acompanham o cadastro', () => {
  async function contaDeMedico() {
    const email = gerarEmail('medico');
    const senha = 'senha-de-teste-123';
    const authService = criarAuthService({
      auth: firebase.auth,
      usuarios: criarUsuariosRepository(firebase.db),
    });
    const conta = await authService.criarConta({
      nome: 'Dra. Conta Teste',
      cpf: gerarCpf(),
      email,
      senha,
      perfil: 'medico',
      unidadeIds: [unidadeA],
      status: 'ativo',
      consentimento: {
        versaoTermo: VERSAO_TERMO_ATUAL,
        aceitoEm: new Date(),
        canal: 'seed',
        exibicaoPainel: false,
      },
    });
    return { uid: conta.id, email, senha };
  }

  it('alocar soma a unidade nas claims; desalocar tira e derruba a sessão', async () => {
    const conta = await contaDeMedico();
    const { id } = await criarMedico({ usuarioId: conta.uid });

    await request(app)
      .post(`/api/v1/medicos/${id}/unidades`)
      .set(bearer(admin.token))
      .send({ unidadeId: unidadeB })
      .expect(201);
    expect((await firebase.auth.getUser(conta.uid)).customClaims).toEqual({
      perfil: 'medico',
      unidadeIds: [unidadeA, unidadeB],
    });

    const tokenAntigo = await entrar(conta.email, conta.senha);
    // A revogação vale para tokens emitidos antes dela (resolução de 1 segundo).
    await new Promise((r) => setTimeout(r, 1100));
    await request(app)
      .delete(`/api/v1/medicos/${id}/unidades/${unidadeA}`)
      .set(bearer(admin.token))
      .expect(204);

    expect((await firebase.auth.getUser(conta.uid)).customClaims).toEqual({
      perfil: 'medico',
      unidadeIds: [unidadeB],
    });
    expect((await firebase.db.doc(`usuarios/${conta.uid}`).get()).get('unidadeIds')).toEqual([
      unidadeB,
    ]);
    const me = await request(app).get('/api/v1/auth/me').set(bearer(tokenAntigo));
    expect(me.status).toBe(401);
  });

  it('desativar o médico tira todas as unidades da conta', async () => {
    const conta = await contaDeMedico();
    const { id } = await criarMedico({ usuarioId: conta.uid });
    await request(app).delete(`/api/v1/medicos/${id}`).set(bearer(admin.token)).expect(204);
    expect((await firebase.auth.getUser(conta.uid)).customClaims).toEqual({ perfil: 'medico' });
  });
});

describe('PUT e DELETE /api/v1/medicos/{id}', () => {
  it('PUT substitui e pode trocar o registro no conselho', async () => {
    const { id } = await criarMedico();
    const resposta = await request(app)
      .put(`/api/v1/medicos/${id}`)
      .set(bearer(admin.token))
      .send({
        ...dadosMedico(['cardiologia', 'pediatria'], [unidadeA, unidadeB]),
        nome: 'Dra. Helena Duarte',
        ativo: true,
      });
    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({
      nome: 'Dra. Helena Duarte',
      especialidadeIds: ['cardiologia', 'pediatria'],
    });
  });

  it('DELETE desativa sem apagar; a manutenção não pode', async () => {
    const { id } = await criarMedico();
    expect(
      (await request(app).delete(`/api/v1/medicos/${id}`).set(bearer(manutencaoA))).status,
    ).toBe(403);
    await request(app).delete(`/api/v1/medicos/${id}`).set(bearer(admin.token)).expect(204);
    expect((await firebase.db.doc(`medicos/${id}`).get()).get('ativo')).toBe(false);
    expect((await request(app).get(`/api/v1/medicos/${id}`)).status).toBe(404);
  });
});
