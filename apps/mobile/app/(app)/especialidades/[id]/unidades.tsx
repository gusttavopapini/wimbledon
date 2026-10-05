import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { CabecalhoTela } from '@/components/CabecalhoTela';
import { Campo } from '@/components/Campo';
import { CartaoUnidade } from '@/components/CartaoUnidade';
import { ChipEspecialidade } from '@/components/Chip';
import { EstadoTela } from '@/components/EstadoTela';
import { Folha } from '@/components/Folha';
import { Tela } from '@/components/Tela';
import { useEspecialidade, useUnidades } from '@/hooks/useCadastros';
import { useTema } from '@/hooks/useTema';
import { useVoltar } from '@/hooks/useVoltar';
import { contemTermo } from '@/utils/texto';

export default function UnidadesDaEspecialidade() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const voltar = useVoltar('/especialidades');
  const especialidade = useEspecialidade(id);
  const [bairro, setBairro] = useState('');
  const nome = especialidade.data?.nome;

  return (
    <Tela>
      <Folha semTopo>
        <CabecalhoTela
          titulo="Unidades"
          subtitulo={nome ? `Onde tem atendimento de ${nome}.` : undefined}
          aoVoltar={voltar}
        />
        {nome ? <ChipEspecialidade especialidade={id}>{nome}</ChipEspecialidade> : null}
        {especialidade.isError ? (
          <EstadoTela
            tipo="erro"
            titulo="Não conseguimos carregar essa especialidade"
            mensagem="Confira se o celular está conectado à internet e toque em Tentar de novo. Se continuar, volte e escolha de novo."
            aoAgir={() => void especialidade.refetch()}
          />
        ) : (
          <>
            <Campo
              tipo="busca"
              rotulo="Buscar por bairro"
              ajuda="Exemplo: Boa Vista"
              valor={bairro}
              aoMudar={setBairro}
            />
            <Lista
              especialidadeId={id}
              nomeEspecialidade={nome ?? 'essa especialidade'}
              bairro={bairro}
              aoLimpar={() => setBairro('')}
            />
          </>
        )}
      </Folha>
    </Tela>
  );
}

function Lista({
  especialidadeId,
  nomeEspecialidade,
  bairro,
  aoLimpar,
}: {
  especialidadeId: string;
  nomeEspecialidade: string;
  bairro: string;
  aoLimpar: () => void;
}) {
  const { tamanho } = useTema();
  const voltar = useVoltar('/especialidades');
  const { data, isPending, isError, refetch } = useUnidades(especialidadeId);

  if (isPending) return <EstadoTela tipo="carregando" titulo="Carregando as unidades" />;
  if (isError) {
    return (
      <EstadoTela
        tipo="erro"
        titulo="Não conseguimos carregar as unidades"
        mensagem="Confira se o celular está conectado à internet e toque em Tentar de novo."
        aoAgir={() => void refetch()}
      />
    );
  }
  if (data.length === 0) {
    return (
      <EstadoTela
        tipo="vazio"
        icone="map-pin"
        titulo={`Nenhuma unidade atende ${nomeEspecialidade} ainda`}
        mensagem="Escolha outra especialidade. Se não souber qual, o clínico geral atende primeiro e encaminha."
        rotuloAcao="Ver outras especialidades"
        aoAgir={voltar}
      />
    );
  }

  const noBairro = data.filter((u) => contemTermo(bairro, [u.endereco.bairro]));
  if (noBairro.length === 0) {
    return (
      <EstadoTela
        tipo="vazio"
        icone="search"
        titulo="Nenhuma unidade nesse bairro"
        mensagem={`Não achamos unidade no bairro "${bairro.trim()}". Confira o nome do bairro ou limpe a busca para ver todas.`}
        rotuloAcao="Limpar a busca"
        aoAgir={aoLimpar}
      />
    );
  }

  return (
    <View role="list" style={{ gap: tamanho.respiroEntreAlvos + 4 }}>
      {noBairro.map((unidade) => (
        <View key={unidade.id} role="listitem">
          <CartaoUnidade
            unidade={unidade}
            aoTocar={() =>
              router.push({
                pathname: '/unidades/[id]/medicos',
                params: { id: unidade.id, especialidadeId },
              })
            }
          />
        </View>
      ))}
    </View>
  );
}
