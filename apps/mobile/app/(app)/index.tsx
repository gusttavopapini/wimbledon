import { router } from 'expo-router';
import { View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Botao } from '@/components/Botao';
import { CartaoEspecialidade, GradeEspecialidades } from '@/components/CartaoEspecialidade';
import { EstadoTela } from '@/components/EstadoTela';
import { Folha } from '@/components/Folha';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { Topo } from '@/components/Topo';
import { useEspecialidades } from '@/hooks/useCadastros';
import { useSessao } from '@/hooks/useSessao';
import { useTema } from '@/hooks/useTema';
import { saudacao } from '@/utils/saudacao';

const QUANTIDADE_NA_HOME = 6;

/**
 * Início do paciente. Ainda sem "Próxima consulta" (depende do agendamento) e
 * sem "Contar meus sintomas" (pré-triagem, Sprint 5): melhor ausente que inerte.
 */
export default function Inicio() {
  const { usuario } = useSessao();
  const { espacamento } = useTema();
  const nome = usuario?.nome ?? '';

  return (
    <Tela>
      <Topo
        antes={<Avatar nome={nome} tamanho={64} sobreTopo />}
        titulo={saudacao(nome)}
        subtitulo="Como está sua saúde hoje?"
      />
      <Folha>
        <Botao principal icone="calendar-plus" aoTocar={() => router.push('/especialidades')}>
          Marcar consulta
        </Botao>

        <View style={{ gap: espacamento.espacamento16 }}>
          <Texto estilo="tituloSecao" cor="primariaEscura" accessibilityRole="header">
            Especialidades
          </Texto>
          <EspecialidadesDaHome />
        </View>

        <View style={{ gap: espacamento.espacamento16 }}>
          <Texto estilo="tituloSecao" cor="primariaEscura" accessibilityRole="header">
            Acesso rápido
          </Texto>
          <Botao
            variante="secundario"
            larguraTotal
            icone="calendar"
            iconeFim="chevron-right"
            aoTocar={() => router.push('/consultas')}
          >
            Minhas consultas
          </Botao>
        </View>
      </Folha>
    </Tela>
  );
}

function EspecialidadesDaHome() {
  const { data, isPending, isError, refetch } = useEspecialidades();

  if (isPending) {
    return <EstadoTela tipo="carregando" titulo="Carregando as especialidades" />;
  }
  if (isError) {
    return (
      <EstadoTela
        tipo="erro"
        titulo="Não conseguimos carregar as especialidades"
        mensagem="Confira se o celular está conectado à internet e toque em Tentar de novo."
        aoAgir={() => void refetch()}
      />
    );
  }
  if (data.length === 0) {
    return (
      <EstadoTela
        tipo="vazio"
        icone="calendar"
        titulo="Ainda não há especialidades disponíveis"
        mensagem="Quando as unidades cadastrarem as especialidades, elas aparecem aqui."
      />
    );
  }

  return (
    <>
      <GradeEspecialidades>
        {data.slice(0, QUANTIDADE_NA_HOME).map((especialidade) => (
          <CartaoEspecialidade
            key={especialidade.id}
            especialidade={especialidade.id}
            nome={especialidade.nome}
            aoTocar={() => router.push(`/especialidades/${especialidade.id}/unidades`)}
          />
        ))}
      </GradeEspecialidades>
      <Botao
        variante="terciario"
        iconeFim="chevron-right"
        aoTocar={() => router.push('/especialidades')}
      >
        Ver todas as especialidades
      </Botao>
    </>
  );
}
