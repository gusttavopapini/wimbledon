import type { Request, Response } from 'express';

import { VERSAO_API } from '../config/versao.js';
import { paraIsoLocal } from '../utils/datas.js';

export function verificarSaude(req: Request, res: Response): void {
  res.status(200).json({
    status: 'ok',
    versao: VERSAO_API,
    em: paraIsoLocal(new Date(), req.app.get('fuso') as string | undefined),
  });
}
