import type { ErroApi } from './erros';

export interface TextoErro {
  /** O que aconteceu, curto (título da Mensagem). */
  titulo: string;
  /** O que fazer agora. */
  texto: string;
  /** Ação sugerida, quando houver um caminho claro. */
  acao?: 'entrar' | 'esqueciSenha' | 'tentarDeNovo';
}

/** Texto da Mensagem de erro para cada código. Segue design-system/linguagem.md. */
export function textoDoErro(erro: ErroApi): TextoErro {
  switch (erro.codigo) {
    case 'CPF_JA_CADASTRADO':
      return {
        titulo: 'Já existe uma conta com esse CPF',
        texto: 'Toque em Entrar ou, se não lembrar a senha, em Esqueci minha senha.',
        acao: 'entrar',
      };
    case 'EMAIL_JA_CADASTRADO':
      return {
        titulo: 'Já existe uma conta com esse e-mail',
        texto: 'Toque em Entrar ou, se não lembrar a senha, em Esqueci minha senha.',
        acao: 'entrar',
      };
    case 'CREDENCIAIS_INVALIDAS':
      return {
        titulo: 'Não foi possível entrar',
        texto:
          'E-mail ou senha não conferem. Confira e tente de novo, ou toque em Esqueci minha senha.',
      };
    case 'SEM_CONEXAO':
      return {
        titulo: 'Sem conexão',
        texto:
          'Não conseguimos conectar. Confira se o celular está conectado à internet e toque em Tentar de novo.',
        acao: 'tentarDeNovo',
      };
    case 'LIMITE_EXCEDIDO':
      return {
        titulo: 'Muitas tentativas seguidas',
        texto: 'Espere alguns minutos e tente de novo.',
      };
    case 'CONTA_DESATIVADA':
      return {
        titulo: 'Sua conta está desativada',
        texto: 'Fale com a recepção da unidade para reativar.',
      };
    case 'DADOS_INVALIDOS':
      return {
        titulo: 'Alguns dados precisam de ajuste',
        texto: 'Confira os campos indicados e tente de novo.',
      };
    default:
      return {
        titulo: 'Algo não funcionou',
        texto: erro.message,
        acao: 'tentarDeNovo',
      };
  }
}
