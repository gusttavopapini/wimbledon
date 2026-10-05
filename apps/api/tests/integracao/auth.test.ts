import { Timestamp } from 'firebase-admin/firestore';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { criarApp } from '../../src/app.js';
import { inicializarFirebase } from '../../src/integrations/firebaseAdmin.js';
import { idTravaCpf, idTravaEmail } from '../../src/repositories/usuarios.repository.js';
import { ambienteDeTeste } from '../apoio/ambiente.js';
import { dadosCadastro, formatarCpf, gerarCpf, gerarEmail } from '../apoio/dados.js';
import { entrar, limparEmuladores } from '../apoio/emulador.js';

const ambiente = ambienteDeTeste();
const firebase = inicializarFirebase(ambiente);
const app = criarApp(ambiente, { firebase, limites: { cadastro: 1000, geral: 1000 } });

beforeEach(limparEmuladores);

describe('POST /api/v1/auth/cadastro', () => {
  it('cria o paciente: 201 com Location, documento, travas e claim', async () => {
    const dados = dadosCadastro({ sexo: 'feminino' });

    const resposta = await request(app).post('/api/v1/auth/cadastro').send(dados);

    expect(resposta.status).toBe(201);
    expect(resposta.body).toEqual({
      id: expect.any(String),
      nome: 'Maria Teste da Silva',
      perfil: 'paciente',
      status: 'ativo',
    });
    const id = resposta.body.id as string;
    expect(resposta.headers.location).toBe(`/api/v1/usuarios/${id}`);

    const doc = (await firebase.db.doc(`usuarios/${id}`).get()).data()!;
    const cpf = dados.cpf.replace(/\D/g, '');
    expect(doc).toMatchObject({
      nome: 'Maria Teste da Silva',
      email: dados.email,
      cpf,
      telefone: '5581999991234',
      dataNascimento: '1948-03-12',
      sexo: 'feminino',
      perfil: 'paciente',
      status: 'ativo',
      criadoPor: id,
      expoPushTokens: [],
      preferencias: { letraGrande: false, altoContraste: false, lembreteWhatsapp: false },
      consentimento: {
        versaoTermo: dados.consentimento.versaoTermo,
        canal: 'app',
        exibicaoPainel: false,
      },
    });
    expect(doc).not.toHaveProperty('senha');
    expect(doc.criadoEm).toBeInstanceOf(Timestamp);
    expect(doc.consentimento.aceitoEm).toBeInstanceOf(Timestamp);

    const travas = await firebase.db.getAll(
      firebase.db.doc(`unicidades/${idTravaCpf(cpf)}`),
      firebase.db.doc(`unicidades/${idTravaEmail(dados.email)}`),
    );
    expect(travas.map((t) => t.get('uid'))).toEqual([id, id]);

    const conta = await firebase.auth.getUser(id);
    expect(conta.email).toBe(dados.email);
    expect(conta.customClaims).toEqual({ perfil: 'paciente' });
  });

  it('responde 400 DADOS_INVALIDOS com a mensagem do glossário por campo', async () => {
    const resposta = await request(app)
      .post('/api/v1/auth/cadastro')
      .send(dadosCadastro({ cpf: '1234567890', email: 'ana@gmail', dataNascimento: '1948-02-30' }));

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro).toMatchObject({
      codigo: 'DADOS_INVALIDOS',
      requestId: resposta.headers['x-request-id'],
    });
    expect(resposta.body.erro.detalhes).toEqual(
      expect.arrayContaining([
        {
          campo: 'cpf',
          mensagem: 'Falta 1 número. Confira no seu documento e digite os 11 números.',
        },
        { campo: 'email', mensagem: 'Falta o final do e-mail. Exemplo: ana@gmail.com' },
        {
          campo: 'dataNascimento',
          mensagem: 'Essa data não existe. Confira o dia e o mês. Exemplo: 12/03/1948',
        },
      ]),
    );
  });

  it('exige o aceite do termo vigente', async () => {
    const semAceite = await request(app)
      .post('/api/v1/auth/cadastro')
      .send(
        dadosCadastro({
          consentimento: { versaoTermo: '2020-01-01', aceito: false, exibicaoPainel: false },
        }),
      );

    expect(semAceite.status).toBe(400);
    const campos = semAceite.body.erro.detalhes.map((d: { campo: string }) => d.campo);
    expect(campos).toEqual(
      expect.arrayContaining(['consentimento.versaoTermo', 'consentimento.aceito']),
    );
  });

  it('não deixa o cliente escolher perfil ou status', async () => {
    const resposta = await request(app)
      .post('/api/v1/auth/cadastro')
      .send(dadosCadastro({ perfil: 'administrativo', status: 'ativo' }));

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.detalhes[0].mensagem).toBe('Campo não aceito aqui: perfil, status.');
  });

  it('responde 409 CPF_JA_CADASTRADO para CPF repetido, mesmo com outra máscara', async () => {
    const cpf = gerarCpf();
    await request(app).post('/api/v1/auth/cadastro').send(dadosCadastro({ cpf })).expect(201);

    const resposta = await request(app)
      .post('/api/v1/auth/cadastro')
      .send(dadosCadastro({ cpf: formatarCpf(cpf) }));

    expect(resposta.status).toBe(409);
    expect(resposta.body.erro.codigo).toBe('CPF_JA_CADASTRADO');
  });

  it('responde 409 EMAIL_JA_CADASTRADO para e-mail repetido, ignorando maiúsculas', async () => {
    const email = gerarEmail();
    await request(app).post('/api/v1/auth/cadastro').send(dadosCadastro({ email })).expect(201);

    const resposta = await request(app)
      .post('/api/v1/auth/cadastro')
      .send(dadosCadastro({ email: email.toUpperCase() }));

    expect(resposta.status).toBe(409);
    expect(resposta.body.erro.codigo).toBe('EMAIL_JA_CADASTRADO');
  });

  it('dois cadastros simultâneos com o mesmo CPF: exatamente um 201 e um 409', async () => {
    const cpf = gerarCpf();

    const respostas = await Promise.all([
      request(app).post('/api/v1/auth/cadastro').send(dadosCadastro({ cpf })),
      request(app)
        .post('/api/v1/auth/cadastro')
        .send(dadosCadastro({ cpf: formatarCpf(cpf) })),
    ]);

    expect(respostas.map((r) => r.status).sort()).toEqual([201, 409]);
    expect(respostas.find((r) => r.status === 409)?.body.erro.codigo).toBe('CPF_JA_CADASTRADO');

    // Nada sobrou do perdedor: um único usuário com esse CPF, no Firestore e no Auth.
    const comCpf = await firebase.db.collection('usuarios').where('cpf', '==', cpf).get();
    expect(comCpf.size).toBe(1);
    const { users } = await firebase.auth.listUsers();
    expect(users).toHaveLength(1);
  });

  it('dois cadastros simultâneos com o mesmo e-mail: exatamente um 201 e um 409', async () => {
    const email = gerarEmail();

    const respostas = await Promise.all([
      request(app).post('/api/v1/auth/cadastro').send(dadosCadastro({ email })),
      request(app).post('/api/v1/auth/cadastro').send(dadosCadastro({ email })),
    ]);

    expect(respostas.map((r) => r.status).sort()).toEqual([201, 409]);
  });

  it('responde 409 se o e-mail já existe no Auth sem trava, e não deixa resto', async () => {
    const email = gerarEmail();
    await firebase.auth.createUser({ email, password: 'outra-senha-123' });
    const cpf = gerarCpf();

    const resposta = await request(app)
      .post('/api/v1/auth/cadastro')
      .send(dadosCadastro({ email, cpf }));

    expect(resposta.status).toBe(409);
    expect(resposta.body.erro.codigo).toBe('EMAIL_JA_CADASTRADO');
    expect((await firebase.db.doc(`unicidades/${idTravaCpf(cpf)}`).get()).exists).toBe(false);
    expect((await firebase.db.collection('usuarios').get()).size).toBe(0);
  });

  it('responde 429 LIMITE_EXCEDIDO quando passa do limite de cadastros', async () => {
    const limitado = criarApp(ambiente, { firebase, limites: { cadastro: 1 } });
    await request(limitado).post('/api/v1/auth/cadastro').send(dadosCadastro()).expect(201);

    const resposta = await request(limitado).post('/api/v1/auth/cadastro').send(dadosCadastro());

    expect(resposta.status).toBe(429);
    expect(resposta.body.erro).toMatchObject({
      codigo: 'LIMITE_EXCEDIDO',
      requestId: expect.any(String),
    });
  });
});

describe('GET /api/v1/auth/me', () => {
  it('responde 401 NAO_AUTENTICADO sem token', async () => {
    const resposta = await request(app).get('/api/v1/auth/me');
    expect(resposta.status).toBe(401);
    expect(resposta.body.erro.codigo).toBe('NAO_AUTENTICADO');
  });

  it('responde 401 com token inválido', async () => {
    const resposta = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', 'Bearer nao-e-um-token');
    expect(resposta.status).toBe(401);
  });

  it('devolve o usuário e o perfil, com datas em -03:00', async () => {
    const dados = dadosCadastro();
    const { body } = await request(app).post('/api/v1/auth/cadastro').send(dados).expect(201);
    const token = await entrar(dados.email, dados.senha);

    const resposta = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(200);
    expect(resposta.body.perfil).toBe('paciente');
    expect(resposta.body.usuario).toMatchObject({
      id: body.id,
      nome: dados.nome,
      email: dados.email,
      perfil: 'paciente',
      status: 'ativo',
      unidadeId: null,
      unidadeIds: [],
    });
    expect(resposta.body.usuario.criadoEm).toMatch(/-03:00$/);
    expect(resposta.body.usuario.consentimento.aceitoEm).toMatch(/-03:00$/);
  });

  it('responde 401 depois que a conta é desativada no Auth', async () => {
    const dados = dadosCadastro();
    const { body } = await request(app).post('/api/v1/auth/cadastro').send(dados).expect(201);
    const token = await entrar(dados.email, dados.senha);
    await firebase.auth.updateUser(body.id, { disabled: true });

    const resposta = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(resposta.status).toBe(401);
  });
});
