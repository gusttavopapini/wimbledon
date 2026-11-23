import { z } from 'zod';

import { PERFIS } from './campos.js';
import * as campo from './campos.js';

const hora = z
  .string({ error: 'Escolha o horário. Exemplo: 09:30' })
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Escolha o horário no formato 09:30.');

const urgencia = z.enum(['rotina', 'prioritario', 'emergencia'], {
  error: 'Escolha a urgência: rotina, prioritario ou emergencia.',
});

export const paramsId = z.strictObject({ id: campo.idDocumento });
export const paramsUnidade = z.strictObject({ unidadeId: campo.idDocumento });

// --- Agenda ----------------------------------------------------------------
export const filtrosHorarios = z.strictObject({
  unidadeId: campo.idDocumento,
  de: campo.dataCalendario.optional(),
  dias: z.coerce.number().int().min(1).max(60).default(14),
});

export const schemaConsultorio = z.strictObject({
  nome: z.string().trim().min(1, 'Digite o nome do consultório. Exemplo: Consultório 3').max(60),
});
export const schemaAtualizarConsultorio = z.strictObject({
  nome: z.string().trim().min(1).max(60).optional(),
  ativo: z.boolean().optional(),
});

export const schemaDisponibilidade = z
  .strictObject({
    unidadeId: campo.idDocumento,
    diaSemana: z
      .number()
      .int()
      .min(0, 'Escolha o dia da semana.')
      .max(6, 'Escolha o dia da semana.'),
    inicio: hora,
    fim: hora,
    duracaoMinutos: z.number().int().min(10).max(240).default(30),
  })
  .refine((d) => d.fim > d.inicio, {
    path: ['fim'],
    message: 'O fim precisa ser depois do início.',
  });

export const schemaBloqueio = z.strictObject({
  unidadeId: campo.idDocumento.nullable().default(null),
  data: campo.dataCalendario,
  inicio: hora.nullable().default(null),
  fim: hora.nullable().default(null),
  motivo: z.string().trim().min(1, 'Diga o motivo do bloqueio. Exemplo: congresso').max(200),
});

// --- Chamados ----------------------------------------------------------------
export const schemaAgendar = z.strictObject({
  medicoId: campo.idDocumento,
  unidadeId: campo.idDocumento,
  especialidadeId: campo.idDocumento,
  data: campo.dataCalendario,
  hora,
  formaPagamento: z.enum(['convenio', 'particular', 'sus']).optional(),
  preTriagemId: campo.idDocumento.optional(),
  pacienteId: campo.idDocumento.optional(),
});

export const schemaReagendar = z.strictObject({
  data: campo.dataCalendario,
  hora,
  medicoId: campo.idDocumento.optional(),
});

export const filtrosAgendaDia = z.strictObject({ data: campo.dataCalendario.optional() });

export const schemaEspontaneo = z.strictObject({
  unidadeId: campo.idDocumento,
  pacienteId: campo.idDocumento,
  especialidadeId: campo.idDocumento,
  urgencia: urgencia.default('rotina'),
});

const documento = z.strictObject({
  tipo: z.enum(['receita', 'atestado', 'solicitacao_exame', 'orientacao']),
  titulo: z.string().trim().min(1).max(120),
  conteudo: z.string().trim().min(1, 'Escreva o conteúdo do documento.').max(4000),
  itens: z.array(z.string().trim().min(1).max(300)).max(30).optional(),
});

export const schemaConcluir = z.strictObject({
  orientacao: z.string().trim().max(2000).optional(),
  documentos: z.array(documento).max(10).default([]),
});

export const schemaAcaoAtendimento = z.strictObject({
  acao: z.enum(['iniciar', 'nao_compareceu', 'emergencia']),
});

// --- Plantão -----------------------------------------------------------------
export const schemaAbrirPlantao = z.strictObject({
  unidadeId: campo.idDocumento,
  consultorioId: campo.idDocumento,
});

// --- Pré-triagem ---------------------------------------------------------------
export const schemaTriagem = z.strictObject({
  relato: z
    .string({ error: 'Conte com suas palavras o que está sentindo.' })
    .trim()
    .min(5, 'Conte um pouco mais sobre o que está sentindo.')
    .max(2000, 'O texto ficou longo demais. Resuma em até 2.000 letras.'),
});

// --- Painel --------------------------------------------------------------------
export const schemaConsultaPareamento = z.strictObject({
  codigo: z.string().regex(/^\d{6}$/, 'O código tem 6 números.'),
  segredo: z.string().min(10).max(100),
});
export const schemaAprovarPareamento = z.strictObject({
  codigo: z.string().regex(/^\d{6}$/, 'Digite os 6 números que aparecem na TV.'),
  nome: z.string().trim().min(1, 'Dê um nome para a TV. Exemplo: TV da recepção').max(60),
});

// --- Equipe e pacientes ----------------------------------------------------
export const schemaContaEquipe = z.strictObject({
  nome: campo.nome,
  cpf: campo.cpf,
  email: campo.email,
  telefone: campo.telefone.optional(),
  senha: campo.senha.optional(),
  perfil: z.enum(PERFIS).exclude(['paciente'], { error: 'Escolha o perfil da conta.' }),
  unidadeId: campo.idDocumento.optional(),
  medicoId: campo.idDocumento.optional(),
});

export const filtrosContas = z.strictObject({
  perfil: z.enum(PERFIS),
});

export const schemaStatusConta = z.strictObject({ ativo: z.boolean() });

export const filtrosPaciente = z.strictObject({ cpf: campo.cpf });

export const schemaPreCadastro = z.strictObject({
  nome: campo.nome,
  cpf: campo.cpf,
  telefone: campo.telefone.optional(),
  dataNascimento: campo.dataCalendario.optional(),
  email: campo.email.optional(),
  exibicaoPainel: z.boolean().default(false),
});

export const schemaPushToken = z.strictObject({
  token: z
    .string()
    .regex(/^Expo(nent)?PushToken\[.+\]$/, 'Token de notificação em formato inesperado.'),
});

// --- Integrações (N8N) ------------------------------------------------------
export const schemaTriagemIntegracao = z.strictObject({
  telefone: campo.telefone,
  relato: schemaTriagem.shape.relato,
  idade: z.number().int().min(0).max(130).optional(),
  sexo: campo.sexo.optional(),
});

export const schemaAgendarIntegracao = z.strictObject({
  telefone: campo.telefone,
  medicoId: campo.idDocumento,
  unidadeId: campo.idDocumento,
  especialidadeId: campo.idDocumento,
  data: campo.dataCalendario,
  hora,
  preTriagemId: campo.idDocumento.optional(),
});

export const schemaCancelarIntegracao = z.strictObject({ telefone: campo.telefone });
export const paramsTelefone = z.strictObject({ telefone: campo.telefone });

export const filtrosHorariosIntegracao = z.strictObject({
  medicoId: campo.idDocumento,
  unidadeId: campo.idDocumento,
  de: campo.dataCalendario.optional(),
});
