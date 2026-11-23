import { useLocalSearchParams } from 'expo-router';
import { Share, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { Cartao } from '@/components/Cartao';
import { EstadoTela } from '@/components/EstadoTela';
import { Folha } from '@/components/Folha';
import { Linha } from '@/components/Pecas';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { useDocumento } from '@/hooks/useAtendimento';
import { useTema } from '@/hooks/useTema';
import { useVoltar } from '@/hooks/useVoltar';
import { diaPorExtenso } from '@/utils/datas';

export default function DetalheDocumento() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const voltar = useVoltar('/documentos');
  const { espacamento } = useTema();
  const { data, isPending, isError, refetch } = useDocumento(id);

  return (
    <Tela>
      <Folha semTopo>
        <CabecalhoTela titulo={data?.titulo ?? 'Documento'} aoVoltar={voltar} />
        {isPending ? <EstadoTela tipo="carregando" titulo="Abrindo o documento" /> : null}
        {isError ? (
          <EstadoTela tipo="erro" titulo="Não conseguimos abrir" aoAgir={() => void refetch()} />
        ) : null}
        {data ? (
          <>
            <Cartao>
              <View style={{ gap: espacamento.espacamento16 }}>
                <Linha
                  icone="stethoscope"
                  rotulo="Emitido por"
                  valor={`${data.medico.nome} · ${data.medico.conselho}`}
                />
                <Linha
                  icone="calendar"
                  rotulo="Data"
                  valor={diaPorExtenso(data.emitidoEm.slice(0, 10))}
                />
              </View>
            </Cartao>
            <Cartao variante="interno">
              <Texto estilo="corpo" selectable>
                {data.conteudo}
              </Texto>
              {data.itens.map((item, i) => (
                <Texto key={i} estilo="corpoForte" selectable>
                  {`${i + 1}. ${item}`}
                </Texto>
              ))}
            </Cartao>
            <Texto estilo="apoio" cor="textoSecundario">
              Mostre este documento na farmácia ou no laboratório. Em caso de dúvida, fale com o
              médico.
            </Texto>
            <Botao
              variante="secundario"
              larguraTotal
              icone="message-circle"
              aoTocar={() =>
                void Share.share({
                  message: `${data.titulo}\n${data.medico.nome} (${data.medico.conselho})\n\n${data.conteudo}\n${data.itens
                    .map((x, i) => `${i + 1}. ${x}`)
                    .join('\n')}`,
                })
              }
            >
              Compartilhar
            </Botao>
          </>
        ) : null}
      </Folha>
    </Tela>
  );
}
