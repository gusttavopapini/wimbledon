import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

interface Operacao {
  requestBody?: { content: Record<string, { example?: unknown }> };
  responses: Record<string, { $ref?: string; content?: Record<string, { example?: unknown }> }>;
}

const especificacao = parse(
  readFileSync(new URL('../../openapi.yaml', import.meta.url), 'utf8'),
) as { paths: Record<string, Record<string, Operacao>> };

/** Critério de pronto: cada rota entregue está no openapi.yaml com seus códigos. */
const ROTAS: [metodo: string, caminho: string, codigos: string[]][] = [
  ['get', '/health', ['200']],
  ['post', '/api/v1/auth/cadastro', ['201', '400', '409', '429', '500']],
  ['get', '/api/v1/auth/me', ['200', '401', '404', '429', '500']],
  ['put', '/api/v1/usuarios/me', ['200', '400', '401', '404', '429', '500']],
];

describe('openapi.yaml', () => {
  it.each(ROTAS)('documenta %s %s com os códigos de resposta', (metodo, caminho, codigos) => {
    const operacao = especificacao.paths[caminho]?.[metodo];
    expect(operacao, `${metodo.toUpperCase()} ${caminho} não está no openapi.yaml`).toBeDefined();
    expect(Object.keys(operacao!.responses).sort()).toEqual([...codigos].sort());
  });

  it.each(ROTAS.filter(([metodo]) => metodo !== 'get'))(
    'traz exemplo de payload JSON em %s %s',
    (metodo, caminho) => {
      const operacao = especificacao.paths[caminho]![metodo]!;
      expect(operacao.requestBody?.content['application/json']?.example).toBeDefined();
    },
  );
});
