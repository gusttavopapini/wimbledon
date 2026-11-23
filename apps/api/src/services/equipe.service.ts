import { randomBytes } from 'node:crypto';

import type { Auth } from 'firebase-admin/auth';

import { VERSAO_TERMO_ATUAL } from '../config/termo.js';
import { erros } from '../errors/AppError.js';
import type { AuditoriaRepository } from '../repositories/auditoria.repository.js';
import type { MedicosRepository } from '../repositories/medicos.repository.js';
import type { UsuariosRepository } from '../repositories/usuarios.repository.js';
import type { Perfil } from '../schemas/campos.js';
import type { Usuario } from '../types/usuario.js';
import { exigirGestaoUnidade, type Ator } from './acesso.js';
import type { AuthService } from './auth.service.js';

/** Senha provisória legível: 10 letras e números, sem caracteres parecidos. */
export function senhaProvisoria(): string {
  const alfabeto = 'abcdefghjkmnpqrstuvwxyz23456789';
  return [...randomBytes(10)].map((b) => alfabeto[b % alfabeto.length]).join('');
}

export interface DadosContaEquipe {
  nome: string;
  cpf: string;
  email: string;
  telefone?: string;
  senha?: string;
  perfil: Exclude<Perfil, 'paciente'>;
  unidadeId?: string;
  /** Para perfil medico: o cadastro de médico (POST /medicos) que esta conta vai usar. */
  medicoId?: string;
}

export function criarEquipeService(deps: {
  auth: Pick<Auth, 'updateUser' | 'revokeRefreshTokens'>;
  authService: AuthService;
  usuarios: UsuariosRepository;
  medicos: MedicosRepository;
  auditoria: AuditoriaRepository;
}) {
  const { auth, authService, usuarios, medicos, auditoria } = deps;

  function auditar(
    ator: Ator,
    acao: string,
    alvo: Pick<Usuario, 'id'> & { unidadeId?: string | null },
  ) {
    void auditoria
      .registrar({
        atorId: ator.uid,
        perfil: ator.perfil ?? '',
        unidadeId: alvo.unidadeId ?? null,
        acao,
        recurso: 'usuarios',
        recursoId: alvo.id,
      })
      .catch(() => undefined);
  }

  /** Quem pode mexer na conta-alvo (RN19, RN23, RN24). */
  async function exigirGestaoDaConta(ator: Ator, usuarioId: string): Promise<Usuario> {
    const alvo = await usuarios.buscarPorId(usuarioId);
    if (!alvo) throw erros.naoEncontrado('Não encontramos essa conta.');
    if (ator.perfil === 'administrativo') return alvo;
    if (ator.perfil !== 'manutencao') throw erros.acessoNegado();
    if (alvo.perfil === 'paciente') return alvo;
    if (alvo.perfil === 'recepcionista' && alvo.unidadeId === ator.unidadeId) return alvo;
    throw erros.foraDaUnidade();
  }

  return {
    /**
     * RN24: o administrativo cria médico, manutenção, recepção e administrativo.
     * A manutenção cria só recepcionistas da própria unidade.
     */
    async criarConta(ator: Ator, dados: DadosContaEquipe) {
      if (ator.perfil === 'manutencao') {
        if (dados.perfil !== 'recepcionista') throw erros.acessoNegado();
        exigirGestaoUnidade(ator, dados.unidadeId ?? '');
      } else if (ator.perfil !== 'administrativo') {
        throw erros.acessoNegado();
      }

      let unidadeIds: string[] | undefined;
      if (dados.perfil === 'medico') {
        if (!dados.medicoId) {
          throw erros.dadosInvalidos([
            {
              campo: 'medicoId',
              mensagem: 'Escolha o cadastro do médico que vai usar esta conta.',
            },
          ]);
        }
        const medico = await medicos.buscarPorId(dados.medicoId);
        if (!medico) throw erros.naoProcessavel('MEDICO_NAO_CADASTRADO');
        if (medico.usuarioId) {
          throw erros.dadosInvalidos([
            { campo: 'medicoId', mensagem: 'Esse médico já tem uma conta no app.' },
          ]);
        }
        unidadeIds = medico.unidadeIds;
      }

      const senha = dados.senha ?? senhaProvisoria();
      const conta = await authService.criarConta({
        nome: dados.nome,
        cpf: dados.cpf,
        email: dados.email,
        senha,
        telefone: dados.telefone,
        perfil: dados.perfil,
        unidadeId:
          dados.perfil === 'recepcionista' || dados.perfil === 'manutencao'
            ? dados.unidadeId
            : undefined,
        unidadeIds,
        status: 'ativo',
        consentimento: {
          versaoTermo: VERSAO_TERMO_ATUAL,
          aceitoEm: new Date(),
          canal: 'recepcao',
          exibicaoPainel: false,
        },
        criadoPor: ator.uid,
      });
      if (dados.perfil === 'medico' && dados.medicoId)
        await medicos.vincularUsuario(dados.medicoId, conta.id);
      auditar(ator, 'criar_conta', { id: conta.id, unidadeId: dados.unidadeId });
      return { conta, senhaProvisoria: dados.senha ? null : senha };
    },

    async listarEquipe(ator: Ator, unidadeId: string) {
      exigirGestaoUnidade(ator, unidadeId);
      const [contas, medicosDaUnidade] = await Promise.all([
        usuarios.listarDaUnidade(unidadeId),
        medicos.listarAtivos({ unidadeId }),
      ]);
      return { contas, medicos: medicosDaUnidade };
    },

    async listarPorPerfil(ator: Ator, perfil: Perfil) {
      if (ator.perfil !== 'administrativo') throw erros.acessoNegado();
      return usuarios.listarPorPerfil(perfil);
    },

    /** RN23: recepcionista não chega aqui (rota barra). Manutenção e administrativo sim. */
    async redefinirSenha(ator: Ator, usuarioId: string) {
      const alvo = await exigirGestaoDaConta(ator, usuarioId);
      const senha = senhaProvisoria();
      await auth.updateUser(alvo.id, { password: senha });
      await auth.revokeRefreshTokens(alvo.id);
      auditar(ator, 'redefinir_senha', alvo);
      return { senhaProvisoria: senha };
    },

    async alterarStatus(ator: Ator, usuarioId: string, ativo: boolean) {
      const alvo = await exigirGestaoDaConta(ator, usuarioId);
      if (alvo.id === ator.uid)
        throw erros.dadosInvalidos(undefined, 'Você não pode desativar a sua própria conta.');
      await auth.updateUser(alvo.id, { disabled: !ativo });
      if (!ativo) await auth.revokeRefreshTokens(alvo.id);
      await usuarios.definirStatus(alvo.id, ativo ? 'ativo' : 'inativo');
      auditar(ator, ativo ? 'reativar_conta' : 'desativar_conta', alvo);
    },

    // --- Pacientes (recepção, manutenção e administrativo) ----------------
    async buscarPacientePorCpf(cpf: string): Promise<Usuario | null> {
      const usuario = await usuarios.buscarPorCpf(cpf);
      return usuario?.perfil === 'paciente' ? usuario : null;
    },

    /** Pré-cadastro no balcão: a pessoa depois cria a senha pelo "Esqueci minha senha". */
    async preCadastrarPaciente(
      ator: Ator,
      dados: {
        nome: string;
        cpf: string;
        telefone?: string;
        dataNascimento?: string;
        email?: string;
        exibicaoPainel: boolean;
      },
    ) {
      const conta = await authService.criarConta({
        nome: dados.nome,
        cpf: dados.cpf,
        email: dados.email ?? `paciente.${dados.cpf}@sem-email.saude-palma.test`,
        senha: senhaProvisoria() + senhaProvisoria(),
        telefone: dados.telefone,
        dataNascimento: dados.dataNascimento,
        perfil: 'paciente',
        status: 'pre_cadastro',
        consentimento: {
          versaoTermo: VERSAO_TERMO_ATUAL,
          aceitoEm: new Date(),
          canal: 'recepcao',
          exibicaoPainel: dados.exibicaoPainel,
        },
        criadoPor: ator.uid,
      });
      auditar(ator, 'pre_cadastrar_paciente', { id: conta.id, unidadeId: ator.unidadeId });
      return conta;
    },
  };
}

export type EquipeService = ReturnType<typeof criarEquipeService>;
