import { beforeEach, describe, expect, it, vi } from 'vitest';

import { VERSAO_TERMO_ATUAL } from '../../src/config/termo.js';
import type { UsuariosRepository } from '../../src/repositories/usuarios.repository.js';
import type { DadosCadastro } from '../../src/schemas/auth.schema.js';
import {
  criarAuthService,
  montarClaims,
  type DadosConta,
} from '../../src/services/auth.service.js';

function fakes() {
  const usuarios = {
    novoId: vi.fn(() => 'uid-1'),
    criarComUnicidade: vi.fn<UsuariosRepository['criarComUnicidade']>(async () => ({
      conflito: null,
    })),
    removerCriacao: vi.fn<UsuariosRepository['removerCriacao']>(async () => undefined),
    buscarPorId: vi.fn<UsuariosRepository['buscarPorId']>(async () => null),
    atualizar: vi.fn<UsuariosRepository['atualizar']>(),
  };
  const auth = {
    createUser: vi.fn(async () => ({})),
    setCustomUserClaims: vi.fn(async () => undefined),
    deleteUser: vi.fn(async () => undefined),
  };
  const agora = new Date('2026-10-04T12:00:00Z');
  const service = criarAuthService({ auth: auth as never, usuarios, agora: () => agora });
  return { usuarios, auth, service, agora };
}

const cadastro: DadosCadastro = {
  nome: 'Maria Teste',
  cpf: '52998224725',
  dataNascimento: '1948-03-12',
  telefone: '5581999991234',
  email: 'maria@saude-palma.test',
  senha: 'senha-123456',
  consentimento: {
    versaoTermo: VERSAO_TERMO_ATUAL,
    aceito: true,
    canal: 'pwa',
    exibicaoPainel: true,
  },
};

const contaEquipe = (extra: Partial<DadosConta>): DadosConta => ({
  nome: 'Equipe Teste',
  cpf: '52998224725',
  email: 'equipe@saude-palma.test',
  senha: 'senha-123456',
  perfil: 'recepcionista',
  status: 'ativo',
  consentimento: { versaoTermo: 'x', aceitoEm: new Date(), canal: 'seed', exibicaoPainel: false },
  ...extra,
});

describe('authService.cadastrarPaciente', () => {
  let f: ReturnType<typeof fakes>;
  beforeEach(() => {
    f = fakes();
  });

  it('cria paciente ativo, com consentimento datado agora e claim de perfil', async () => {
    const conta = await f.service.cadastrarPaciente(cadastro);

    expect(conta).toEqual({
      id: 'uid-1',
      nome: 'Maria Teste',
      perfil: 'paciente',
      status: 'ativo',
    });
    expect(f.usuarios.criarComUnicidade).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'uid-1',
        perfil: 'paciente',
        status: 'ativo',
        criadoPor: 'uid-1',
        expoPushTokens: [],
        preferencias: { letraGrande: false, altoContraste: false, lembreteWhatsapp: false },
        consentimento: {
          versaoTermo: VERSAO_TERMO_ATUAL,
          aceitoEm: f.agora,
          canal: 'pwa',
          exibicaoPainel: true,
        },
      }),
    );
    expect(f.auth.createUser).toHaveBeenCalledWith(
      expect.objectContaining({ uid: 'uid-1', email: cadastro.email, password: cadastro.senha }),
    );
    expect(f.auth.setCustomUserClaims).toHaveBeenCalledWith('uid-1', { perfil: 'paciente' });
  });

  it('responde 409 CPF_JA_CADASTRADO sem tocar no Auth', async () => {
    f.usuarios.criarComUnicidade.mockResolvedValueOnce({ conflito: 'cpf' });
    await expect(f.service.cadastrarPaciente(cadastro)).rejects.toMatchObject({
      codigo: 'CPF_JA_CADASTRADO',
      status: 409,
    });
    expect(f.auth.createUser).not.toHaveBeenCalled();
  });

  it('responde 409 EMAIL_JA_CADASTRADO quando a trava de e-mail existe', async () => {
    f.usuarios.criarComUnicidade.mockResolvedValueOnce({ conflito: 'email' });
    await expect(f.service.cadastrarPaciente(cadastro)).rejects.toMatchObject({
      codigo: 'EMAIL_JA_CADASTRADO',
    });
  });

  it('desfaz o Firestore se o Auth recusar o e-mail e responde 409', async () => {
    f.auth.createUser.mockRejectedValueOnce(
      Object.assign(new Error('x'), { code: 'auth/email-already-exists' }),
    );
    await expect(f.service.cadastrarPaciente(cadastro)).rejects.toMatchObject({
      codigo: 'EMAIL_JA_CADASTRADO',
    });
    expect(f.usuarios.removerCriacao).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'uid-1' }),
    );
    expect(f.auth.deleteUser).not.toHaveBeenCalled();
  });

  it('apaga a conta do Auth e o Firestore se as claims falharem', async () => {
    const falha = new Error('rede');
    f.auth.setCustomUserClaims.mockRejectedValueOnce(falha);
    await expect(f.service.cadastrarPaciente(cadastro)).rejects.toBe(falha);
    expect(f.auth.deleteUser).toHaveBeenCalledWith('uid-1');
    expect(f.usuarios.removerCriacao).toHaveBeenCalled();
  });
});

describe('authService.criarConta (equipe)', () => {
  it('exige unidadeId para recepcionista e manutenção', async () => {
    const { service } = fakes();
    await expect(service.criarConta(contaEquipe({}))).rejects.toMatchObject({
      codigo: 'DADOS_INVALIDOS',
    });
    await expect(service.criarConta(contaEquipe({ perfil: 'manutencao' }))).rejects.toMatchObject({
      codigo: 'DADOS_INVALIDOS',
    });
  });

  it('exige ao menos uma unidade para médico', async () => {
    const { service } = fakes();
    await expect(
      service.criarConta(contaEquipe({ perfil: 'medico', unidadeIds: [] })),
    ).rejects.toMatchObject({ codigo: 'DADOS_INVALIDOS' });
  });

  it('grava unidade nas claims e cria desativada no Auth se inativo', async () => {
    const { service, auth } = fakes();
    await service.criarConta(
      contaEquipe({ unidadeId: 'un-1', status: 'inativo', criadoPor: 'adm' }),
    );
    expect(auth.setCustomUserClaims).toHaveBeenCalledWith('uid-1', {
      perfil: 'recepcionista',
      unidadeId: 'un-1',
    });
    expect(auth.createUser).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }));
  });
});

describe('montarClaims', () => {
  it('só inclui o que existe', () => {
    expect(montarClaims({ perfil: 'administrativo' })).toEqual({ perfil: 'administrativo' });
    expect(montarClaims({ perfil: 'medico', unidadeIds: ['a'] })).toEqual({
      perfil: 'medico',
      unidadeIds: ['a'],
    });
  });
});

describe('authService.buscarMe', () => {
  it('responde 404 quando o documento não existe', async () => {
    const { service } = fakes();
    await expect(service.buscarMe('x')).rejects.toMatchObject({ codigo: 'NAO_ENCONTRADO' });
  });

  it('devolve o usuário encontrado', async () => {
    const { service, usuarios } = fakes();
    usuarios.buscarPorId.mockResolvedValueOnce({ id: 'x', nome: 'Ana' } as never);
    await expect(service.buscarMe('x')).resolves.toEqual({ id: 'x', nome: 'Ana' });
  });
});
