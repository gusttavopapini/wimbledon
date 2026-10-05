import type { NextFunction, Request, Response } from 'express';

import type {
  DadosAtualizarEspecialidade,
  DadosCriarEspecialidade,
} from '../schemas/especialidade.schema.js';
import type { EspecialidadesService } from '../services/especialidades.service.js';
import { apresentarEspecialidade } from './apresentadores.js';

export function criarEspecialidadesController(deps: {
  especialidadesService: EspecialidadesService;
  fuso: string;
}) {
  const { especialidadesService: servico, fuso } = deps;
  const apresentar = (e: Parameters<typeof apresentarEspecialidade>[0]) =>
    apresentarEspecialidade(e, fuso);

  return {
    async listar(_req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        res.json({ itens: (await servico.listar()).map(apresentar) });
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
        const criada = await servico.criar(req.body as DadosCriarEspecialidade);
        res.status(201).location(`/api/v1/especialidades/${criada.id}`).json(apresentar(criada));
      } catch (erro) {
        next(erro);
      }
    },

    async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = String(req.params.id);
        res.json(apresentar(await servico.atualizar(id, req.body as DadosAtualizarEspecialidade)));
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
