import axios, { isAxiosError } from 'axios';

import { ambiente } from '@/ambiente';
import { obterAuth } from '@/auth/firebase';

import { erroDaResposta } from './erros';

export const api = axios.create({
  baseURL: ambiente.apiUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

// Anexa o ID token do Firebase Auth. Sem sessão, segue sem cabeçalho.
// getIdToken() renova sozinho o token perto de expirar.
api.interceptors.request.use(async (config) => {
  const usuario = obterAuth().currentUser;
  if (usuario) {
    const token = await usuario.getIdToken();
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

// Toda falha vira ErroApi, com a mensagem pronta para a tela.
api.interceptors.response.use(
  (resposta) => resposta,
  (erro: unknown) => {
    if (isAxiosError(erro)) {
      return Promise.reject(erroDaResposta(erro.response?.status ?? null, erro.response?.data));
    }
    return Promise.reject(erroDaResposta(null, null));
  },
);
