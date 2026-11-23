import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { agendar, type FormaPagamento } from '@/api/atendimento';
import { comoErroApi } from '@/api/erros';
import { Botao } from '@/components/Botao';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { Cartao } from '@/components/Cartao';
import { Folha } from '@/components/Folha';
import { Mensagem } from '@/components/Mensagem';
import { Linha, Opcoes } from '@/components/Pecas';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { chavesAtendimento } from '@/hooks/useAtendimento';
import { useEspecialidade, useMedicos, useUnidade } from '@/hooks/useCadastros';
import { useTema } from '@/hooks/useTema';
import { useVoltar } from '@/hooks/useVoltar';
import { quandoPorExtenso } from '@/utils/datas';

/** Revisão antes de confirmar (ação que reserva o horário). */
export default function RevisarAgendamento() {
  const p = useLocalSearchParams<{
    medicoId: string;
    unidadeId: string;
    especialidadeId: string;
    data: string;
    hora: string;
    preTriagemId?: string;
  }>();
  const voltar = useVoltar('/especialidades');
  const { espacamento } = useTema();
  const queryClient = useQueryClient();
  const unidade = useUnidade(p.unidadeId);
  const especialidade = useEspecialidade(p.especialidadeId);
  const medicos = useMedicos(p.unidadeId);
  const medico = medicos.data?.find((m) => m.id === p.medicoId);
  const [pagamento, setPagamento] = useState<FormaPagamento | null>(null);

  const confirmar = useMutation({
    mutationFn: () =>
      agendar({
        medicoId: p.medicoId,
        unidadeId: p.unidadeId,
        especialidadeId: p.especialidadeId,
        data: p.data,
        hora: p.hora,
        formaPagamento: pagamento ?? undefined,
        preTriagemId: p.preTriagemId || undefined,
      }),
    onSuccess: async (chamado) => {
      await queryClient.invalidateQueries({ queryKey: ['chamados'] });
      await queryClient.invalidateQueries({
        queryKey: chavesAtendimento.horarios(p.medicoId, p.unidadeId),
      });
      router.replace({ pathname: '/agendar/confirmada', params: { id: chamado.id } });
    },
  });
  const erro = confirmar.error ? comoErroApi(confirmar.error) : null;

  return (
    <Tela>
      <Folha semTopo>
        <CabecalhoTela titulo="Confira sua consulta" aoVoltar={voltar} />
        <Cartao>
          <View style={{ gap: espacamento.espacamento16 }}>
            <Linha icone="calendar" rotulo="Dia e hora" valor={quandoPorExtenso(p.data, p.hora)} />
            <Linha
              icone="stethoscope"
              rotulo={especialidade.data?.nome ?? 'Especialidade'}
              valor={medico?.nome ?? '…'}
            />
            <Linha
              icone="map-pin"
              rotulo="Local"
              valor={unidade.data ? `${unidade.data.nome} · ${unidade.data.endereco.bairro}` : '…'}
            />
          </View>
        </Cartao>

        <Opcoes
          rotulo="Como você vai pagar?"
          valor={pagamento}
          aoMudar={setPagamento}
          opcoes={[
            { valor: 'convenio', rotulo: 'Convênio' },
            { valor: 'particular', rotulo: 'Particular' },
            { valor: 'sus', rotulo: 'SUS' },
          ]}
        />

        <Texto estilo="apoio" cor="textoSecundario">
          Chegue 15 minutos antes e leve um documento com foto. Você pode cancelar ou trocar o
          horário pelo app até 2 horas antes.
        </Texto>

        {erro ? (
          <Mensagem tipo="erro" titulo="Não deu para marcar">
            {erro.message}
          </Mensagem>
        ) : null}

        <Botao
          principal
          icone="calendar-check"
          carregando={confirmar.isPending}
          rotuloCarregando="Marcando a consulta…"
          desabilitado={!pagamento}
          aoTocar={() => confirmar.mutate()}
        >
          Confirmar consulta
        </Botao>
        {erro?.codigo === 'HORARIO_INDISPONIVEL' ? (
          <Botao variante="secundario" larguraTotal aoTocar={voltar}>
            Escolher outro horário
          </Botao>
        ) : null}
      </Folha>
    </Tela>
  );
}
