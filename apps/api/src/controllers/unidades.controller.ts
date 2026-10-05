import type { NextFunction, Request, Response } from 'express';

import type {
  DadosAtualizarUnidade,
  DadosCriarUnidade,
  FiltrosUnidades,
} from '../schemas/unidade.schema.js';
import type { UnidadesService } from '../services/unidades.service.js';
import { apresentarUnidade } from './apresentadores.js';

export function criarUnidadesController(deps: { unidadesService: UnidadesService; fuso: string }) {
  const { unidadesService: servico, fuso } = deps;
  const apresentar = (u: Parameters<typeof apresentarUnidade>[0]) => apresentarUnidade(u, fuso);

  return {
    async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const lista = await servico.listar(req.query as FiltrosUnidades);
        res.json({ itens: lista.map(apresentar) });
      } catch (erro) {
        next(erro);
      }
    },

    async buscar(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        res.json(apresentar(await servico.buscar(String(req.params.id))));
      } catch (erro) {
        next(erro);
      }
    },

    async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const criada = await servico.criar(req.body as DadosCriarUnidade);
        res.status(201).location(`/api/v1/unidades/${criada.id}`).json(apresentar(criada));
      } catch (erro) {
        next(erro);
      }
    },

    async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = String(req.params.id);
        res.json(apresentar(await servico.atualizar(id, req.body as DadosAtualizarUnidade)));
      } catch (erro) {
        next(erro);
      }
    },

    async desativar(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        await servico.desativar(String(req.params.id));
        res.status(204).end();
      } catch (erro) {
        next(erro);
      }
    },
  };
}
