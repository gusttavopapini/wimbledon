import { router } from 'expo-router';
import { View } from 'react-native';

import type { Documento } from '@/api/atendimento';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { EstadoTela } from '@/components/EstadoTela';
import { Folha } from '@/components/Folha';
import { ItemLista, Secao } from '@/components/Pecas';
import { Tela } from '@/components/Tela';
import { useMeusDocumentos } from '@/hooks/useAtendimento';
import { useTema } from '@/hooks/useTema';
import { useVoltar } from '@/hooks/useVoltar';
import { diaPorExtenso } from '@/utils/datas';

export const ICONE_DOCUMENTO = {
  receita: 'pill',
  solicitacao_exame: 'flask-conical',
  atestado: 'clipboard-check',
  orientacao: 'file-text',
} as const;

export default function MeusDocumentos() {
  const voltar = useVoltar('/');
  const { data, isPending, isError, refetch } = useMeusDocumentos();
  const grupo = (tipos: Documento['tipo'][]) => data?.filter((d) => tipos.includes(d.tipo)) ?? [];

  return (
    <Tela>
      <Folha semTopo>
        <CabecalhoTela titulo="Receitas e exames" aoVoltar={voltar} />
        {isPending ? <EstadoTela tipo="carregando" titulo="Carregando seus documentos" /> : null}
        {isError ? (
          <EstadoTela tipo="erro" titulo="Não conseguimos carregar" aoAgir={() => void refetch()} />
        ) : null}
        {data && data.length === 0 ? (
          <EstadoTela
            tipo="vazio"
            icone="file-text"
            titulo="Ainda não há documentos"
            mensagem="Receitas, pedidos de exame e atestados aparecem aqui depois da consulta."
          />
        ) : null}
        <Grupo titulo="Receitas" itens={grupo(['receita'])} />
        <Grupo titulo="Pedidos de exame" itens={grupo(['solicitacao_exame'])} />
        <Grupo titulo="Atestados e orientações" itens={grupo(['atestado', 'orientacao'])} />
      </Folha>
    </Tela>
  );
}

function Grupo({ titulo, itens }: { titulo: string; itens: Documento[] }) {
  const { espacamento } = useTema();
  if (itens.length === 0) return null;
  return (
    <Secao titulo={titulo}>
      <View style={{ gap: espacamento.espacamento12 }}>
        {itens.map((d) => (
          <ItemLista
            key={d.id}
            icone={ICONE_DOCUMENTO[d.tipo]}
            titulo={d.titulo}
            subtitulo={d.medico.nome}
            detalhe={diaPorExtenso(d.emitidoEm.slice(0, 10))}
            aoTocar={() => router.push(`/documentos/${d.id}`)}
          />
        ))}
      </View>
    </Secao>
  );
}
