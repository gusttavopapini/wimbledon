import { readFileSync } from 'node:fs';

import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';
import { parse } from 'yaml';

const especificacao = parse(
  readFileSync(new URL('../../openapi.yaml', import.meta.url), 'utf8'),
) as Record<string, unknown>;

export const docsRoutes = Router();

docsRoutes.get('/openapi.json', (_req, res) => {
  res.json(especificacao);
});
docsRoutes.use('/', swaggerUi.serve, swaggerUi.setup(especificacao));
