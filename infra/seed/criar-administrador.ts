/**
 * Cria a PRIMEIRA conta com perfil "administrativo". Sem ela ninguém cria as
 * contas de equipe, porque nenhuma tela do app faz isso.
 *
 * Uso (na raiz do repositório):
 *   npm run seed:admin               # projeto real, lê o .env
 *   npm run seed:admin -- --emulador # Firebase Emulator Suite local
 *
 * Variáveis: ADMIN_NOME, ADMIN_EMAIL, ADMIN_CPF e, opcional, ADMIN_SENHA.
 * Sem ADMIN_SENHA, uma senha forte é gerada e mostrada UMA vez.
 * Nunca use dados reais de outra pessoa; no emulador há valores fictícios.
 */
import { randomBytes, randomInt } from 'node:crypto';
import { pathToFileURL } from 'node:url';

import { z } from 'zod';

import { carregarAmbiente } from '../../apps/api/src/config/env.js';
import { VERSAO_TERMO_ATUAL } from '../../apps/api/src/config/termo.js';
import { AppError } from '../../apps/api/src/errors/AppError.js';
import {
  inicializarFirebase,
  type ServicosFirebase,
} from '../../apps/api/src/integrations/firebaseAdmin.js';
import { criarUsuariosRepository } from '../../apps/api/src/repositories/usuarios.repository.js';
import * as campo from '../../apps/api/src/schemas/campos.js';
import { criarAuthService, type ContaCriada } from '../../apps/api/src/services/auth.service.js';

const EMULADOR = {
  FIREBASE_PROJECT_ID: 'demo-saude-palma',
  FIRESTORE_EMULATOR_HOST: '127.0.0.1:8080',
  FIREBASE_AUTH_EMULATOR_HOST: '127.0.0.1:9099',
};

const esquemaAdmin = z.object({
  nome: campo.nome,
  email: campo.email,
  cpf: campo.cpf,
  senha: campo.senha,
});

export type DadosAdmin = z.input<typeof esquemaAdmin>;

/** CPF fictício com dígitos verificadores válidos, só para o emulador. */
export function gerarCpfFicticio(): string {
  for (;;) {
    const base = Array.from({ length: 9 }, () => randomInt(10)).join('');
    for (let dv = 0; dv < 100; dv++) {
      const cpf = base + String(dv).padStart(2, '0');
      if (campo.cpfTemDigitosValidos(cpf)) return cpf;
    }
  }
}

function gerarSenha(): string {
  return randomBytes(12).toString('base64url');
}

export type ResultadoSeed =
  | { criado: true; conta: ContaCriada }
  | { criado: false; motivo: 'CPF_JA_CADASTRADO' | 'EMAIL_JA_CADASTRADO' };

/** Cria o administrativo pelo mesmo service da API (mesmas travas de CPF/e-mail). */
export async function criarAdministrador(
  firebase: ServicosFirebase,
  dados: DadosAdmin,
): Promise<ResultadoSeed> {
  const valido = esquemaAdmin.parse(dados);
  const authService = criarAuthService({
    auth: firebase.auth,
    usuarios: criarUsuariosRepository(firebase.db),
  });

  try {
    const conta = await authService.criarConta({
      ...valido,
      perfil: 'administrativo',
      status: 'ativo',
      criadoPor: 'seed',
      consentimento: {
        versaoTermo: VERSAO_TERMO_ATUAL,
        aceitoEm: new Date(),
        canal: 'seed',
        exibicaoPainel: false,
      },
    });
    return { criado: true, conta };
  } catch (erro) {
    if (
      erro instanceof AppError &&
      (erro.codigo === 'CPF_JA_CADASTRADO' || erro.codigo === 'EMAIL_JA_CADASTRADO')
    ) {
      return { criado: false, motivo: erro.codigo };
    }
    throw erro;
  }
}

async function principal(): Promise<void> {
  const noEmulador = process.argv.includes('--emulador');
  if (noEmulador) Object.assign(process.env, EMULADOR);

  const ambiente = carregarAmbiente();
  const exigir = (chave: string) => {
    const valor = process.env[chave];
    if (!valor) throw new Error(`Defina ${chave} no .env (ou rode com --emulador).`);
    return valor;
  };

  const senhaGerada = !process.env.ADMIN_SENHA;
  const dados: DadosAdmin = noEmulador
    ? {
        nome: process.env.ADMIN_NOME ?? 'Administração Teste',
        email: process.env.ADMIN_EMAIL ?? 'admin@saude-palma.test',
        cpf: process.env.ADMIN_CPF ?? gerarCpfFicticio(),
        senha: process.env.ADMIN_SENHA ?? gerarSenha(),
      }
    : {
        nome: exigir('ADMIN_NOME'),
        email: exigir('ADMIN_EMAIL'),
        cpf: exigir('ADMIN_CPF'),
        senha: process.env.ADMIN_SENHA ?? gerarSenha(),
      };

  const resultado = await criarAdministrador(inicializarFirebase(ambiente), dados);
  if (!resultado.criado) {
    console.log(`Nada a fazer: ${resultado.motivo}. A conta administrativa já existe.`);
    return;
  }

  console.log(`Conta administrativa criada em ${ambiente.FIREBASE_PROJECT_ID}.`);
  console.log(`  uid:    ${resultado.conta.id}`);
  console.log(`  e-mail: ${dados.email}`);
  if (senhaGerada) {
    console.log(`  senha:  ${dados.senha}`);
    console.log(
      '  Guarde esta senha agora: ela não é mostrada de novo. Troque no primeiro acesso.',
    );
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  principal().catch((erro: unknown) => {
    console.error(erro instanceof Error ? erro.message : erro);
    process.exit(1);
  });
}
