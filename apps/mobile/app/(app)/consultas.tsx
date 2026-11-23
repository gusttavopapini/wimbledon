import { router } from 'expo-router';
import { View } from 'react-native';

import type { Chamado } from '@/api/atendimento';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { EstadoTela } from '@/components/EstadoTela';
import { Folha } from '@/components/Folha';
import { ItemLista, Secao, Selo } from '@/components/Pecas';
import { Tela } from '@/components/Tela';
import { useMeusChamados } from '@/hooks/useAtendimento';
import { useTema } from '@/hooks/useTema';
import { quandoPorExtenso } from '@/utils/datas';

const ATIVOS = [
  'agendado',
  'aguardando_recepcao',
  'aguardando_medico',
  'chamando',
  'em_atendimento',
];

export default function Consultas() {
  const { data, isPending, isError, refetch } = useMeusChamados();

  return (
    <Tela>
      <Folha semTopo>
        <CabecalhoTela titulo="Minhas consultas" aoVoltar={null} />
        {isPending ? <EstadoTela tipo="carregando" titulo="Carregando suas consultas" /> : null}
        {isError ? (
          <EstadoTela
            tipo="erro"
            titulo="Não conseguimos carregar suas consultas"
            mensagem="Confira a internet e toque em Tentar de novo."
            aoAgir={() => void refetch()}
          />
        ) : null}
        {data && data.length === 0 ? (
          <EstadoTela
            tipo="vazio"
            titulo="Você ainda não tem consultas marcadas"
            rotuloAcao="Marcar consulta"
            aoAgir={() => router.push('/especialidades')}
          />
        ) : null}
        {data && data.length > 0 ? (
          <>
            <Lista titulo="Próximas" itens={data.filter((c) => ATIVOS.includes(c.status))} />
            <Lista titulo="Histórico" itens={data.filter((c) => !ATIVOS.includes(c.status))} />
          </>
        ) : null}
      </Folha>
    </Tela>
  );
}

function Lista({ titulo, itens }: { titulo: string; itens: Chamado[] }) {
  const { espacamento } = useTema();
  if (itens.length === 0) return null;
  return (
    <Secao titulo={titulo}>
      <View role="list" style={{ gap: espacamento.espacamento12 }}>
        {itens.map((c) => (
          <View role="listitem" key={c.id}>
            <ItemLista
              icone="stethoscope"
              titulo={c.medico?.nome ?? c.especialidade.nome}
              subtitulo={quandoPorExtenso(c.data, c.hora)}
              detalhe={`${c.especialidade.nome} · ${c.unidade.nome}`}
              depois={<Selo status={c.status} />}
              aoTocar={() => router.push(`/consulta/${c.id}`)}
            />
          </View>
        ))}
      </View>
    </Secao>
  );
}
