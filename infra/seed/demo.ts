/**
 * Dados de DEMONSTRAÇÃO (fictícios): consultórios, agenda semanal dos médicos
 * e uma conta de teste para cada perfil, para apresentar o app de ponta a ponta.
 *
 * Idempotente: rodar de novo não duplica nada.
 * As contas usam e-mails @saude-palma.test e a senha SENHA_DEMO (padrão abaixo).
 * Em produção com dados reais, desative ou apague essas contas.
 */
import type { ServicosFirebase } from '../../apps/api/src/integrations/firebaseAdmin.js';
import { VERSAO_TERMO_ATUAL } from '../../apps/api/src/config/termo.js';
import { AppError } from '../../apps/api/src/errors/AppError.js';
import { criarAgendaRepository } from '../../apps/api/src/repositories/agenda.repository.js';
import { criarMedicosRepository } from '../../apps/api/src/repositories/medicos.repository.js';
import { criarUnidadesRepository } from '../../apps/api/src/repositories/unidades.repository.js';
import { criarUsuariosRepository } from '../../apps/api/src/repositories/usuarios.repository.js';
import * as campo from '../../apps/api/src/schemas/campos.js';
import { criarAuthService } from '../../apps/api/src/services/auth.service.js';
import type { Perfil } from '../../apps/api/src/schemas/campos.js';

export const SENHA_DEMO_PADRAO = 'SaudePalma@2026';

/** CPFs fictícios fixos (dígitos válidos), para o seed ser repetível. */
function cpfDeterministico(semente: number): string {
  const base = String(100_000_000 + semente * 7_919).slice(0, 9);
  for (let dv = 0; dv < 100; dv++) {
    const cpf = base + String(dv).padStart(2, '0');
    if (campo.cpfTemDigitosValidos(cpf)) return cpf;
  }
  throw new Error('não achei CPF');
}

interface ContaDemo {
  rotulo: string;
  nome: string;
  email: string;
  perfil: Perfil;
  unidade?: string;
  medicoCrm?: string;
  telefone?: string;
  dataNascimento?: string;
  sexo?: string;
}

const CONTAS: ContaDemo[] = [
  {
    rotulo: 'Administrativo',
    nome: 'Admin Demonstração',
    email: 'admin@saude-palma.test',
    perfil: 'administrativo',
  },
  {
    rotulo: 'Paciente',
    nome: 'Maria das Graças Teste',
    email: 'paciente@saude-palma.test',
    perfil: 'paciente',
    telefone: '5581990000001',
    dataNascimento: '1952-03-12',
    sexo: 'feminino',
  },
  {
    rotulo: 'Recepcionista (Hospital Aurora)',
    nome: 'Rita Recepção Teste',
    email: 'recepcao@saude-palma.test',
    perfil: 'recepcionista',
    unidade: 'Hospital Aurora das Marés',
  },
  {
    rotulo: 'Manutenção (Hospital Aurora)',
    nome: 'Marcos Manutenção Teste',
    email: 'manutencao@saude-palma.test',
    perfil: 'manutencao',
    unidade: 'Hospital Aurora das Marés',
  },
  {
    rotulo: 'Médica (Dra. Helena, Aurora e Lume)',
    nome: 'Helena Marinho Duarte',
    email: 'medica@saude-palma.test',
    perfil: 'medico',
    medicoCrm: '214365',
  },
  {
    rotulo: 'Médico (Dr. Henrique, Aurora e Ponte)',
    nome: 'Henrique Barreto Gusmão',
    email: 'medico@saude-palma.test',
    perfil: 'medico',
    medicoCrm: '203347',
  },
];

export async function criarDemo(firebase: ServicosFirebase, senha: string) {
  const usuarios = criarUsuariosRepository(firebase.db);
  const medicos = criarMedicosRepository(firebase.db);
  const unidades = criarUnidadesRepository(firebase.db);
  const agenda = criarAgendaRepository(firebase.db);
  const authService = criarAuthService({ auth: firebase.auth, usuarios });

  const todasUnidades = await unidades.listarAtivas({});
  const todosMedicos = await medicos.listarAtivos({});

  // 1) Três consultórios por unidade.
  let consultorios = 0;
  for (const u of todasUnidades) {
    const existentes = await agenda.listarConsultorios(u.id);
    for (const nome of ['Consultório 1', 'Consultório 2', 'Consultório 3']) {
      if (existentes.some((c) => c.nome === nome)) continue;
      await agenda.criarConsultorio({ unidadeId: u.id, nome, ativo: true });
      consultorios++;
    }
  }

  // 2) Agenda semanal: seg a sex, 08:00-12:00 e 14:00-17:00, consultas de 30 min.
  //    Médicos com 2 unidades alternam: manhã numa, tarde na outra.
  let janelas = 0;
  for (const m of todosMedicos) {
    if ((await agenda.listarDisponibilidades(m.id)).length > 0) continue;
    const [manha, tarde = manha] = m.unidadeIds;
    for (let dia = 1; dia <= 5; dia++) {
      await agenda.criarDisponibilidade({
        medicoId: m.id,
        unidadeId: manha!,
        diaSemana: dia,
        inicio: '08:00',
        fim: '12:00',
        duracaoMinutos: 30,
        ativa: true,
      });
      await agenda.criarDisponibilidade({
        medicoId: m.id,
        unidadeId: tarde!,
        diaSemana: dia,
        inicio: '14:00',
        fim: '17:00',
        duracaoMinutos: 30,
        ativa: true,
      });
      janelas += 2;
    }
  }

  // 3) Uma conta por perfil.
  const linhas: string[] = [];
  for (const [i, conta] of CONTAS.entries()) {
    const unidadeId = conta.unidade
      ? todasUnidades.find((u) => u.nome === conta.unidade)?.id
      : undefined;
    const medico = conta.medicoCrm
      ? todosMedicos.find((m) => m.conselho.numero === conta.medicoCrm)
      : undefined;
    try {
      const criada = await authService.criarConta({
        nome: conta.nome,
        cpf: cpfDeterministico(i + 1),
        email: conta.email,
        senha,
        telefone: conta.telefone,
        dataNascimento: conta.dataNascimento,
        sexo: conta.sexo,
        perfil: conta.perfil,
        unidadeId,
        unidadeIds: medico?.unidadeIds,
        status: 'ativo',
        consentimento: {
          versaoTermo: VERSAO_TERMO_ATUAL,
          aceitoEm: new Date(),
          canal: 'seed',
          exibicaoPainel: false,
        },
        criadoPor: 'seed',
      });
      if (medico && !medico.usuarioId) await medicos.vincularUsuario(medico.id, criada.id);
      linhas.push(`  ${conta.rotulo.padEnd(40)} ${conta.email}`);
    } catch (erro) {
      if (
        erro instanceof AppError &&
        ['CPF_JA_CADASTRADO', 'EMAIL_JA_CADASTRADO'].includes(erro.codigo)
      ) {
        linhas.push(`  ${conta.rotulo.padEnd(40)} ${conta.email} (já existia)`);
        continue;
      }
      throw erro;
    }
  }

  return { consultorios, janelas, linhas };
}
