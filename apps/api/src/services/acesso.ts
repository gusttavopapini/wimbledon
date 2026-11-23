import { erros } from '../errors/AppError.js';
import type { UsuarioAutenticado } from '../types/express.js';

export type Ator = UsuarioAutenticado;

/** Mesma regra do middleware exigirUnidade, para quando a unidade só é conhecida no service. */
export function podeAcessarUnidade(ator: Ator, unidadeId: string): boolean {
  return (
    ator.perfil === 'administrativo' ||
    ((ator.perfil === 'recepcionista' || ator.perfil === 'manutencao') &&
      ator.unidadeId === unidadeId) ||
    (ator.perfil === 'medico' && ator.unidadeIds.includes(unidadeId))
  );
}

export function exigirAcessoUnidade(ator: Ator, unidadeId: string): void {
  if (!podeAcessarUnidade(ator, unidadeId)) throw erros.foraDaUnidade();
}

/** Gestão da unidade: administrativo (todas) ou manutenção (a própria). */
export function exigirGestaoUnidade(ator: Ator, unidadeId: string): void {
  if (ator.perfil === 'administrativo') return;
  if (ator.perfil === 'manutencao' && ator.unidadeId === unidadeId) return;
  if (ator.perfil === 'manutencao') throw erros.foraDaUnidade();
  throw erros.acessoNegado();
}
