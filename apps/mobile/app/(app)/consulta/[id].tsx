import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, View } from 'react-native';

import { cancelarChamado, reagendarChamado, type Chamado } from '@/api/atendimento';
import { comoErroApi } from '@/api/erros';
import { Botao } from '@/components/Botao';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { Cartao } from '@/components/Cartao';
import { EstadoTela } from '@/components/EstadoTela';
import { Folha } from '@/components/Folha';
import { Icone } from '@/components/Icone';
import { Mensagem } from '@/components/Mensagem';
import { ItemLista, Linha, Opcoes, Secao, Selo, confirmar } from '@/components/Pecas';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { useChamado, useDocumentosDoChamado, useHorarios } from '@/hooks/useAtendimento';
import { useTema } from '@/hooks/useTema';
import { useVoltar } from '@/hooks/useVoltar';
import { diaPorExtenso, horaDe, quandoPorExtenso } from '@/utils/datas';
import { telefoneLegivel } from '@/utils/mascaras';

const ETAPAS = [
  ['Consulta agendada', 'Seu horário está reservado.'],
  ['Chegada confirmada', 'A recepção confirmou sua chegada pelo CPF.'],
  ['Aguardando atendimento', 'Aguarde na sala de espera. Avisaremos aqui e na TV.'],
  ['É a sua vez', 'O médico chamou você. Vá ao consultório indicado.'],
  ['Em atendimento', 'Você está em consulta com o médico.'],
  ['Atendimento finalizado', 'Orientações e documentos aparecem abaixo.'],
] as const;

const ATIVOS = [
  'agendado',
  'aguardando_recepcao',
  'aguardando_medico',
  'chamando',
  'em_atendimento',
];

export default function DetalhesConsulta() {
  const { id = '' } = useLocalSearchParams<{ id: string }>();
  const voltar = useVoltar('/consultas');
  const { espacamento } = useTema();
  const chamado = useChamado(id, true);
  const c = chamado.data;

  return (
    <Tela>
      <Folha semTopo>
        <CabecalhoTela titulo="Minha consulta" aoVoltar={voltar} rotuloVoltar="Voltar" />
        {chamado.isPending ? <EstadoTela tipo="carregando" titulo="Carregando a consulta" /> : null}
        {chamado.isError ? (
          <EstadoTela
            tipo="erro"
            titulo="Não conseguimos carregar a consulta"
            aoAgir={() => void chamado.refetch()}
          />
        ) : null}
        {c ? (
          <>
            <Cartao>
              <View style={{ gap: espacamento.espacamento16 }}>
                <Selo status={c.status} />
                <Linha icone="calendar" rotulo="Quando" valor={quandoPorExtenso(c.data, c.hora)} />
                <Linha
                  icone="stethoscope"
                  rotulo={c.especialidade.nome}
                  valor={
                    c.medico
                      ? `${c.medico.nome}${c.medico.conselho ? ` · ${c.medico.conselho}` : ''}`
                      : 'Primeiro médico disponível'
                  }
                />
                <Linha
                  icone="map-pin"
                  rotulo={c.unidade.nome}
                  valor={
                    c.unidade.endereco
                      ? `${c.unidade.endereco.logradouro}, ${c.unidade.endereco.numero} · ${c.unidade.endereco.bairro}`
                      : ''
                  }
                />
                {c.unidade.telefone ? (
                  <Botao
                    variante="terciario"
                    icone="phone"
                    aoTocar={() => void Linking.openURL(`tel:${c.unidade.telefone}`)}
                  >
                    {`Ligar para a unidade: ${telefoneLegivel(c.unidade.telefone)}`}
                  </Botao>
                ) : null}
              </View>
            </Cartao>

            {c.status === 'chamando' && c.consultorio ? (
              <Mensagem tipo="sucesso" titulo={`É a sua vez! Vá ao ${c.consultorio}.`}>
                {c.medico ? `${c.medico.nome} está esperando você.` : undefined}
              </Mensagem>
            ) : null}
            {c.status === 'encaminhado_emergencia' ? (
              <Mensagem tipo="erro" titulo="Você foi encaminhado à emergência">
                Siga as orientações da equipe da unidade.
              </Mensagem>
            ) : null}

            {ATIVOS.includes(c.status) || c.status === 'concluido' ? (
              <Acompanhamento chamado={c} />
            ) : null}
            {c.status === 'concluido' ? <Resultado chamado={c} /> : null}
            {c.podeAlterar ? <Alterar chamado={c} /> : null}
            {!c.podeAlterar && (c.status === 'agendado' || c.status === 'aguardando_recepcao') ? (
              <Texto estilo="apoio" cor="textoSecundario">
                Faltam menos de 2 horas: para cancelar ou trocar o horário, ligue para a unidade.
              </Texto>
            ) : null}
          </>
        ) : null}
      </Folha>
    </Tela>
  );
}

function Acompanhamento({ chamado }: { chamado: Chamado }) {
  const { cores, espacamento } = useTema();
  // A chegada confirmada já põe a pessoa aguardando: etapa 1 e 2 andam juntas.
  const atual = chamado.etapa;
  const horarios = [
    chamado.inicio ? horaDe(chamado.inicio) : '',
    horaDe(chamado.chegadaEm),
    horaDe(chamado.chegadaEm),
    horaDe(chamado.aceitoEm),
    horaDe(chamado.inicioAtendimentoEm),
    horaDe(chamado.concluidoEm),
  ];
  return (
    <Secao titulo="Acompanhe seu atendimento">
      <Texto estilo="apoio" cor="textoSecundario">
        Ao chegar, informe seu CPF na recepção. Os passos abaixo mudam sozinhos.
      </Texto>
      <View accessibilityRole="list" style={{ gap: espacamento.espacamento4 }}>
        {ETAPAS.map(([titulo, descricao], i) => {
          const feito = i < atual || (atual === 5 && i === 5);
          const agora = i === atual && atual < 5;
          return (
            <View
              key={titulo}
              accessibilityRole="text"
              accessibilityLabel={`${titulo}. ${feito ? 'Concluído' : agora ? 'Etapa atual' : 'Ainda não'}. ${descricao}`}
              style={{
                flexDirection: 'row',
                gap: espacamento.espacamento12,
                paddingVertical: espacamento.espacamento8,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: feito ? cores.sucesso : agora ? cores.primaria : cores.teal50,
                }}
              >
                {feito ? (
                  <Icone nome="check" cor="textoSobreStatus" tamanho={18} />
                ) : (
                  <Texto estilo="rotulo" cor={agora ? 'textoSobrePrimaria' : 'textoSecundario'}>
                    {String(i + 1)}
                  </Texto>
                )}
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Texto estilo="corpoForte" cor={feito || agora ? 'texto' : 'textoSecundario'}>
                  {titulo}
                </Texto>
                {agora || feito ? (
                  <Texto estilo="apoio" cor="textoSecundario">
                    {descricao}
                  </Texto>
                ) : null}
              </View>
              {feito && horarios[i] ? (
                <Texto estilo="apoio" cor="textoSecundario">
                  {horarios[i]}
                </Texto>
              ) : null}
            </View>
          );
        })}
      </View>
    </Secao>
  );
}

function Resultado({ chamado }: { chamado: Chamado }) {
  const { espacamento } = useTema();
  const docs = useDocumentosDoChamado(chamado.id, true);
  return (
    <Secao titulo="Orientações e documentos">
      {chamado.orientacao ? (
        <Cartao variante="alternativo">
          <Texto estilo="corpo">{chamado.orientacao}</Texto>
        </Cartao>
      ) : null}
      <View style={{ gap: espacamento.espacamento12 }}>
        {docs.data?.map((d) => (
          <ItemLista
            key={d.id}
            icone={
              d.tipo === 'receita'
                ? 'pill'
                : d.tipo === 'solicitacao_exame'
                  ? 'flask-conical'
                  : 'file-text'
            }
            titulo={d.titulo}
            subtitulo={d.medico.nome}
            aoTocar={() => router.push(`/documentos/${d.id}`)}
          />
        ))}
        {docs.data && docs.data.length === 0 && !chamado.orientacao ? (
          <Texto estilo="apoio" cor="textoSecundario">
            O médico não enviou documentos nesta consulta.
          </Texto>
        ) : null}
      </View>
    </Secao>
  );
}

function Alterar({ chamado }: { chamado: Chamado }) {
  const queryClient = useQueryClient();
  const { espacamento } = useTema();
  const [trocando, setTrocando] = useState(false);
  const atualizar = () => queryClient.invalidateQueries({ queryKey: ['chamados'] });

  const cancelar = useMutation({
    mutationFn: () => cancelarChamado(chamado.id),
    onSuccess: atualizar,
  });
  const erro = cancelar.error ? comoErroApi(cancelar.error) : null;

  return (
    <View style={{ gap: espacamento.espacamento12 }}>
      {erro ? (
        <Mensagem tipo="erro" titulo="Não deu para cancelar">
          {erro.message}
        </Mensagem>
      ) : null}
      {trocando && chamado.medico ? (
        <Reagendar chamado={chamado} aoTerminar={() => setTrocando(false)} />
      ) : (
        <Botao
          variante="secundario"
          larguraTotal
          icone="calendar-clock"
          aoTocar={() => setTrocando(true)}
        >
          Trocar o horário
        </Botao>
      )}
      <Botao
        variante="destrutivo"
        larguraTotal
        icone="calendar-x"
        carregando={cancelar.isPending}
        aoTocar={async () => {
          const ok = await confirmar(
            'Cancelar a consulta?',
            `${quandoPorExtenso(chamado.data, chamado.hora)} com ${chamado.medico?.nome ?? 'o médico'}. O horário fica livre para outra pessoa.`,
            'Sim, cancelar',
          );
          if (ok) cancelar.mutate();
        }}
      >
        Cancelar consulta
      </Botao>
    </View>
  );
}

function Reagendar({ chamado, aoTerminar }: { chamado: Chamado; aoTerminar: () => void }) {
  const queryClient = useQueryClient();
  const { espacamento } = useTema();
  const horarios = useHorarios(chamado.medico!.id, chamado.unidade.id);
  const [dia, setDia] = useState<string | null>(null);
  const [hora, setHora] = useState<string | null>(null);
  const mutacao = useMutation({
    mutationFn: () => reagendarChamado(chamado.id, { data: dia!, hora: hora! }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['chamados'] });
      await queryClient.invalidateQueries({ queryKey: ['horarios'] });
      aoTerminar();
    },
  });
  const doDia = horarios.data?.find((d) => d.data === dia);
  return (
    <Cartao variante="interno" titulo="Novo horário">
      <View style={{ gap: espacamento.espacamento16 }}>
        {horarios.isPending ? <EstadoTela tipo="carregando" titulo="Buscando horários" /> : null}
        <Opcoes
          rotulo="Dia"
          valor={dia}
          aoMudar={(d) => {
            setDia(d);
            setHora(null);
          }}
          opcoes={(horarios.data ?? [])
            .slice(0, 8)
            .map((d) => ({ valor: d.data, rotulo: diaPorExtenso(d.data) }))}
        />
        {doDia ? (
          <Opcoes
            rotulo="Hora"
            colunas={3}
            valor={hora}
            aoMudar={setHora}
            opcoes={doDia.horarios.map((h) => ({ valor: h, rotulo: h }))}
          />
        ) : null}
        {mutacao.error ? (
          <Mensagem tipo="erro" titulo="Não deu para trocar">
            {comoErroApi(mutacao.error).message}
          </Mensagem>
        ) : null}
        <Botao
          principal
          desabilitado={!dia || !hora}
          carregando={mutacao.isPending}
          aoTocar={() => mutacao.mutate()}
        >
          Confirmar novo horário
        </Botao>
        <Botao variante="terciario" aoTocar={aoTerminar}>
          Desistir da troca
        </Botao>
      </View>
    </Cartao>
  );
}
