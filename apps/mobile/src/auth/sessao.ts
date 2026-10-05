import { FirebaseError } from 'firebase/app';

import { ErroApi, MENSAGEM_SEM_CONEXAO } from '@/api/erros';

/** Traduz erros do Firebase Auth para o mesmo ErroApi que as telas já tratam. */
export function erroDoFirebase(erro: unknown): ErroApi {
  if (erro instanceof ErroApi) return erro;
  const codigo = erro instanceof FirebaseError ? erro.code : '';
  switch (codigo) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-email':
      return new ErroApi(
        'CREDENCIAIS_INVALIDAS',
        'E-mail ou senha não conferem. Confira e tente de novo, ou toque em Esqueci minha senha.',
      );
    case 'auth/user-disabled':
      return new ErroApi(
        'CONTA_DESATIVADA',
        'Sua conta está desativada. Fale com a recepção da unidade para reativar.',
      );
    case 'auth/too-many-requests':
      return new ErroApi(
        'LIMITE_EXCEDIDO',
        'Foram muitas tentativas seguidas. Espere alguns minutos e tente de novo.',
      );
    case 'auth/network-request-failed':
      return new ErroApi('SEM_CONEXAO', MENSAGEM_SEM_CONEXAO);
    default:
      return new ErroApi(
        'ERRO_INTERNO',
        'Algo não funcionou do nosso lado. Tente de novo em alguns minutos.',
      );
  }
}
