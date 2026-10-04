import type { Request, Response } from 'express';

import { VERSAO_API } from '../config/versao.js';

export function verificarSaude(_req: Request, res: Response): void {
  res.status(200).json({ status: 'ok', versao: VERSAO_API, em: new Date().toISOString() });
}
