import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Linking, View } from 'react-native';

import type { ResultadoTriagem } from '@/api/atendimento';
import { Botao } from '@/components/Botao';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { Cartao } from '@/components/Cartao';
import { CartaoUnidade } from '@/components/CartaoUnidade';
import { ChipEspecialidade } from '@/components/Chip';
import { EstadoTela } from '@/components/EstadoTela';
import { Folha } from '@/components/Folha';
import { Mensagem } from '@/components/Mensagem';
import { Secao, SeloUrgencia } from '@/components/Pecas';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { chavesAtendimento } from '@/hooks/useAtendimento';
import { useTema } from '@/hooks/useTema';

/** RF45: a IA sugere a especialidade; a API lista as unidades; a pessoa escolhe. */
export default function ResultadoPreTriagem() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const { espacamento } = useTema();
  const queryClient = useQueryClient();
  const r = queryClient.getQueryData<ResultadoTriagem>(chavesAtendimento.triagem(id));

  if (!r) {
    return (
      <Tela>
        <Folha semTopo>
          <CabecalhoTela titulo="Pré-triagem" aoVoltar={() => router.replace('/triagem')} />
          <EstadoTela
            tipo="vazio"
            titulo="Faça a pré-triagem de novo"
            rotuloAcao="Começar"
            aoAgir={() => router.replace('/triagem')}
          />
        </Folha>
      </Tela>
    );
  }

  if (r.alerta) {
    return (
      <Tela>
        <Folha semTopo>
          <CabecalhoTela
            titulo="Procure atendimento agora"
            aoVoltar={() => router.replace('/')}
            rotuloVoltar="Voltar ao início"
          />
          <Mensagem tipo="erro" titulo="Isso pode ser uma emergência">
            {r.orientacao}
          </Mensagem>
          {r.sinaisAlerta.length > 0 ? (
            <Texto estilo="corpo">Você contou: {r.sinaisAlerta.join(', ').toLowerCase()}.</Texto>
          ) : null}
          <Botao
            principal
            variante="destrutivo"
            icone="phone"
            aoTocar={() => void Linking.openURL('tel:192')}
          >
            Ligar para o SAMU 192
          </Botao>
          {r.orientacao.includes('188') ? (
            <Botao
              variante="secundario"
              larguraTotal
              icone="phone"
              aoTocar={() => void Linking.openURL('tel:188')}
            >
              Ligar para o CVV 188
            </Botao>
          ) : null}
          <Texto estilo="apoio" cor="textoSecundario">
            {r.aviso}
          </Texto>
        </Folha>
      </Tela>
    );
  }

  return (
    <Tela>
      <Folha semTopo>
        <CabecalhoTela
          titulo="Nossa sugestão"
          aoVoltar={() => router.replace('/')}
          rotuloVoltar="Voltar ao início"
        />
        <Cartao>
          <View style={{ gap: espacamento.espacamento12 }}>
            <Texto estilo="apoio" cor="textoSecundario">
              Procure um médico de
            </Texto>
            <ChipEspecialidade especialidade={r.especialidade.id}>
              {r.especialidade.nome}
            </ChipEspecialidade>
            <SeloUrgencia urgencia={r.urgencia} />
            <Texto estilo="corpo">{r.justificativa}</Texto>
            <Texto estilo="corpo">{r.orientacao}</Texto>
          </View>
        </Cartao>
        <Mensagem tipo="informacao" titulo="Orientação, não diagnóstico">
          {r.aviso}
        </Mensagem>

        <Secao titulo="Escolha onde quer ser atendido">
          {r.unidades.length === 0 ? (
            <EstadoTela tipo="vazio" titulo="Nenhuma unidade atende essa especialidade agora" />
          ) : (
            <View style={{ gap: espacamento.espacamento12 }}>
              {r.unidades.map((u) => (
                <CartaoUnidade
                  key={u.id}
                  unidade={u}
                  aoTocar={() =>
                    router.push({
                      pathname: '/unidades/[id]/medicos',
                      params: { id: u.id, especialidadeId: r.especialidade.id, preTriagemId: r.id },
                    })
                  }
                />
              ))}
            </View>
          )}
        </Secao>
        <Botao variante="terciario" aoTocar={() => router.push('/especialidades')}>
          Prefiro escolher outra especialidade
        </Botao>
      </Folha>
    </Tela>
  );
}
