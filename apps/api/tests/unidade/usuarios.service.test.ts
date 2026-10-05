import { describe, expect, it, vi } from 'vitest';

import type { UsuariosRepository } from '../../src/repositories/usuarios.repository.js';
import { criarUsuariosService } from '../../src/services/usuarios.service.js';

const dados = {
  nome: 'Ana Teste',
  telefone: '5581999991234',
  dataNascimento: '1950-01-01',
  preferencias: { letraGrande: true, altoContraste: false, lembreteWhatsapp: true },
};

describe('usuariosService.atualizarMe', () => {
  it('envia o conjunto editável, com sexo ausente para limpar o campo', async () => {
    const atualizar = vi.fn(async () => ({ id: 'u1' }));
    const service = criarUsuariosService({
      usuarios: { atualizar } as unknown as UsuariosRepository,
    });

    await service.atualizarMe('u1', { ...dados, consentimento: { exibicaoPainel: true } });

    expect(atualizar).toHaveBeenCalledWith('u1', {
      ...dados,
      sexo: undefined,
      exibicaoPainel: true,
    });
  });

  it('responde 404 quando o usuário não existe', async () => {
    const service = criarUsuariosService({
      usuarios: { atualizar: async () => null } as unknown as UsuariosRepository,
    });
    await expect(service.atualizarMe('u1', dados)).rejects.toMatchObject({
      codigo: 'NAO_ENCONTRADO',
      status: 404,
    });
  });

  it('exige telefone para ligar o lembrete no WhatsApp', async () => {
    const atualizar = vi.fn();
    const service = criarUsuariosService({
      usuarios: { atualizar } as unknown as UsuariosRepository,
    });
    const { telefone: _telefone, ...semTelefone } = dados;
    await expect(service.atualizarMe('u1', semTelefone)).rejects.toMatchObject({
      codigo: 'DADOS_INVALIDOS',
      detalhes: [{ campo: 'telefone', mensagem: expect.stringContaining('WhatsApp') }],
    });
    expect(atualizar).not.toHaveBeenCalled();
  });
});
