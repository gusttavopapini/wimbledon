import type { NextFunction, Request, Response } from 'express';

import { erros } from '../errors/AppError.js';
import type {
  DadosAtualizarMedico,
  DadosCriarMedico,
  FiltrosMedicos,
} from '../schemas/medico.schema.js';
import type { MedicosService } from '../services/medicos.service.js';
import { apresentarMedico, apresentarMedicoCompleto } from './apresentadores.js';

export function criarMedicosController(deps: { medicosService: MedicosService; fuso: string }) {
  const { medicosService: servico, fuso } = deps;

  return {
    async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const lista = await servico.listar(req.query as FiltrosMedicos);
        res.json({ itens: lista.map((m) => apresentarMedico(m, fuso)) });
      } catch (erro) {
        next(erro);
      }
    },

    async buscar(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        res.json(apresentarMedico(await servico.buscar(String(req.params.id)), fuso));
      } catch (erro) {
        next(erro);
      }
    },

    async criar(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        if (!req.usuario) throw erros.naoAutenticado();
        const criado = await servico.criar(req.body as DadosCriarMedico, req.usuario.uid);
        res
          .status(201)
          .location(`/api/v1/medicos/${criado.id}`)
          .json(apresentarMedicoCompleto(criado, fuso));
      } catch (erro) {
        next(erro);
      }
    },

    async atualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = String(req.params.id);
        const atualizado = await servico.atualizar(id, req.body as DadosAtualizarMedico);
        res.json(apresentarMedicoCompleto(atualizado, fuso));
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

    /** 201 + Location na primeira alocação; 200 se o médico já estava na unidade. */
    async alocar(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const id = String(req.params.id);
        const { unidadeId } = req.body as { unidadeId: string };
        const { medico, criado } = await servico.alocar(id, unidadeId);
        if (criado) res.status(201).location(`/api/v1/medicos/${id}/unidades/${unidadeId}`);
        res.json(apresentarMedico(medico, fuso));
      } catch (erro) {
        next(erro);
      }
    },

    async desalocar(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        await servico.desalocar(String(req.params.id), String(req.params.unidadeId));
        res.status(204).end();
      } catch (erro) {
        next(erro);
      }
    },
  };
}
