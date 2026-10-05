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
  | 'ERRO_INTERNO';

/**
 * Erro esperado pela regra de negócio. A mensagem vai direto para a pessoa:
 * diz o que fazer, não o que deu errado (design-system/linguagem.md).
 */
export class AppError extends Error {
  constructor(
    readonly codigo: CodigoErro,
    readonly status: number,
    mensagem: string,
    readonly detalhes?: unknown,
  ) {
    super(mensagem);
    this.name = 'AppError';
  }
}

export const MENSAGENS = {
  DADOS_INVALIDOS: 'Alguns dados precisam de ajuste. Confira os campos indicados e tente de novo.',
  NAO_AUTENTICADO: 'Entre na sua conta para continuar.',
  ACESSO_NEGADO:
    'Sua conta não tem acesso a esta parte do app. Se precisar, fale com a administração da unidade.',
  FORA_DA_UNIDADE: 'Você só pode ver informações da unidade onde trabalha.',
  NAO_ENCONTRADO: 'Não encontramos o que você procurou. Confira e tente de novo.',
  CPF_JA_CADASTRADO:
    'Já existe uma conta com esse CPF. Toque em Entrar ou, se não lembrar a senha, em Esqueci minha senha.',
  EMAIL_JA_CADASTRADO:
    'Já existe uma conta com esse e-mail. Toque em Entrar ou, se não lembrar a senha, em Esqueci minha senha.',
  ESPECIALIDADE_JA_CADASTRADA:
    'Já existe uma especialidade com esse nome. Se ela estiver desativada, edite e reative a que já existe.',
  CNPJ_JA_CADASTRADO:
    'Já existe uma unidade com esse CNPJ. Confira os números ou edite a unidade que já existe.',
  CONSELHO_JA_CADASTRADO:
    'Já existe um médico com esse registro no conselho. Confira o número e a UF ou edite o cadastro que já existe.',
  ESPECIALIDADE_NAO_CADASTRADA:
    'Alguma especialidade escolhida não existe ou está desativada. Confira a lista e escolha de novo.',
  UNIDADE_NAO_CADASTRADA:
    'Alguma unidade escolhida não existe ou está desativada. Confira a lista e escolha de novo.',
  MEDICO_NAO_CADASTRADO:
    'Esse médico não está cadastrado. Peça para a administração cadastrar o médico antes de alocar.',
  MEDICO_INATIVO:
    'O cadastro desse médico está desativado. Peça para a administração reativar antes de alocar.',
  USUARIO_NAO_E_MEDICO:
    'A conta escolhida não é de um médico. Confira a conta ou deixe o campo em branco.',
  LIMITE_EXCEDIDO: 'Foram muitas tentativas seguidas. Espere alguns minutos e tente de novo.',
  ERRO_INTERNO: 'Algo não funcionou do nosso lado. Tente de novo em alguns minutos.',
} as const satisfies Record<CodigoErro, string>;

export const erros = {
  naoAutenticado: () => new AppError('NAO_AUTENTICADO', 401, MENSAGENS.NAO_AUTENTICADO),
  acessoNegado: () => new AppError('ACESSO_NEGADO', 403, MENSAGENS.ACESSO_NEGADO),
  foraDaUnidade: () => new AppError('FORA_DA_UNIDADE', 403, MENSAGENS.FORA_DA_UNIDADE),
  naoEncontrado: (mensagem: string = MENSAGENS.NAO_ENCONTRADO) =>
    new AppError('NAO_ENCONTRADO', 404, mensagem),
  cpfJaCadastrado: () => new AppError('CPF_JA_CADASTRADO', 409, MENSAGENS.CPF_JA_CADASTRADO),
  emailJaCadastrado: () => new AppError('EMAIL_JA_CADASTRADO', 409, MENSAGENS.EMAIL_JA_CADASTRADO),
  dadosInvalidos: (detalhes?: unknown, mensagem: string = MENSAGENS.DADOS_INVALIDOS) =>
    new AppError('DADOS_INVALIDOS', 400, mensagem, detalhes),
  limiteExcedido: () => new AppError('LIMITE_EXCEDIDO', 429, MENSAGENS.LIMITE_EXCEDIDO),
  /** 409: o recurso já existe (trava de unicidade). */
  conflito: (codigo: CodigoErro) => new AppError(codigo, 409, MENSAGENS[codigo]),
  /** 422: os dados têm o formato certo, mas apontam para algo que não existe. */
  naoProcessavel: (codigo: CodigoErro, detalhes?: unknown) =>
    new AppError(codigo, 422, MENSAGENS[codigo], detalhes),
};
