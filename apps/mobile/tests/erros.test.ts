import { FirebaseError } from 'firebase/app';
import { describe, expect, it } from 'vitest';

import { erroDaResposta, ErroApi } from '@/api/erros';
import { textoDoErro } from '@/api/mensagens';
import { erroDoFirebase } from '@/auth/sessao';

describe('erroDaResposta', () => {
  it('traduz o formato padrão da API', () => {
    const erro = erroDaResposta(409, {
      erro: {
        codigo: 'CPF_JA_CADASTRADO',
        mensagem: 'Já existe.',
        detalhes: null,
        requestId: 'r1',
      },
    });
    expect(erro).toBeInstanceOf(ErroApi);
    expect(erro).toMatchObject({ codigo: 'CPF_JA_CADASTRADO', status: 409, requestId: 'r1' });
    expect(erro.message).toBe('Já existe.');
  });

  it('mantém só os detalhes bem formados', () => {
    const erro = erroDaResposta(400, {
      erro: {
        codigo: 'DADOS_INVALIDOS',
        mensagem: 'x',
        detalhes: [{ campo: 'cpf', mensagem: 'Falta 1 número.' }, { foo: 1 }],
        requestId: 'r',
      },
    });
    expect(erro.detalhes).toEqual([{ campo: 'cpf', mensagem: 'Falta 1 número.' }]);
  });

  it('sem resposta é falta de conexão, com a mensagem do glossário', () => {
    const erro = erroDaResposta(null, null);
    expect(erro.codigo).toBe('SEM_CONEXAO');
    expect(erro.message).toBe(
      'Não conseguimos conectar. Confira se o celular está conectado à internet e toque em Tentar de novo.',
    );
  });

  it('corpo desconhecido vira ERRO_INTERNO sem expor o conteúdo', () => {
    const erro = erroDaResposta(502, '<html>Bad gateway</html>');
    expect(erro.codigo).toBe('ERRO_INTERNO');
    expect(erro.message).not.toContain('html');
  });
});

describe('textoDoErro', () => {
  it('CPF e e-mail já cadastrados dizem o que fazer e oferecem Entrar', () => {
    for (const codigo of ['CPF_JA_CADASTRADO', 'EMAIL_JA_CADASTRADO'] as const) {
      const texto = textoDoErro(new ErroApi(codigo, ''));
      expect(texto.texto).toBe(
        'Toque em Entrar ou, se não lembrar a senha, em Esqueci minha senha.',
      );
      expect(texto.acao).toBe('entrar');
    }
  });
});

describe('erroDoFirebase', () => {
  it('senha errada usa a frase do glossário', () => {
    const erro = erroDoFirebase(new FirebaseError('auth/invalid-credential', 'x'));
    expect(erro.message).toBe(
      'E-mail ou senha não conferem. Confira e tente de novo, ou toque em Esqueci minha senha.',
    );
  });

  it('falha de rede vira SEM_CONEXAO', () => {
    expect(erroDoFirebase(new FirebaseError('auth/network-request-failed', 'x')).codigo).toBe(
      'SEM_CONEXAO',
    );
  });
});
