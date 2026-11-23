import { router, useLocalSearchParams } from 'expo-router';
import { View } from 'react-native';

import { Botao } from '@/components/Botao';
import { Cartao } from '@/components/Cartao';
import { EstadoTela } from '@/components/EstadoTela';
import { Folha } from '@/components/Folha';
import { Icone } from '@/components/Icone';
import { Linha } from '@/components/Pecas';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { Topo } from '@/components/Topo';
import { useChamado } from '@/hooks/useAtendimento';
import { useTema } from '@/hooks/useTema';
import { quandoPorExtenso } from '@/utils/datas';

export default function ConsultaConfirmada() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { espacamento } = useTema();
  const { data } = useChamado(id);

  return (
    <Tela>
      <Topo
        titulo="Consulta marcada!"
        subtitulo="Seu horário está reservado."
        antes={<Icone nome="circle-check" cor="textoSobrePrimaria" tamanho={56} />}
      />
      <Folha>
        {!data ? (
          <EstadoTela tipo="carregando" titulo="Carregando os detalhes" />
        ) : (
          <Cartao>
            <View style={{ gap: espacamento.espacamento16 }}>
              <Linha
                icone="calendar"
                rotulo="Quando"
                valor={quandoPorExtenso(data.data, data.hora)}
              />
              <Linha
                icone="stethoscope"
                rotulo={data.especialidade.nome}
                valor={data.medico?.nome ?? ''}
              />
              <Linha icone="map-pin" rotulo="Onde" valor={data.unidade.nome} />
            </View>
          </Cartao>
        )}
        <Texto estilo="corpo">
          No dia, informe seu CPF na recepção. Depois é só acompanhar pelo app: avisamos quando for
          a sua vez.
        </Texto>
        <Botao principal aoTocar={() => router.replace(`/consulta/${id}`)} iconeFim="chevron-right">
          Ver minha consulta
        </Botao>
        <Botao variante="secundario" larguraTotal aoTocar={() => router.replace('/')}>
          Voltar ao início
        </Botao>
      </Folha>
    </Tela>
  );
}
