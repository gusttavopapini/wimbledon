/**
 * Dados FICTÍCIOS do polo médico do Recife: 13 especialidades (as que têm ícone
 * no design system), 4 unidades e 8 médicos. Nomes de instituições e de
 * profissionais são inventados: não correspondem a nenhuma instituição ou
 * pessoa real. CNPJs e CRMs só têm formato válido.
 *
 * Idempotente: rodar de novo não duplica nada (as travas de nome, CNPJ e CRM
 * barram a repetição e o seed reaproveita o que já existe).
 */
import type { ServicosFirebase } from '../../apps/api/src/integrations/firebaseAdmin.js';
import { AppError } from '../../apps/api/src/errors/AppError.js';
import { criarEspecialidadesRepository } from '../../apps/api/src/repositories/especialidades.repository.js';
import { criarMedicosRepository } from '../../apps/api/src/repositories/medicos.repository.js';
import {
  criarUnidadesRepository,
  idTravaCnpj,
} from '../../apps/api/src/repositories/unidades.repository.js';
import { criarUsuariosRepository } from '../../apps/api/src/repositories/usuarios.repository.js';
import { schemaCriarMedico } from '../../apps/api/src/schemas/medico.schema.js';
import { schemaCriarUnidade } from '../../apps/api/src/schemas/unidade.schema.js';
import { criarEspecialidadesService } from '../../apps/api/src/services/especialidades.service.js';
import { criarMedicosService } from '../../apps/api/src/services/medicos.service.js';
import { criarUnidadesService } from '../../apps/api/src/services/unidades.service.js';
import { idDoNome } from '../../apps/api/src/utils/texto.js';

/** O id gerado do nome precisa ser o nome do arquivo em design-system/assets/Especialidades. */
export const ESPECIALIDADES = [
  {
    id: 'cardiologia',
    nome: 'Cardiologia',
    descricao: 'Cuida do coração, da pressão e da circulação do sangue.',
    palavrasChave: ['coração', 'pressão alta', 'palpitação', 'dor no peito', 'colesterol'],
  },
  {
    id: 'clinicoGeral',
    nome: 'Clínico geral',
    descricao:
      'Primeira consulta para quem não sabe qual médico procurar. Cuida da saúde como um todo.',
    palavrasChave: ['check-up', 'febre', 'gripe', 'cansaço', 'exames de rotina'],
  },
  {
    id: 'gastroenterologia',
    nome: 'Gastroenterologia',
    descricao: 'Cuida do estômago, do intestino e da digestão.',
    palavrasChave: ['estômago', 'azia', 'intestino', 'gastrite', 'prisão de ventre'],
  },
  {
    id: 'neurologia',
    nome: 'Neurologia',
    descricao: 'Cuida do cérebro, dos nervos e da memória.',
    palavrasChave: ['dor de cabeça', 'enxaqueca', 'tontura', 'memória', 'formigamento'],
  },
  {
    id: 'ortopedia',
    nome: 'Ortopedia',
    descricao: 'Cuida dos ossos, das juntas e da coluna.',
    palavrasChave: ['coluna', 'dor nas costas', 'joelho', 'fratura', 'artrose'],
  },
  {
    id: 'ginecologia',
    nome: 'Ginecologia',
    descricao: 'Cuida da saúde da mulher em todas as idades.',
    palavrasChave: ['saúde da mulher', 'menstruação', 'preventivo', 'menopausa'],
  },
  {
    id: 'dermatologia',
    nome: 'Dermatologia',
    descricao: 'Cuida da pele, do cabelo e das unhas.',
    palavrasChave: ['pele', 'mancha', 'coceira', 'alergia na pele', 'cabelo'],
  },
  {
    id: 'imunologia',
    nome: 'Imunologia',
    descricao: 'Cuida das alergias e das defesas do corpo.',
    palavrasChave: ['alergia', 'rinite', 'vacina', 'imunidade'],
  },
  {
    id: 'obstetricia',
    nome: 'Obstetrícia',
    descricao: 'Acompanha a gravidez, o parto e as semanas depois do parto.',
    palavrasChave: ['gravidez', 'pré-natal', 'gestante', 'parto'],
  },
  {
    id: 'pediatria',
    nome: 'Pediatria',
    descricao: 'Cuida da saúde de bebês, crianças e adolescentes.',
    palavrasChave: ['criança', 'bebê', 'vacina infantil', 'adolescente'],
  },
  {
    id: 'oftalmologia',
    nome: 'Oftalmologia',
    descricao: 'Cuida dos olhos e da visão.',
    palavrasChave: ['olhos', 'visão', 'óculos', 'catarata', 'vista embaçada'],
  },
  {
    id: 'otorrinolaringologia',
    nome: 'Otorrinolaringologia',
    descricao: 'Cuida do ouvido, do nariz e da garganta.',
    palavrasChave: ['ouvido', 'nariz', 'garganta', 'sinusite', 'zumbido'],
  },
  {
    id: 'pneumologia',
    nome: 'Pneumologia',
    descricao: 'Cuida dos pulmões e da respiração.',
    palavrasChave: ['pulmão', 'falta de ar', 'asma', 'tosse', 'bronquite'],
  },
] as const;

/** CNPJ fictício e determinístico (raiz 9xxxxxxx), com dígitos verificadores válidos. */
function cnpjFicticio(raiz: string): string {
  const digito = (base: string) => {
    const pesos =
      base.length === 12
        ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
        : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const resto = [...base].reduce((t, d, i) => t + Number(d) * pesos[i]!, 0) % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const base = `${raiz}0001`;
  const d1 = digito(base);
  return `${base}${d1}${digito(base + d1)}`;
}

export const UNIDADES = [
  {
    chave: 'aurora',
    nome: 'Hospital Aurora das Marés',
    tipo: 'hospital',
    cnpj: cnpjFicticio('90000001'),
    endereco: {
      logradouro: 'Rua das Jangadas',
      numero: '120',
      bairro: 'Ilha do Leite',
      cidade: 'Recife',
      uf: 'PE',
      cep: '50070120',
    },
    telefone: '8132001000',
    especialidadeIds: [
      'cardiologia',
      'clinicoGeral',
      'neurologia',
      'ortopedia',
      'gastroenterologia',
      'pneumologia',
      'pediatria',
    ],
  },
  {
    chave: 'vento',
    nome: 'Clínica Vento Leste',
    tipo: 'clinica',
    cnpj: cnpjFicticio('90000002'),
    endereco: {
      logradouro: 'Avenida dos Coqueirais',
      numero: '455',
      bairro: 'Derby',
      cidade: 'Recife',
      uf: 'PE',
      cep: '52010455',
    },
    telefone: '8132012000',
    especialidadeIds: ['dermatologia', 'ginecologia', 'obstetricia', 'clinicoGeral', 'imunologia'],
  },
  {
    chave: 'lume',
    nome: 'Policlínica Lume',
    tipo: 'clinica',
    cnpj: cnpjFicticio('90000003'),
    endereco: {
      logradouro: 'Rua dos Cajueiros',
      numero: '88',
      bairro: 'Boa Vista',
      cidade: 'Recife',
      uf: 'PE',
      cep: '50050088',
    },
    telefone: '8132023000',
    especialidadeIds: ['oftalmologia', 'otorrinolaringologia', 'clinicoGeral', 'cardiologia'],
  },
  {
    chave: 'ponte',
    nome: "Hospital Ponte d'Água",
    tipo: 'hospital',
    cnpj: cnpjFicticio('90000004'),
    endereco: {
      logradouro: 'Rua das Gaivotas',
      numero: '300',
      bairro: 'Paissandu',
      cidade: 'Recife',
      uf: 'PE',
      cep: '52010300',
    },
    telefone: '8132034000',
    especialidadeIds: [
      'pediatria',
      'obstetricia',
      'ortopedia',
      'neurologia',
      'pneumologia',
      'gastroenterologia',
    ],
  },
] as const;

type ChaveUnidade = (typeof UNIDADES)[number]['chave'];

export const MEDICOS: {
  nome: string;
  crm: string;
  especialidadeIds: string[];
  unidades: ChaveUnidade[];
}[] = [
  {
    nome: 'Dra. Helena Marinho Duarte',
    crm: '214365',
    especialidadeIds: ['cardiologia', 'clinicoGeral'],
    unidades: ['aurora', 'lume'],
  },
  {
    nome: 'Dr. Rafael Coutinho Brandão',
    crm: '198732',
    especialidadeIds: ['ortopedia'],
    unidades: ['aurora', 'ponte'],
  },
  {
    nome: 'Dra. Lívia Albuquerque Sena',
    crm: '225410',
    especialidadeIds: ['pediatria'],
    unidades: ['aurora', 'ponte'],
  },
  {
    nome: 'Dr. Tomás Rezende Pacheco',
    crm: '207118',
    especialidadeIds: ['neurologia'],
    unidades: ['aurora', 'ponte'],
  },
  {
    nome: 'Dra. Beatriz Lacerda Fontes',
    crm: '231904',
    especialidadeIds: ['ginecologia', 'obstetricia'],
    unidades: ['vento', 'ponte'],
  },
  {
    nome: 'Dr. Caio Menezes Valença',
    crm: '189655',
    especialidadeIds: ['dermatologia', 'imunologia'],
    unidades: ['vento'],
  },
  {
    nome: 'Dra. Isadora Queiroz Lins',
    crm: '219873',
    especialidadeIds: ['oftalmologia'],
    unidades: ['lume'],
  },
  {
    nome: 'Dr. Henrique Barreto Gusmão',
    crm: '203347',
    especialidadeIds: ['gastroenterologia', 'pneumologia'],
    unidades: ['aurora', 'ponte'],
  },
];

const jaExiste = (erro: unknown, codigo: string) =>
  erro instanceof AppError && erro.codigo === codigo;

export interface ResultadoCadastrosBase {
  especialidades: { criadas: number; existentes: number };
  unidades: { criadas: number; existentes: number };
  medicos: { criados: number; existentes: number };
}

/** Cria tudo pelos mesmos services da API (mesmas validações e travas). */
export async function criarCadastrosBase(
  firebase: ServicosFirebase,
): Promise<ResultadoCadastrosBase> {
  const especialidades = criarEspecialidadesRepository(firebase.db);
  const unidades = criarUnidadesRepository(firebase.db);
  const especialidadesService = criarEspecialidadesService({ especialidades });
  const unidadesService = criarUnidadesService({ unidades, especialidades });
  const medicosService = criarMedicosService({
    medicos: criarMedicosRepository(firebase.db),
    unidades,
    especialidades,
    usuarios: criarUsuariosRepository(firebase.db),
    auth: firebase.auth,
  });
  const resultado: ResultadoCadastrosBase = {
    especialidades: { criadas: 0, existentes: 0 },
    unidades: { criadas: 0, existentes: 0 },
    medicos: { criados: 0, existentes: 0 },
  };

  for (const { id, ...dados } of ESPECIALIDADES) {
    if (idDoNome(dados.nome) !== id) {
      throw new Error(
        `O nome "${dados.nome}" geraria o id ${idDoNome(dados.nome)}, e o ícone é ${id}.`,
      );
    }
    try {
      await especialidadesService.criar({ ...dados, palavrasChave: [...dados.palavrasChave] });
      resultado.especialidades.criadas++;
    } catch (erro) {
      if (!jaExiste(erro, 'ESPECIALIDADE_JA_CADASTRADA')) throw erro;
      resultado.especialidades.existentes++;
    }
  }

  const idsUnidade = new Map<ChaveUnidade, string>();
  for (const { chave, ...bruto } of UNIDADES) {
    const dados = schemaCriarUnidade.parse({
      ...bruto,
      especialidadeIds: [...bruto.especialidadeIds],
    });
    try {
      idsUnidade.set(chave, (await unidadesService.criar(dados)).id);
      resultado.unidades.criadas++;
    } catch (erro) {
      if (!jaExiste(erro, 'CNPJ_JA_CADASTRADO')) throw erro;
      const trava = await firebase.db.doc(`unicidades/${idTravaCnpj(dados.cnpj)}`).get();
      idsUnidade.set(chave, trava.get('unidadeId') as string);
      resultado.unidades.existentes++;
    }
  }

  for (const medico of MEDICOS) {
    const dados = schemaCriarMedico.parse({
      nome: medico.nome,
      conselho: { tipo: 'CRM', numero: medico.crm, uf: 'PE' },
      especialidadeIds: medico.especialidadeIds,
      unidadeIds: medico.unidades.map((chave) => idsUnidade.get(chave)!),
    });
    try {
      await medicosService.criar(dados, 'seed');
      resultado.medicos.criados++;
    } catch (erro) {
      if (!jaExiste(erro, 'CONSELHO_JA_CADASTRADO')) throw erro;
      resultado.medicos.existentes++;
    }
  }

  return resultado;
}
