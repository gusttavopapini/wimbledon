import express, { type RequestHandler } from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';

import { AppError } from '../../src/errors/AppError.js';
import { autenticar } from '../../src/middlewares/autenticar.js';
import { errorHandler, rotaNaoEncontrada } from '../../src/middlewares/errorHandler.js';
import { exigirPerfil } from '../../src/middlewares/exigirPerfil.js';
import { exigirUnidade } from '../../src/middlewares/exigirUnidade.js';
import { validar } from '../../src/middlewares/validar.js';
import type { UsuarioAutenticado } from '../../src/types/express.js';

/** App mínimo: middlewares sob teste + rota que ecoa req.usuario + errorHandler. */
function montar(...middlewares: RequestHandler[]) {
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as { id?: string }).id = 'req-teste';
    next();
  });
  app.all('/{*resto}', ...middlewares, (req, res) => {
    res.json({ usuario: req.usuario ?? null, body: req.body ?? null, query: req.query });
  });
  app.use(rotaNaoEncontrada);
  app.use(errorHandler);
  return app;
}

function comUsuario(usuario: Partial<UsuarioAutenticado>): RequestHandler {
  return (req, _res, next) => {
    req.usuario = { uid: 'u1', unidadeIds: [], ...usuario };
    next();
  };
}

describe('autenticar', () => {
  const auth = {
    verifyIdToken: vi.fn(async (token: string) => {
      if (token !== 'token-bom')
        throw Object.assign(new Error('x'), { code: 'auth/argument-error' });
      return {
        uid: 'u1',
        email: 'a@b.test',
        perfil: 'medico',
        unidadeIds: ['un-1', 42, 'un-2'],
      } as never;
    }),
  };

  it('responde 401 NAO_AUTENTICADO sem o cabeçalho Authorization', async () => {
    const resposta = await request(montar(autenticar(auth))).get('/x');

    expect(resposta.status).toBe(401);
    expect(resposta.body).toEqual({
      erro: {
        codigo: 'NAO_AUTENTICADO',
        mensagem: 'Entre na sua conta para continuar.',
        detalhes: null,
        requestId: 'req-teste',
      },
    });
  });

  it('responde 401 com esquema que não é Bearer', async () => {
    const resposta = await request(montar(autenticar(auth)))
      .get('/x')
      .set('Authorization', 'Basic token-bom');
    expect(resposta.status).toBe(401);
  });

  it('responde 401 com token recusado pelo Firebase', async () => {
    const resposta = await request(montar(autenticar(auth)))
      .get('/x')
      .set('Authorization', 'Bearer token-ruim');
    expect(resposta.status).toBe(401);
  });

  it('expõe uid, perfil e unidades das claims, checando revogação', async () => {
    const resposta = await request(montar(autenticar(auth)))
      .get('/x')
      .set('Authorization', 'Bearer token-bom');

    expect(resposta.status).toBe(200);
    expect(resposta.body.usuario).toEqual({
      uid: 'u1',
      email: 'a@b.test',
      perfil: 'medico',
      unidadeIds: ['un-1', 'un-2'],
    });
    expect(auth.verifyIdToken).toHaveBeenLastCalledWith('token-bom', true);
  });

  it('ignora perfil desconhecido na claim', async () => {
    const outro = { verifyIdToken: async () => ({ uid: 'u2', perfil: 'root' }) as never };
    const resposta = await request(montar(autenticar(outro)))
      .get('/x')
      .set('Authorization', 'Bearer t');
    expect(resposta.body.usuario.perfil).toBeUndefined();
    expect(resposta.body.usuario.unidadeIds).toEqual([]);
  });
});

describe('exigirPerfil', () => {
  it('deixa passar perfil listado', async () => {
    const app = montar(comUsuario({ perfil: 'recepcionista' }), exigirPerfil('recepcionista'));
    expect((await request(app).get('/x')).status).toBe(200);
  });

  it('responde 403 ACESSO_NEGADO para perfil fora da lista', async () => {
    const app = montar(comUsuario({ perfil: 'paciente' }), exigirPerfil('administrativo'));
    const resposta = await request(app).get('/x');
    expect(resposta.status).toBe(403);
    expect(resposta.body.erro.codigo).toBe('ACESSO_NEGADO');
  });

  it('responde 403 sem perfil e 401 sem autenticação', async () => {
    expect((await request(montar(comUsuario({}), exigirPerfil('medico'))).get('/x')).status).toBe(
      403,
    );
    expect((await request(montar(exigirPerfil('medico'))).get('/x')).status).toBe(401);
  });
});

describe('exigirUnidade', () => {
  const caso = (usuario: Partial<UsuarioAutenticado>, caminho: string) =>
    request(montar(comUsuario(usuario), exigirUnidade())).get(caminho);

  it('recepcionista e manutenção: só a própria unidade', async () => {
    expect((await caso({ perfil: 'recepcionista', unidadeId: 'a' }, '/x?unidadeId=a')).status).toBe(
      200,
    );
    const fora = await caso({ perfil: 'manutencao', unidadeId: 'a' }, '/x?unidadeId=b');
    expect(fora.status).toBe(403);
    expect(fora.body.erro.codigo).toBe('FORA_DA_UNIDADE');
  });

  it('médico: qualquer uma das suas unidades', async () => {
    const medico = { perfil: 'medico' as const, unidadeIds: ['a', 'b'] };
    expect((await caso(medico, '/x?unidadeId=b')).status).toBe(200);
    expect((await caso(medico, '/x?unidadeId=c')).status).toBe(403);
  });

  it('administrativo: todas; paciente: nenhuma', async () => {
    expect((await caso({ perfil: 'administrativo' }, '/x?unidadeId=z')).status).toBe(200);
    expect((await caso({ perfil: 'paciente' }, '/x?unidadeId=z')).status).toBe(403);
  });

  it('lê a unidade do corpo quando não vem na query', async () => {
    const app = montar(comUsuario({ perfil: 'recepcionista', unidadeId: 'a' }), exigirUnidade());
    expect((await request(app).post('/x').send({ unidadeId: 'a' })).status).toBe(200);
  });

  it('responde 400 sem unidade e 401 sem autenticação', async () => {
    const semUnidade = await caso({ perfil: 'administrativo' }, '/x');
    expect(semUnidade.status).toBe(400);
    expect(semUnidade.body.erro.detalhes).toEqual([
      { campo: 'unidadeId', mensagem: 'Escolha a unidade de atendimento.' },
    ]);
    expect((await request(montar(exigirUnidade())).get('/x?unidadeId=a')).status).toBe(401);
  });
});

describe('validar', () => {
  const schema = z.strictObject({ nome: z.string().trim().min(1, 'Digite o nome.') });

  it('substitui o corpo pelo valor normalizado', async () => {
    const resposta = await request(montar(validar(schema)))
      .post('/x')
      .send({ nome: '  Ana ' });
    expect(resposta.body.body).toEqual({ nome: 'Ana' });
  });

  it('responde 400 DADOS_INVALIDOS com um detalhe por campo', async () => {
    const resposta = await request(montar(validar(schema)))
      .post('/x')
      .send({ nome: ' ' });
    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.codigo).toBe('DADOS_INVALIDOS');
    expect(resposta.body.erro.detalhes).toEqual([{ campo: 'nome', mensagem: 'Digite o nome.' }]);
  });

  it('recusa campos que não existem no schema', async () => {
    const resposta = await request(montar(validar(schema)))
      .post('/x')
      .send({ nome: 'Ana', perfil: 'administrativo' });
    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.detalhes[0].mensagem).toBe('Campo não aceito aqui: perfil.');
  });

  it('valida e converte a query string', async () => {
    const pagina = z.object({ pagina: z.coerce.number().int().positive() });
    const ok = await request(montar(validar(pagina, 'query'))).get('/x?pagina=2');
    expect(ok.body.query).toEqual({ pagina: 2 });
    expect((await request(montar(validar(pagina, 'query'))).get('/x?pagina=0')).status).toBe(400);
  });
});

describe('errorHandler', () => {
  const lancar =
    (erro: unknown): RequestHandler =>
    () => {
      throw erro;
    };

  it('usa status, código, mensagem e detalhes do AppError', async () => {
    const app = montar(lancar(new AppError('CPF_JA_CADASTRADO', 409, 'Já existe.', { a: 1 })));
    const resposta = await request(app).get('/x');
    expect(resposta.status).toBe(409);
    expect(resposta.body.erro).toEqual({
      codigo: 'CPF_JA_CADASTRADO',
      mensagem: 'Já existe.',
      detalhes: { a: 1 },
      requestId: 'req-teste',
    });
  });

  it('esconde a mensagem de erros inesperados atrás de 500 ERRO_INTERNO', async () => {
    const resposta = await request(montar(lancar(new Error('senha do banco: xyz')))).get('/x');
    expect(resposta.status).toBe(500);
    expect(resposta.body.erro.codigo).toBe('ERRO_INTERNO');
    expect(JSON.stringify(resposta.body)).not.toContain('xyz');
  });

  it('responde 400 para JSON malformado', async () => {
    const resposta = await request(montar())
      .post('/x')
      .set('Content-Type', 'application/json')
      .send('{"nome":');
    expect(resposta.status).toBe(400);
    expect(resposta.body.erro.codigo).toBe('DADOS_INVALIDOS');
  });
});
