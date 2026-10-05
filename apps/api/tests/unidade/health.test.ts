import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { criarApp } from '../../src/app.js';
import { VERSAO_API } from '../../src/config/versao.js';
import { ambienteDeTeste } from '../apoio/ambiente.js';

describe('GET /health', () => {
  const app = criarApp(ambienteDeTeste());

  it('responde 200 com status, versão e momento em ISO 8601 com offset -03:00', async () => {
    const resposta = await request(app).get('/health');

    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ status: 'ok', versao: VERSAO_API, em: expect.any(String) });
    expect(resposta.body.em).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}-03:00$/);
    expect(Number.isNaN(Date.parse(resposta.body.em))).toBe(false);
  });

  it('responde 404 no formato padrão para rota que não existe', async () => {
    const resposta = await request(app).get('/api/v1/nao-existe');

    expect(resposta.status).toBe(404);
    expect(resposta.body.erro).toMatchObject({
      codigo: 'NAO_ENCONTRADO',
      requestId: resposta.headers['x-request-id'],
    });
  });

  it('devolve um X-Request-Id para rastrear a requisição nos logs', async () => {
    const resposta = await request(app).get('/health');

    expect(resposta.headers['x-request-id']).toMatch(/^[\w-]{8,64}$/);
  });

  it('serve a especificação OpenAPI em /api/docs/openapi.json', async () => {
    const resposta = await request(app).get('/api/docs/openapi.json');

    expect(resposta.status).toBe(200);
    expect(resposta.body.openapi).toBe('3.1.0');
    expect(resposta.body.paths).toHaveProperty('/health');
  });
});
