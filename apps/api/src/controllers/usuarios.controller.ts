import type { NextFunction, Request, Response } from 'express';

import { erros } from '../errors/AppError.js';
import type { DadosAtualizarMe } from '../schemas/usuario.schema.js';
import type { UsuariosService } from '../services/usuarios.service.js';
import { apresentarUsuario } from './apresentadores.js';

export function criarUsuariosController(deps: { usuariosService: UsuariosService; fuso: string }) {
  const { usuariosService, fuso } = deps;

  return {
    async atualizarMe(req: Request, res: Response, next: NextFunction): Promise<void> {
      try {
        if (!req.usuario) throw erros.naoAutenticado();
        const usuario = await usuariosService.atualizarMe(
          req.usuario.uid,
          req.body as DadosAtualizarMe,
        );
        res.status(200).json(apresentarUsuario(usuario, fuso));
      } catch (erro) {
        next(erro);
      }
    },
  };
}
