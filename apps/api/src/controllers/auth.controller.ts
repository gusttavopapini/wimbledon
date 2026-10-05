import type { NextFunction, Request, Response } from 'express';

import { erros } from '../errors/AppError.js';
import type { DadosCadastro } from '../schemas/auth.schema.js';
import type { AuthService } from '../services/auth.service.js';
import { apresentarUsuario } from './apresentadores.js';

export function criarAuthController(deps: { authService: AuthService; fuso: string }) {
  const { authService, fuso } = deps;

  return {
    async cadastrar(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        const conta = await authService.cadastrarPaciente(req.body as DadosCadastro);
        res.status(201).location(`/api/v1/usuarios/${conta.id}`).json(conta);
      } catch (erro) {
        next(erro);
      }
    },

    async me(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        if (!req.usuario) throw erros.naoAutenticado();
        const usuario = await authService.buscarMe(req.usuario.uid);
        res.status(200).json({ usuario: apresentarUsuario(usuario, fuso), perfil: usuario.perfil });
      } catch (erro) {
        next(erro);
      }
    },
  };
}
