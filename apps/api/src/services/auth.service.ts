import type { Auth } from 'firebase-admin/auth';

import { VERSAO_TERMO_ATUAL } from '../config/termo.js';
import { erros } from '../errors/AppError.js';
import type { UsuariosRepository } from '../repositories/usuarios.repository.js';
import { PREFERENCIAS_PADRAO, type Perfil, type StatusUsuario } from '../schemas/campos.js';
import type { DadosCadastro } from '../schemas/auth.schema.js';
import type { Consentimento, NovoUsuario, Usuario } from '../types/usuario.js';

export interface DadosConta {
  nome: string;
  cpf: string;
  email: string;
  senha: string;
  telefone?: string;
  dataNascimento?: string;
  sexo?: string;
  perfil: Perfil;
  unidadeId?: string;
  unidadeIds?: string[];
  status: StatusUsuario;
  consentimento: Consentimento;
  /** uid de quem criou; no autocadastro, o próprio uid. */
  criadoPor?: string;
}

export interface ContaCriada {
  id: string;
  nome: string;
  perfil: Perfil;
  status: StatusUsuario;
}

const PERFIS_COM_UNIDADE: Perfil[] = ['recepcionista', 'manutencao'];

/** Claims que vão no ID token: o perfil e o escopo de unidade. Só a API define. */
export function montarClaims(
  conta: Pick<DadosConta, 'perfil' | 'unidadeId' | 'unidadeIds'>,
): Record<string, unknown> {
  return {
    perfil: conta.perfil,
    ...(conta.unidadeId ? { unidadeId: conta.unidadeId } : {}),
    ...(conta.unidadeIds?.length ? { unidadeIds: conta.unidadeIds } : {}),
  };
}

function codigoAuth(erro: unknown): string | undefined {
  return (erro as { code?: string } | undefined)?.code;
}

export function criarAuthService(deps: {
  auth: Auth;
  usuarios: UsuariosRepository;
  agora?: () => Date;
}) {
  const { auth, usuarios } = deps;
  const agora = deps.agora ?? (() => new Date());

  /**
   * Cria a conta em três passos: (1) usuário + travas de CPF/e-mail numa
   * transação do Firestore, (2) conta no Firebase Auth com o mesmo uid,
   * (3) custom claims. Se (2) ou (3) falhar, desfaz o que foi feito.
   */
  async function criarConta(dados: DadosConta): Promise<ContaCriada> {
    if (PERFIS_COM_UNIDADE.includes(dados.perfil) && !dados.unidadeId) {
      throw erros.dadosInvalidos([
        { campo: 'unidadeId', mensagem: 'Escolha a unidade onde a pessoa trabalha.' },
      ]);
    }
    if (dados.perfil === 'medico' && !dados.unidadeIds?.length) {
      throw erros.dadosInvalidos([
        { campo: 'unidadeIds', mensagem: 'Escolha ao menos uma unidade onde o médico atende.' },
      ]);
    }

    const id = usuarios.novoId();
    const novo: NovoUsuario = {
      id,
      nome: dados.nome,
      email: dados.email,
      cpf: dados.cpf,
      telefone: dados.telefone,
      dataNascimento: dados.dataNascimento,
      sexo: dados.sexo,
      perfil: dados.perfil,
      unidadeId: dados.unidadeId,
      unidadeIds: dados.unidadeIds,
      preferencias: { ...PREFERENCIAS_PADRAO },
      consentimento: dados.consentimento,
      expoPushTokens: [],
      status: dados.status,
      criadoPor: dados.criadoPor ?? id,
    };

    const { conflito } = await usuarios.criarComUnicidade(novo);
    if (conflito === 'cpf') throw erros.cpfJaCadastrado();
    if (conflito === 'email') throw erros.emailJaCadastrado();

    let criouNoAuth = false;
    try {
      await auth.createUser({
        uid: id,
        email: dados.email,
        password: dados.senha,
        displayName: dados.nome,
        disabled: dados.status === 'inativo',
      });
      criouNoAuth = true;
      await auth.setCustomUserClaims(id, montarClaims(dados));
    } catch (erro) {
      if (criouNoAuth) await auth.deleteUser(id).catch(() => undefined);
      await usuarios.removerCriacao(novo);
      // E-mail já usado no Auth sem trava (ex.: conta criada pelo console).
      if (codigoAuth(erro) === 'auth/email-already-exists') throw erros.emailJaCadastrado();
      throw erro;
    }

    return { id, nome: novo.nome, perfil: novo.perfil, status: novo.status };
  }

  return {
    criarConta,

    /** Autocadastro público: sempre paciente, ativo, com consentimento registrado agora. */
    async cadastrarPaciente(dados: DadosCadastro): Promise<ContaCriada> {
      return criarConta({
        nome: dados.nome,
        cpf: dados.cpf,
        email: dados.email,
        senha: dados.senha,
        telefone: dados.telefone,
        dataNascimento: dados.dataNascimento,
        sexo: dados.sexo,
        perfil: 'paciente',
        status: 'ativo',
        consentimento: {
          versaoTermo: VERSAO_TERMO_ATUAL,
          aceitoEm: agora(),
          canal: dados.consentimento.canal,
          exibicaoPainel: dados.consentimento.exibicaoPainel,
        },
      });
    },

    async buscarMe(uid: string): Promise<Usuario> {
      const usuario = await usuarios.buscarPorId(uid);
      if (!usuario) {
        throw erros.naoEncontrado(
          'Não encontramos os dados da sua conta. Saia e entre de novo; se continuar, fale com a recepção.',
        );
      }
      return usuario;
    },
  };
}

export type AuthService = ReturnType<typeof criarAuthService>;
