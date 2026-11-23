import { router } from 'expo-router';
import { View } from 'react-native';

import type { Chamado } from '@/api/atendimento';
import { Avatar } from '@/components/Avatar';
import { Botao } from '@/components/Botao';
import { Cartao } from '@/components/Cartao';
import { CartaoEspecialidade, GradeEspecialidades } from '@/components/CartaoEspecialidade';
import { EstadoTela } from '@/components/EstadoTela';
import { Folha } from '@/components/Folha';
import { Atalho, GradeAtalhos, Linha, Secao, Selo } from '@/components/Pecas';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { Topo } from '@/components/Topo';
import { useMeusChamados } from '@/hooks/useAtendimento';
import { useEspecialidades } from '@/hooks/useCadastros';
import { useSessao } from '@/hooks/useSessao';
import { useTema } from '@/hooks/useTema';
import { quandoPorExtenso } from '@/utils/datas';
import { saudacao } from '@/utils/saudacao';

const QUANTIDADE_NA_HOME = 6;
const EM_ANDAMENTO = [
  'agendado',
  'aguardando_recepcao',
  'aguardando_medico',
  'chamando',
  'em_atendimento',
];

/** Início do paciente: próxima consulta, o que fazer agora e as especialidades. */
export default function Inicio() {
  const { usuario } = useSessao();
  const nome = usuario?.nome ?? '';

  return (
    <Tela>
      <Topo
        antes={<Avatar nome={nome} tamanho={64} sobreTopo />}
        titulo={saudacao(nome)}
        subtitulo="Como está sua saúde hoje?"
      />
      <Folha>
        <ProximaConsulta />

        <Secao titulo="O que você quer fazer?">
          <GradeAtalhos>
            <Atalho
              icone="calendar-plus"
              rotulo="Marcar consulta"
              aoTocar={() => router.push('/especialidades')}
            />
            <Atalho
              icone="heart-pulse"
              rotulo="Contar meus sintomas"
              aoTocar={() => router.push('/triagem')}
            />
            <Atalho
              icone="calendar"
              rotulo="Minhas consultas"
              aoTocar={() => router.push('/consultas')}
            />
            <Atalho
              icone="file-text"
              rotulo="Receitas e exames"
              aoTocar={() => router.push('/documentos')}
            />
          </GradeAtalhos>
        </Secao>

        <Secao titulo="Especialidades">
          <EspecialidadesDaHome />
        </Secao>
      </Folha>
    </Tela>
  );
}

function ProximaConsulta() {
  const { data } = useMeusChamados();
  const proxima = data?.find((c) => EM_ANDAMENTO.includes(c.status));
  if (!proxima) return null;
  return <CartaoProxima chamado={proxima} />;
}

function CartaoProxima({ chamado }: { chamado: Chamado }) {
  const { espacamento } = useTema();
  return (
    <Cartao titulo="Sua próxima consulta">
      <View style={{ gap: espacamento.espacamento12 }}>
        <Selo status={chamado.status} />
        <Linha
          icone="calendar"
          rotulo="Quando"
          valor={quandoPorExtenso(chamado.data, chamado.hora)}
        />
        <Linha
          icone="stethoscope"
          rotulo={chamado.especialidade.nome}
          valor={chamado.medico?.nome ?? 'O primeiro médico disponível'}
        />
        <Linha icone="map-pin" rotulo="Onde" valor={chamado.unidade.nome} />
        {chamado.status === 'chamando' && chamado.consultorio ? (
          <Texto estilo="tituloSecao" cor="sucesso">
            É a sua vez! Vá ao {chamado.consultorio}.
          </Texto>
        ) : null}
        <Botao
          variante="secundario"
          larguraTotal
          iconeFim="chevron-right"
          aoTocar={() => router.push(`/consulta/${chamado.id}`)}
        >
          Acompanhar atendimento
        </Botao>
      </View>
    </Cartao>
  );
}

function EspecialidadesDaHome() {
  const { data, isPending, isError, refetch } = useEspecialidades();

  if (isPending) return <EstadoTela tipo="carregando" titulo="Carregando as especialidades" />;
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
