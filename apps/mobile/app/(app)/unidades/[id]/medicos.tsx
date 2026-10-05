import { useLocalSearchParams } from 'expo-router';
import { Fragment, useState } from 'react';
import { View } from 'react-native';

import { CabecalhoTela } from '@/components/CabecalhoTela';
import { CartaoProfissional } from '@/components/CartaoProfissional';
import { ChipEspecialidade } from '@/components/Chip';
import { EstadoTela } from '@/components/EstadoTela';
import { Folha } from '@/components/Folha';
import { Mensagem } from '@/components/Mensagem';
import { Tela } from '@/components/Tela';
import { useEspecialidades, useMedicos, useUnidade } from '@/hooks/useCadastros';
import { useTema } from '@/hooks/useTema';
import { useVoltar } from '@/hooks/useVoltar';
import { juntarComE } from '@/utils/texto';

export default function MedicosDaUnidade() {
  const { id = '', especialidadeId } = useLocalSearchParams<{
    id: string;
    especialidadeId?: string;
  }>();
  const voltar = useVoltar('/especialidades');
  const unidade = useUnidade(id);
  const especialidades = useEspecialidades();
  const nomeDe = (idEsp: string) => especialidades.data?.find((e) => e.id === idEsp)?.nome;
  const nomeEspecialidade = especialidadeId ? (nomeDe(especialidadeId) ?? null) : null;

  return (
    <Tela>
      <Folha semTopo>
        <CabecalhoTela titulo="Médicos" subtitulo={unidade.data?.nome} aoVoltar={voltar} />
        {especialidadeId && nomeEspecialidade ? (
          <ChipEspecialidade especialidade={especialidadeId}>{nomeEspecialidade}</ChipEspecialidade>
        ) : null}
        {unidade.isError ? (
          <EstadoTela
            tipo="erro"
            titulo="Não conseguimos carregar essa unidade"
            mensagem="Confira se o celular está conectado à internet e toque em Tentar de novo. Se continuar, volte e escolha de novo."
            aoAgir={() => void unidade.refetch()}
          />
        ) : (
          <Lista
            unidadeId={id}
            especialidadeId={especialidadeId}
            nomeUnidade={unidade.data?.nome ?? ''}
            nomeEspecialidade={nomeEspecialidade}
            nomeDe={nomeDe}
            especialidades={especialidades}
          />
        )}
      </Folha>
    </Tela>
  );
}

function Lista({
  unidadeId,
  especialidadeId,
  nomeUnidade,
  nomeEspecialidade,
  nomeDe,
  especialidades,
}: {
  unidadeId: string;
  especialidadeId?: string;
  nomeUnidade: string;
  nomeEspecialidade: string | null;
  nomeDe: (id: string) => string | undefined;
  especialidades: ReturnType<typeof useEspecialidades>;
}) {
  const { espacamento } = useTema();
  const voltar = useVoltar('/especialidades');
  const { data, isPending, isError, refetch } = useMedicos(unidadeId, especialidadeId);
  const [tocado, setTocado] = useState<string | null>(null);

  // O cartão mostra o nome das especialidades: as duas listas precisam chegar.
  if (isPending || especialidades.isPending) {
    return <EstadoTela tipo="carregando" titulo="Carregando os médicos" />;
  }
  if (isError || especialidades.isError) {
    return (
      <EstadoTela
        tipo="erro"
        titulo="Não conseguimos carregar os médicos"
        mensagem="Confira se o celular está conectado à internet e toque em Tentar de novo."
        aoAgir={() => {
          if (isError) void refetch();
          if (especialidades.isError) void especialidades.refetch();
        }}
      />
    );
  }
  if (data.length === 0) {
    return (
      <EstadoTela
        tipo="vazio"
        icone="user-round"
        titulo={
          nomeEspecialidade
            ? `Nenhum médico de ${nomeEspecialidade} nesta unidade`
            : 'Nenhum médico nesta unidade ainda'
        }
        mensagem="Escolha outra unidade para ver mais opções."
        rotuloAcao="Ver outras unidades"
        aoAgir={voltar}
      />
    );
  }

  return (
    <View role="list" style={{ gap: espacamento.espacamento12 }}>
      {data.map((medico) => {
        // A especialidade escolhida vem primeiro; as outras do médico, depois.
        const ids = especialidadeId
          ? [especialidadeId, ...medico.especialidadeIds.filter((e) => e !== especialidadeId)]
          : medico.especialidadeIds;
        return (
          <Fragment key={medico.id}>
            <View role="listitem">
              <CartaoProfissional
                nome={medico.nome}
                especialidade={juntarComE(
                  ids.map(nomeDe).filter((nome): nome is string => Boolean(nome)),
                )}
                unidade={nomeUnidade}
                aoTocar={() => setTocado(medico.id)}
              />
            </View>
            {/* Única ponta solta aceita: some quando a agenda (RF12) existir. */}
            {tocado === medico.id ? (
              <Mensagem tipo="informacao" titulo="A escolha de horário entra na próxima entrega." />
            ) : null}
          </Fragment>
        );
      })}
    </View>
  );
}
