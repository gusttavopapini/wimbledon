// Função serverless da Vercel: a mesma API Express (apps/api), compilada em
// apps/api/dist pelo buildCommand do vercel.json. O vercel.json reescreve
// /api/* e /health para cá; o Express vê o caminho original.
import { criarApp } from '../apps/api/dist/app.js';
import { carregarAmbiente } from '../apps/api/dist/config/env.js';

let app;

export default function handler(req, res) {
  // Monta uma vez por instância (cold start) e reaproveita nas próximas chamadas.
  app ??= criarApp(carregarAmbiente());
  return app(req, res);
}
