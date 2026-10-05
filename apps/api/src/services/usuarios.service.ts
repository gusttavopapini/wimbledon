import { erros } from '../errors/AppError.js';
import type { UsuariosRepository } from '../repositories/usuarios.repository.js';
import type { DadosAtualizarMe } from '../schemas/usuario.schema.js';
import type { Usuario } from '../types/usuario.js';

export function criarUsuariosService(deps: { usuarios: UsuariosRepository }) {
  const { usuarios } = deps;

  return {
    /**
     * Substitui os dados editáveis do próprio usuário. Desligar o lembrete por
     * WhatsApp é sempre possível; ligar exige telefone, que o schema já garante.
     */
    async atualizarMe(uid: string, dados: DadosAtualizarMe): Promise<Usuario> {
      const atualizado = await usuarios.atualizar(uid, {
        nome: dados.nome,
        telefone: dados.telefone,
        dataNascimento: dados.dataNascimento,
        sexo: dados.sexo,
        preferencias: dados.preferencias,
        exibicaoPainel: dados.consentimento?.exibicaoPainel,
      });
      if (!atualizado) {
        throw erros.naoEncontrado(
          'Não encontramos os dados da sua conta. Saia e entre de novo; se continuar, fale com a recepção.',
        );
      }
      return atualizado;
    },
  };
}

export type UsuariosService = ReturnType<typeof criarUsuariosService>;
