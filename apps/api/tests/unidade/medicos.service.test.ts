import { describe, expect, it, vi } from 'vitest';

import type { EspecialidadesRepository } from '../../src/repositories/especialidades.repository.js';
import type { MedicosRepository } from '../../src/repositories/medicos.repository.js';
import type { UnidadesRepository } from '../../src/repositories/unidades.repository.js';
import type { UsuariosRepository } from '../../src/repositories/usuarios.repository.js';
import { criarMedicosService } from '../../src/services/medicos.service.js';
import type { Medico } from '../../src/types/cadastros.js';

const anterior: Medico = {
  id: 'm1',
  usuarioId: 'contaAntiga',
  nome: 'Dra. Teste',
  conselho: { tipo: 'CRM', numero: '123', uf: 'PE' },
  especialidadeIds: ['cardiologia'],
  unidadeIds: ['a', 'b'],
  ativo: true,
  criadoPorAdministrativo: 'adm',
  criadoEm: new Date(),
  atualizadoEm: new Date(),
};

function montar() {
  const todos = async (ids: string[]) => new Set(ids);
  const medicos = {
    substituir: vi.fn(async () => ({ resultado: 'ok' as const, anterior })),
    buscarPorId: vi.fn(async () => anterior),
  };
  const usuarios = {
    buscarPorId: vi.fn(async () => ({ perfil: 'medico' })),
    definirUnidades: vi.fn(async () => undefined),
  };
  const auth = {
    setCustomUserClaims: vi.fn(async () => undefined),
    revokeRefreshTokens: vi.fn(async () => undefined),
  };
  const service = criarMedicosService({
    medicos: medicos as unknown as MedicosRepository,
    unidades: { idsAtivos: todos } as unknown as UnidadesRepository,
    especialidades: { idsAtivos: todos } as unknown as EspecialidadesRepository,
    usuarios: usuarios as unknown as UsuariosRepository,
    auth,
  });
  return { service, auth, usuarios };
}

const base = {
  nome: 'Dra. Teste',
  conselho: { tipo: 'CRM' as const, numero: '123', uf: 'PE' as const },
  especialidadeIds: ['cardiologia'],
  unidadeIds: ['a', 'b'],
};

describe('medicosService.atualizar: conta ligada', () => {
  it('trocar a conta tira as unidades da antiga e dá à nova', async () => {
    const { service, auth } = montar();
    await service.atualizar('m1', { ...base, usuarioId: 'contaNova', ativo: true });

    expect(auth.setCustomUserClaims).toHaveBeenCalledWith('contaAntiga', { perfil: 'medico' });
    expect(auth.revokeRefreshTokens).toHaveBeenCalledWith('contaAntiga');
    expect(auth.setCustomUserClaims).toHaveBeenCalledWith('contaNova', {
      perfil: 'medico',
      unidadeIds: ['a', 'b'],
    });
    expect(auth.revokeRefreshTokens).not.toHaveBeenCalledWith('contaNova');
  });

  it('desativar pelo PUT tira todas as unidades e derruba a sessão', async () => {
    const { service, auth, usuarios } = montar();
    await service.atualizar('m1', { ...base, usuarioId: 'contaAntiga', ativo: false });

    expect(usuarios.definirUnidades).toHaveBeenCalledWith('contaAntiga', []);
    expect(auth.revokeRefreshTokens).toHaveBeenCalledWith('contaAntiga');
  });

  it('sem mudança de unidades não revoga a sessão', async () => {
    const { service, auth } = montar();
    await service.atualizar('m1', { ...base, usuarioId: 'contaAntiga', ativo: true });
    expect(auth.revokeRefreshTokens).not.toHaveBeenCalled();
  });
});
