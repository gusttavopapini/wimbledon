import { Router } from 'express';

import { verificarSaude } from '../controllers/health.controller.js';

export const healthRoutes = Router();

healthRoutes.get('/', verificarSaude);
