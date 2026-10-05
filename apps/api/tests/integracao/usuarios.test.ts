import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { criarApp } from '../../src/app.js';
import { inicializarFirebase } from '../../src/integrations/firebaseAdmin.js';
import { ambienteDeTeste } from '../apoio/ambiente.js';
import { dadosCadastro } from '../apoio/dados.js';
import { entrar, limparEmuladores } from '../apoio/emulador.js';

const ambiente = ambienteDeTeste();
const firebase = inicializarFirebase(ambiente);
const app = criarApp(ambiente, { firebase, limites: { cadastro: 1000, geral: 1000 } });

const alteracao = {
  nome: 'Maria Teste Souza',
  telefone: '81 98888-7777',
  dataNascimento: '1949-04-01',
  preferencias: { letraGrande: true, altoContraste: true, lembreteWhatsapp: true },
};

async function pacienteLogado(extra: Record<string, unknown> = {}) {
  const dados = dadosCadastro(extra);
  const { body } = await request(app).post('/api/v1/auth/cadastro').send(dados).expect(201);
  return { id: body.id as string, token: await entrar(dados.email, dados.senha), dados };
}

beforeEach(limparEmuladores);

describe('PUT /api/v1/usuarios/me', () => {
  it('atualiza dados e preferências de acessibilidade', async () => {
    const { id, token } = await pacienteLogado({ sexo: 'feminino' });

    const resposta = await request(app)
      .put('/api/v1/usuarios/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...alteracao, consentimento: { exibicaoPainel: true } });

    expect(resposta.status).toBe(200);
    expect(resposta.body).toMatchObject({
      id,
      nome: 'Maria Teste Souza',
      telefone: '5581988887777',
      dataNascimento: '1949-04-01',
      sexo: null,
      preferencias: alteracao.preferencias,
      consentimento: { exibicaoPainel: true },
    });

    const doc = (await firebase.db.doc(`usuarios/${id}`).get()).data()!;
    expect(doc.preferencias).toEqual(alteracao.preferencias);
    expect(doc).not.toHaveProperty('sexo');
    expect(doc.consentimento.exibicaoPainel).toBe(true);
    expect(doc.atualizadoEm.toMillis()).toBeGreaterThanOrEqual(doc.criadoEm.toMillis());
  });

  it('mantém o consentimento do painel quando ele não é enviado', async () => {
    const { id, token } = await pacienteLogado({
      consentimento: { ...dadosCadastro().consentimento, exibicaoPainel: true },
    });

    await request(app)
      .put('/api/v1/usuarios/me')
      .set('Authorization', `Bearer ${token}`)
      .send(alteracao)
      .expect(200);

    const doc = (await firebase.db.doc(`usuarios/${id}`).get()).data()!;
    expect(doc.consentimento.exibicaoPainel).toBe(true);
  });

  it('não deixa trocar perfil, CPF, e-mail ou status', async () => {
    const { id, token } = await pacienteLogado();

    const resposta = await request(app)
      .put('/api/v1/usuarios/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...alteracao, perfil: 'administrativo', cpf: '00000000000' });

    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.codigo).toBe('DADOS_INVALIDOS');
    const doc = (await firebase.db.doc(`usuarios/${id}`).get()).data()!;
    expect(doc.perfil).toBe('paciente');
  });

  it('responde 400 com preferências incompletas', async () => {
    const { token } = await pacienteLogado();

    const resposta = await request(app)
      .put('/api/v1/usuarios/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...alteracao, preferencias: { letraGrande: true } });

    expect(resposta.status).toBe(400);
    const campos = resposta.body.erro.detalhes.map((d: { campo: string }) => d.campo);
    expect(campos).toEqual(
      expect.arrayContaining(['preferencias.altoContraste', 'preferencias.lembreteWhatsapp']),
    );
  });

  it('responde 401 sem token', async () => {
    const resposta = await request(app).put('/api/v1/usuarios/me').send(alteracao);
    expect(resposta.status).toBe(401);
  });

  it('responde 404 se a conta existe no Auth mas não tem documento', async () => {
    const { id, token } = await pacienteLogado();
    await firebase.db.doc(`usuarios/${id}`).delete();

    const resposta = await request(app)
      .put('/api/v1/usuarios/me')
      .set('Authorization', `Bearer ${token}`)
      .send(alteracao);

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro.codigo).toBe('NAO_ENCONTRADO');
  });
});
