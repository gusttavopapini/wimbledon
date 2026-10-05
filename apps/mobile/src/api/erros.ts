/** Códigos da API (openapi.yaml) e os que o próprio app produz. */
export type CodigoErro =
  | 'DADOS_INVALIDOS'
  | 'NAO_AUTENTICADO'
  | 'ACESSO_NEGADO'
  | 'FORA_DA_UNIDADE'
  | 'NAO_ENCONTRADO'
  | 'CPF_JA_CADASTRADO'
  | 'EMAIL_JA_CADASTRADO'
  | 'ESPECIALIDADE_JA_CADASTRADA'
  | 'CNPJ_JA_CADASTRADO'
  | 'CONSELHO_JA_CADASTRADO'
  | 'ESPECIALIDADE_NAO_CADASTRADA'
  | 'UNIDADE_NAO_CADASTRADA'
  | 'MEDICO_NAO_CADASTRADO'
  | 'MEDICO_INATIVO'
  | 'USUARIO_NAO_E_MEDICO'
  | 'LIMITE_EXCEDIDO'
  | 'ERRO_INTERNO'
  | 'SEM_CONEXAO'
  | 'CREDENCIAIS_INVALIDAS'
  | 'CONTA_DESATIVADA';

export interface DetalheCampo {
  campo: string;
  mensagem: string;
}

/** Erro que as telas consomem. `mensagem` já diz à pessoa o que fazer. */
export class ErroApi extends Error {
  constructor(
    readonly codigo: CodigoErro,
    mensagem: string,
    readonly status: number | null = null,
    readonly detalhes: DetalheCampo[] = [],
    readonly requestId: string | null = null,
  ) {
    super(mensagem);
    this.name = 'ErroApi';
  }
}

export const MENSAGEM_SEM_CONEXAO =
  'Não conseguimos conectar. Confira se o celular está conectado à internet e toque em Tentar de novo.';

export const MENSAGEM_ERRO_INTERNO =
  'Algo não funcionou do nosso lado. Tente de novo em alguns minutos.';

const CODIGOS = new Set<string>([
  'DADOS_INVALIDOS',
  'NAO_AUTENTICADO',
  'ACESSO_NEGADO',
  'FORA_DA_UNIDADE',
  'NAO_ENCONTRADO',
  'CPF_JA_CADASTRADO',
  'EMAIL_JA_CADASTRADO',
  'ESPECIALIDADE_JA_CADASTRADA',
  'CNPJ_JA_CADASTRADO',
  'CONSELHO_JA_CADASTRADO',
  'ESPECIALIDADE_NAO_CADASTRADA',
  'UNIDADE_NAO_CADASTRADA',
  'MEDICO_NAO_CADASTRADO',
  'MEDICO_INATIVO',
  'USUARIO_NAO_E_MEDICO',
  'LIMITE_EXCEDIDO',
  'ERRO_INTERNO',
]);

interface CorpoErro {
  erro?: { codigo?: unknown; mensagem?: unknown; detalhes?: unknown; requestId?: unknown };
}

/** Converte a resposta {erro:{codigo,mensagem,detalhes,requestId}} da API em ErroApi. */
export function erroDaResposta(status: number | null, corpo: unknown): ErroApi {
  if (status === null) return new ErroApi('SEM_CONEXAO', MENSAGEM_SEM_CONEXAO);

  const erro = (corpo as CorpoErro | undefined)?.erro;
  const codigo = typeof erro?.codigo === 'string' && CODIGOS.has(erro.codigo) ? erro.codigo : null;
  if (!erro || !codigo) {
    return new ErroApi('ERRO_INTERNO', MENSAGEM_ERRO_INTERNO, status);
  }

  const detalhes = Array.isArray(erro.detalhes)
    ? erro.detalhes.filter(
        (d): d is DetalheCampo => typeof d?.campo === 'string' && typeof d?.mensagem === 'string',
      )
    : [];

  return new ErroApi(
    codigo as CodigoErro,
    typeof erro.mensagem === 'string' ? erro.mensagem : MENSAGEM_ERRO_INTERNO,
    status,
    detalhes,
    typeof erro.requestId === 'string' ? erro.requestId : null,
  );
}

export function comoErroApi(erro: unknown): ErroApi {
  return erro instanceof ErroApi ? erro : new ErroApi('ERRO_INTERNO', MENSAGEM_ERRO_INTERNO);
}
