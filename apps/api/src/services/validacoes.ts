import { erros, type CodigoErro } from '../errors/AppError.js';

/** 422 listando os ids que não existem (ou estão desativados). */
export async function exigirIdsAtivos(
  ids: string[],
  idsAtivos: (ids: string[]) => Promise<Set<string>>,
  campo: string,
  codigo: CodigoErro,
): Promise<void> {
  const ativos = await idsAtivos(ids);
  const faltando = ids.filter((id) => !ativos.has(id));
  if (faltando.length > 0) {
    throw erros.naoProcessavel(codigo, [
      { campo, mensagem: `Não encontramos ou estão desativados: ${faltando.join(', ')}.` },
    ]);
  }
}
