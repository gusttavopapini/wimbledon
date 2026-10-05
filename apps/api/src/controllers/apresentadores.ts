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
