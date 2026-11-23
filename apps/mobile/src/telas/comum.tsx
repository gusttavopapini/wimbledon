import type { ReactNode } from 'react';
import { View } from 'react-native';

import type { ErroApi } from '@/api/erros';
import { comoErroApi } from '@/api/erros';
import { Botao } from '@/components/Botao';
import { Mensagem } from '@/components/Mensagem';
import { Texto } from '@/components/Texto';
import { Topo } from '@/components/Topo';
import { useSessao } from '@/hooks/useSessao';
import { useTema } from '@/hooks/useTema';

const NOME_PERFIL = {
  paciente: 'Paciente',
  recepcionista: 'Recepção',
  medico: 'Médico',
  manutencao: 'Manutenção',
  administrativo: 'Administrativo',
} as const;

/** Topo das áreas da equipe: quem está logado, onde, e o botão de sair. */
export function TopoEquipe({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children?: ReactNode;
}) {
  const { usuario, sair } = useSessao();
  return (
    <Topo
      titulo={titulo}
      subtitulo={
        subtitulo ?? (usuario ? `${usuario.nome} · ${NOME_PERFIL[usuario.perfil]}` : undefined)
      }
    >
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {children}
        <Botao variante="secundario" sobreTopo icone="log-out" aoTocar={() => void sair()}>
          Sair
        </Botao>
      </View>
    </Topo>
  );
}

/** Erro da API com a lista de campos a corrigir. */
export function MensagemErro({
  erro,
  titulo = 'Não deu certo',
}: {
  erro: unknown;
  titulo?: string;
}) {
  const { espacamento } = useTema();
  if (!erro) return null;
  const e: ErroApi = comoErroApi(erro);
  return (
    <View style={{ gap: espacamento.espacamento8 }}>
      <Mensagem tipo="erro" titulo={titulo}>
        {e.message}
      </Mensagem>
      {e.detalhes.map((d) => (
        <Texto key={d.campo} estilo="apoio" cor="erro">
          {`• ${d.mensagem}`}
        </Texto>
      ))}
    </View>
  );
}
