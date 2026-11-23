import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { View } from 'react-native';

import {
  abrirPlantao,
  aceitarChamado,
  agendaDoMedico,
  chamarNovamente,
  concluirAtendimento,
  consultoriosDaUnidade,
  encerrarPlantao,
  filaDoPlantao,
  medicoMe,
  mudarAtendimento,
  type Chamado,
  type NovoDocumento,
} from '@/api/atendimento';
import { listarUnidades } from '@/api/cadastros';
import { Botao } from '@/components/Botao';
import { Campo } from '@/components/Campo';
import { Cartao } from '@/components/Cartao';
import { EstadoTela } from '@/components/EstadoTela';
import { Folha } from '@/components/Folha';
import { Mensagem } from '@/components/Mensagem';
import {
  AreaTexto,
  ItemLista,
  Opcoes,
  Secao,
  Selo,
  SeloUrgencia,
  confirmar,
} from '@/components/Pecas';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { useTema } from '@/hooks/useTema';
import { MensagemErro, TopoEquipe } from '@/telas/comum';
import { horaDe } from '@/utils/datas';

/** Médico: abre o plantão escolhendo o consultório (P13), chama da fila (RN21) e atende. */
export default function AreaMedico() {
  const me = useQuery({ queryKey: ['medico', 'me'], queryFn: medicoMe });

  return (
    <Tela larga>
      <TopoEquipe titulo={me.data?.medico.nome ?? 'Área do médico'} />
      <Folha>
        {me.isPending ? <EstadoTela tipo="carregando" titulo="Carregando seu plantão" /> : null}
        {me.isError ? (
          <MensagemErro erro={me.error} titulo="Sua conta ainda não está pronta" />
        ) : null}
        {me.data && !me.data.plantao ? (
          <AbrirPlantao unidadeIds={me.data.medico.unidadeIds} />
        ) : null}
        {me.data?.plantao ? <Plantao /> : null}
        {me.data ? <AgendaDeHoje /> : null}
      </Folha>
    </Tela>
  );
}

function AbrirPlantao({ unidadeIds }: { unidadeIds: string[] }) {
  const queryClient = useQueryClient();
  const { espacamento } = useTema();
  const unidades = useQuery({ queryKey: ['unidades', 'todas'], queryFn: () => listarUnidades({}) });
  const [unidadeId, setUnidadeId] = useState<string | null>(
    unidadeIds.length === 1 ? unidadeIds[0]! : null,
  );
  const [consultorioId, setConsultorioId] = useState<string | null>(null);
  const consultorios = useQuery({
    queryKey: ['consultorios', unidadeId],
    queryFn: () => consultoriosDaUnidade(unidadeId!),
    enabled: Boolean(unidadeId),
  });
  const abrir = useMutation({
    mutationFn: () => abrirPlantao({ unidadeId: unidadeId!, consultorioId: consultorioId! }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['medico'] }),
  });

  return (
    <Cartao titulo="Abrir plantão">
      <View style={{ gap: espacamento.espacamento16 }}>
        <Texto estilo="corpo">
          Escolha onde você vai atender agora. Só um plantão fica aberto por vez.
        </Texto>
        <Opcoes
          rotulo="Unidade"
          valor={unidadeId}
          aoMudar={(v) => {
            setUnidadeId(v);
            setConsultorioId(null);
          }}
          opcoes={(unidades.data ?? [])
            .filter((u) => unidadeIds.includes(u.id))
            .map((u) => ({ valor: u.id, rotulo: u.nome }))}
        />
        {unidadeId ? (
          <Opcoes
            rotulo="Consultório"
            valor={consultorioId}
            aoMudar={setConsultorioId}
            opcoes={(consultorios.data ?? [])
              .filter((c) => c.ativo)
              .map((c) => ({ valor: c.id, rotulo: c.nome }))}
          />
        ) : null}
        {unidadeId && consultorios.data?.length === 0 ? (
          <Mensagem tipo="atencao" titulo="Esta unidade não tem consultórios cadastrados">
            Peça para a manutenção da unidade cadastrar.
          </Mensagem>
        ) : null}
        <MensagemErro erro={abrir.error} />
        <Botao
          principal
          icone="door-open"
          desabilitado={!consultorioId}
          carregando={abrir.isPending}
          aoTocar={() => abrir.mutate()}
        >
          Abrir plantão
        </Botao>
      </View>
    </Cartao>
  );
}

function Plantao() {
  const queryClient = useQueryClient();
  const { espacamento } = useTema();
  const fila = useQuery({
    queryKey: ['medico', 'fila'],
    queryFn: filaDoPlantao,
    refetchInterval: 10_000,
  });
  const atualizar = () => queryClient.invalidateQueries({ queryKey: ['medico'] });
  const encerrar = useMutation({ mutationFn: encerrarPlantao, onSuccess: atualizar });
  const aceitar = useMutation({
    mutationFn: aceitarChamado,
    onSuccess: atualizar,
    onError: atualizar,
  });
  const p = fila.data?.plantao;
  const emAndamento = fila.data?.emAndamento ?? [];

  return (
    <View style={{ gap: espacamento.espacamento24 }}>
      {p ? (
        <Cartao variante="alternativo">
          <Texto estilo="corpoForte">{`Plantão aberto · ${p.consultorio.nome}`}</Texto>
          <Texto estilo="apoio" cor="textoSecundario">{`Desde ${horaDe(p.abertaEm)}`}</Texto>
          <Botao
            variante="secundario"
            icone="power"
            carregando={encerrar.isPending}
            aoTocar={async () => {
              if (
                await confirmar(
                  'Encerrar o plantão?',
                  'Você deixa de receber pacientes da fila.',
                  'Encerrar',
                )
              ) {
                encerrar.mutate();
              }
            }}
          >
            Encerrar plantão
          </Botao>
        </Cartao>
      ) : null}

      {emAndamento.map((c) => (
        <EmAndamento key={c.id} chamado={c} />
      ))}

      <Secao titulo={`Sala de espera (${fila.data?.aguardando.length ?? 0})`}>
        <MensagemErro erro={aceitar.error} titulo="Não foi possível chamar" />
        {fila.isPending ? <EstadoTela tipo="carregando" titulo="Carregando a fila" /> : null}
        {fila.data && fila.data.aguardando.length === 0 ? (
          <EstadoTela
            tipo="vazio"
            icone="users"
            titulo="Ninguém esperando agora"
            mensagem="A fila se atualiza sozinha."
          />
        ) : null}
        <View style={{ gap: espacamento.espacamento12 }}>
          {fila.data?.aguardando.map((c, i) => (
            <Cartao key={c.id} variante="interno">
              <Texto estilo="tituloSecao">{`${i + 1}. ${c.paciente.nome}`}</Texto>
              <Texto estilo="rotulo" cor="primaria">
                {`${c.especialidade.nome} · ${c.hora ? `marcado ${c.hora}` : 'sem horário marcado'} · chegou ${horaDe(c.chegadaEm)}`}
              </Texto>
              {c.urgencia !== 'rotina' ? <SeloUrgencia urgencia={c.urgencia} /> : null}
              <Botao
                icone="megaphone"
                desabilitado={emAndamento.length > 0}
                carregando={aceitar.isPending && aceitar.variables === c.id}
                aoTocar={() => aceitar.mutate(c.id)}
              >
                Chamar paciente
              </Botao>
            </Cartao>
          ))}
        </View>
        {emAndamento.length > 0 && (fila.data?.aguardando.length ?? 0) > 0 ? (
          <Texto estilo="apoio" cor="textoSecundario">
            Termine o atendimento atual para chamar o próximo.
          </Texto>
        ) : null}
      </Secao>
    </View>
  );
}

function EmAndamento({ chamado: c }: { chamado: Chamado }) {
  const queryClient = useQueryClient();
  const { espacamento } = useTema();
  const [concluindo, setConcluindo] = useState(false);
  const atualizar = () => queryClient.invalidateQueries({ queryKey: ['medico'] });
  const novamente = useMutation({ mutationFn: () => chamarNovamente(c.id) });
  const acao = useMutation({
    mutationFn: (a: 'iniciar' | 'nao_compareceu' | 'emergencia') => mudarAtendimento(c.id, a),
    onSuccess: atualizar,
  });

  return (
    <Cartao titulo={c.status === 'chamando' ? 'Chamando na TV' : 'Em atendimento'}>
      <View style={{ gap: espacamento.espacamento12 }}>
        <Texto estilo="tituloTela">{c.paciente.nome}</Texto>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Selo status={c.status} />
          <SeloUrgencia urgencia={c.urgencia} />
        </View>
        <MensagemErro erro={acao.error ?? novamente.error} />
        {c.status === 'chamando' ? (
          <>
            <Botao
              principal
              icone="play"
              carregando={acao.isPending}
              aoTocar={() => acao.mutate('iniciar')}
            >
              Paciente chegou: iniciar
            </Botao>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Botao
                variante="secundario"
                icone="volume-2"
                carregando={novamente.isPending}
                aoTocar={() => novamente.mutate()}
              >
                Chamar de novo
              </Botao>
              <Botao
                variante="secundario"
                icone="x"
                aoTocar={async () => {
                  if (
                    await confirmar(
                      'Paciente não veio?',
                      `${c.paciente.nome} será marcado como ausente.`,
                      'Marcar ausente',
                    )
                  ) {
                    acao.mutate('nao_compareceu');
                  }
                }}
              >
                Não compareceu
              </Botao>
            </View>
          </>
        ) : null}
        {c.status === 'em_atendimento' && !concluindo ? (
          <Botao principal icone="clipboard-check" aoTocar={() => setConcluindo(true)}>
            Concluir atendimento
          </Botao>
        ) : null}
        {c.status === 'em_atendimento' && concluindo ? (
          <Concluir chamado={c} aoCancelar={() => setConcluindo(false)} aoConcluir={atualizar} />
        ) : null}
        <Botao
          variante="destrutivo"
          icone="siren"
          larguraTotal
          aoTocar={async () => {
            if (
              await confirmar(
                'Encaminhar à emergência?',
                'O atendimento sai da fila e fica registrado.',
                'Encaminhar',
              )
            ) {
              acao.mutate('emergencia');
            }
          }}
        >
          Encaminhar à emergência
        </Botao>
      </View>
    </Cartao>
  );
}

/** Conclusão: orientação + documentos (receita, pedido de exame, atestado). */
function Concluir({
  chamado,
  aoCancelar,
  aoConcluir,
}: {
  chamado: Chamado;
  aoCancelar: () => void;
  aoConcluir: () => void;
}) {
  const { espacamento } = useTema();
  const [orientacao, setOrientacao] = useState('');
  const [receita, setReceita] = useState('');
  const [exames, setExames] = useState('');
  const [diasAtestado, setDiasAtestado] = useState('');
  const linhas = (t: string) =>
    t
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);

  const concluir = useMutation({
    mutationFn: () => {
      const documentos: NovoDocumento[] = [];
      if (linhas(receita).length) {
        documentos.push({
          tipo: 'receita',
          titulo: 'Receita',
          conteudo: 'Uso conforme orientação abaixo.',
          itens: linhas(receita),
        });
      }
      if (linhas(exames).length) {
        documentos.push({
          tipo: 'solicitacao_exame',
          titulo: 'Pedido de exames',
          conteudo: 'Solicito os exames abaixo.',
          itens: linhas(exames),
        });
      }
      if (Number(diasAtestado) > 0) {
        documentos.push({
          tipo: 'atestado',
          titulo: 'Atestado',
          conteudo: `Atesto que ${chamado.paciente.nome} esteve em consulta nesta data e precisa de ${Number(diasAtestado)} dia(s) de afastamento.`,
        });
      }
      return concluirAtendimento(chamado.id, {
        orientacao: orientacao.trim() || undefined,
        documentos,
      });
    },
    onSuccess: aoConcluir,
  });

  return (
    <View style={{ gap: espacamento.espacamento16 }}>
      <AreaTexto
        rotulo="Orientações ao paciente"
        ajuda="Linguagem simples: o paciente lê no app."
        valor={orientacao}
        aoMudar={setOrientacao}
      />
      <AreaTexto
        rotulo="Receita (um remédio por linha)"
        ajuda="Exemplo: Losartana 50 mg, 1 comprimido pela manhã"
        valor={receita}
        aoMudar={setReceita}
      />
      <AreaTexto rotulo="Exames (um por linha)" valor={exames} aoMudar={setExames} linhas={3} />
      <Campo
        rotulo="Dias de atestado"
        valor={diasAtestado}
        aoMudar={(v) => setDiasAtestado(v.replace(/\D/g, ''))}
        obrigatorio={false}
      />
      <MensagemErro erro={concluir.error} />
      <Botao
        principal
        icone="check-check"
        carregando={concluir.isPending}
        aoTocar={() => concluir.mutate()}
      >
        Concluir e enviar ao paciente
      </Botao>
      <Botao variante="terciario" aoTocar={aoCancelar}>
        Voltar
      </Botao>
    </View>
  );
}

function AgendaDeHoje() {
  const { espacamento } = useTema();
  const agenda = useQuery({
    queryKey: ['medico', 'agenda'],
    queryFn: () => agendaDoMedico(),
    refetchInterval: 30_000,
  });
  if (!agenda.data || agenda.data.length === 0) return null;
  return (
    <Secao titulo="Minha agenda de hoje">
      <View style={{ gap: espacamento.espacamento12 }}>
        {agenda.data.map((c) => (
          <ItemLista
            key={c.id}
            icone="clock"
            titulo={`${c.hora ?? '--:--'} · ${c.paciente.nome}`}
            subtitulo={`${c.especialidade.nome} · ${c.unidade.nome}`}
            depois={<Selo status={c.status} />}
          />
        ))}
      </View>
    </Secao>
  );
}
