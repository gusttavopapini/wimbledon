import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';

import { buscarMe, cadastrar, type DadosCadastro, type Usuario } from '@/api/auth';
import { comoErroApi, type ErroApi } from '@/api/erros';
import { useTema } from '@/hooks/useTema';

import { obterAuth } from './firebase';
import { erroDoFirebase } from './sessao';

export type EstadoSessao = 'carregando' | 'entrou' | 'deslogado';

export interface ValorSessao {
  estado: EstadoSessao;
  usuario: Usuario | null;
  /** Falha ao carregar o perfil depois do login (ex.: sem internet). */
  falha: ErroApi | null;
  tentarDeNovo: () => void;
  entrar: (email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
  /** Cria a conta pela API e já entra com ela. */
  criarConta: (dados: DadosCadastro) => Promise<void>;
  enviarLinkNovaSenha: (email: string) => Promise<void>;
}

export const ContextoSessao = createContext<ValorSessao | null>(null);

const CHAVE_ME = ['auth', 'me'] as const;

/**
 * Sessão do app. O Firebase Auth diz SE há alguém logado; o perfil e os dados
 * vêm sempre da API (GET /auth/me). Nenhum dado sai do Firestore direto.
 */
export function SessaoProvider({ children }: { children: ReactNode }) {
  const auth = obterAuth();
  const queryClient = useQueryClient();
  const { definirPreferencias } = useTema();
  const [usuarioFirebase, setUsuarioFirebase] = useState<User | null | undefined>(undefined);

  useEffect(() => onAuthStateChanged(auth, setUsuarioFirebase), [auth]);

  const me = useQuery({
    queryKey: [...CHAVE_ME, usuarioFirebase?.uid],
    queryFn: buscarMe,
    enabled: Boolean(usuarioFirebase),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  // Token recusado pela API (conta desativada, sessão revogada): sai de vez.
  useEffect(() => {
    if (me.error && comoErroApi(me.error).codigo === 'NAO_AUTENTICADO') void signOut(auth);
  }, [me.error, auth]);

  // As preferências de acessibilidade da conta valem em qualquer aparelho.
  const preferencias = me.data?.usuario.preferencias;
  useEffect(() => {
    if (preferencias) {
      definirPreferencias({
        letraGrande: preferencias.letraGrande,
        altoContraste: preferencias.altoContraste,
      });
    }
  }, [preferencias, definirPreferencias]);

  const entrar = useCallback(
    async (email: string, senha: string) => {
      try {
        const credencial = await signInWithEmailAndPassword(auth, email.trim(), senha);
        await queryClient.fetchQuery({
          queryKey: [...CHAVE_ME, credencial.user.uid],
          queryFn: buscarMe,
        });
      } catch (erro) {
        throw erroDoFirebase(erro);
      }
    },
    [auth, queryClient],
  );

  const sair = useCallback(async () => {
    await signOut(auth);
    queryClient.clear();
    definirPreferencias({ letraGrande: false, altoContraste: false });
  }, [auth, queryClient, definirPreferencias]);

  const criarConta = useCallback(
    async (dados: DadosCadastro) => {
      await cadastrar(dados);
      await entrar(dados.email, dados.senha);
    },
    [entrar],
  );

  const enviarLinkNovaSenha = useCallback(
    async (email: string) => {
      try {
        await sendPasswordResetEmail(auth, email.trim());
      } catch (erro) {
        throw erroDoFirebase(erro);
      }
    },
    [auth],
  );

  const { data: dadosMe, error: erroMe, refetch } = me;
  const valor = useMemo<ValorSessao>(() => {
    const falha = erroMe && usuarioFirebase ? comoErroApi(erroMe) : null;
    let estado: EstadoSessao = 'carregando';
    if (usuarioFirebase === null) estado = 'deslogado';
    else if (usuarioFirebase && dadosMe) estado = 'entrou';
    return {
      estado,
      usuario: dadosMe?.usuario ?? null,
      falha: falha && falha.codigo !== 'NAO_AUTENTICADO' ? falha : null,
      tentarDeNovo: () => void refetch(),
      entrar,
      sair,
      criarConta,
      enviarLinkNovaSenha,
    };
  }, [usuarioFirebase, dadosMe, erroMe, refetch, entrar, sair, criarConta, enviarLinkNovaSenha]);

  return <ContextoSessao.Provider value={valor}>{children}</ContextoSessao.Provider>;
}
