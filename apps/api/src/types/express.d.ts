import type { Perfil } from '../schemas/campos.js';

export interface UsuarioAutenticado {
  uid: string;
  email?: string;
  perfil?: Perfil;
  unidadeId?: string;
  unidadeIds: string[];
}

declare module 'express-serve-static-core' {
  interface Request {
    /** Preenchido pelo middleware autenticar. */
    usuario?: UsuarioAutenticado;
  }
}
