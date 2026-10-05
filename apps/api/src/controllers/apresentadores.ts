import type { Especialidade, Medico, Unidade } from '../types/cadastros.js';
import type { Usuario } from '../types/usuario.js';
import { paraIsoLocal } from '../utils/datas.js';

/** Usuário como sai na API: datas em ISO 8601 com offset local (-03:00). */
export function apresentarUsuario(usuario: Usuario, fuso: string) {
  return {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    cpf: usuario.cpf,
    telefone: usuario.telefone ?? null,
    dataNascimento: usuario.dataNascimento ?? null,
    sexo: usuario.sexo ?? null,
    perfil: usuario.perfil,
    unidadeId: usuario.unidadeId ?? null,
    unidadeIds: usuario.unidadeIds ?? [],
    preferencias: usuario.preferencias,
    consentimento: {
      versaoTermo: usuario.consentimento.versaoTermo,
      aceitoEm: paraIsoLocal(usuario.consentimento.aceitoEm, fuso),
      canal: usuario.consentimento.canal,
      exibicaoPainel: usuario.consentimento.exibicaoPainel,
    },
    status: usuario.status,
    criadoEm: paraIsoLocal(usuario.criadoEm, fuso),
    atualizadoEm: paraIsoLocal(usuario.atualizadoEm, fuso),
  };
}

export function apresentarEspecialidade(especialidade: Especialidade, fuso: string) {
  return {
    id: especialidade.id,
    nome: especialidade.nome,
    descricao: especialidade.descricao,
    palavrasChave: especialidade.palavrasChave,
    ativa: especialidade.ativa,
    criadoEm: paraIsoLocal(especialidade.criadoEm, fuso),
    atualizadoEm: paraIsoLocal(especialidade.atualizadoEm, fuso),
  };
}

export function apresentarUnidade(unidade: Unidade, fuso: string) {
  return {
    id: unidade.id,
    nome: unidade.nome,
    tipo: unidade.tipo,
    cnpj: unidade.cnpj,
    endereco: unidade.endereco,
    bairroBusca: unidade.bairroBusca,
    telefone: unidade.telefone,
    especialidadeIds: unidade.especialidadeIds,
    ativa: unidade.ativa,
    criadoEm: paraIsoLocal(unidade.criadoEm, fuso),
    atualizadoEm: paraIsoLocal(unidade.atualizadoEm, fuso),
  };
}

/** Visão pública: sem a conta ligada nem quem cadastrou. */
export function apresentarMedico(medico: Medico, fuso: string) {
  return {
    id: medico.id,
    nome: medico.nome,
    conselho: medico.conselho,
    especialidadeIds: medico.especialidadeIds,
    unidadeIds: medico.unidadeIds,
    ativo: medico.ativo,
    criadoEm: paraIsoLocal(medico.criadoEm, fuso),
    atualizadoEm: paraIsoLocal(medico.atualizadoEm, fuso),
  };
}

/** Visão de quem administra (respostas de POST/PUT do administrativo). */
export function apresentarMedicoCompleto(medico: Medico, fuso: string) {
  return {
    ...apresentarMedico(medico, fuso),
    usuarioId: medico.usuarioId,
    criadoPorAdministrativo: medico.criadoPorAdministrativo,
  };
}
