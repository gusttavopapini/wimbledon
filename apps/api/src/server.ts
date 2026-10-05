import { criarApp } from './app.js';
import { carregarAmbiente, type Ambiente } from './config/env.js';
import { criarLogger } from './config/logger.js';

// Falha rápida: sem configuração válida a API nem sobe.
let ambiente: Ambiente;
try {
  ambiente = carregarAmbiente();
} catch (erro) {
  process.stderr.write(`${(erro as Error).message}\n`);
  process.exit(1);
}

const logger = criarLogger(ambiente.LOG_LEVEL);
const app = criarApp(ambiente, { logger });

app.listen(ambiente.PORT, () => {
  logger.info({ porta: ambiente.PORT, ambiente: ambiente.NODE_ENV }, 'API no ar');
});
