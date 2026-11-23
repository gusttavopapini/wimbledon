import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { View } from 'react-native';

import {
  agendaDaUnidade,
  buscarPacientePorCpf,
  confirmarChegada,
  marcarFalta,
  preCadastrarPaciente,
  registrarEspontaneo,
  type Chamado,
  type Urgencia,
} from '@/api/atendimento';
import type { Usuario } from '@/api/auth';
import { comoErroApi } from '@/api/erros';
import { Botao } from '@/components/Botao';
import { CaixaMarcacao } from '@/components/CaixaMarcacao';
import { Campo } from '@/components/Campo';
import { Cartao } from '@/components/Cartao';
import { EstadoTela } from '@/components/EstadoTela';
import { Folha } from '@/components/Folha';
import { Mensagem } from '@/components/Mensagem';
import { Opcoes, Secao, Selo, SeloUrgencia, confirmar } from '@/components/Pecas';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { useEspecialidades, useUnidade } from '@/hooks/useCadastros';
import { useSessao } from '@/hooks/useSessao';
import { useTema } from '@/hooks/useTema';
import { MensagemErro, TopoEquipe } from '@/telas/comum';
import { diaPorExtenso, hojeNoRecife, horaDe } from '@/utils/datas';
import { dataParaIso, soDigitos } from '@/utils/mascaras';

type Aba = 'agenda' | 'semHorario' | 'cadastro';

/** Recepção: uma unidade só (RN19). Confirma chegada (RN06), marca falta, cadastra e encaixa. */
export default function Recepcao() {
  const { usuario } = useSessao();
  const unidadeId = usuario?.unidadeId ?? '';
  const unidade = useUnidade(unidadeId);
  const [aba, setAba] = useState<Aba>('agenda');

  return (
    <Tela>
      <TopoEquipe titulo="Recepção" subtitulo={unidade.data?.nome} />
      <Folha>
        <Opcoes
          valor={aba}
          aoMudar={setAba}
          opcoes={[
            { valor: 'agenda', rotulo: 'Agenda de hoje' },
            { valor: 'semHorario', rotulo: 'Sem horário' },
            { valor: 'cadastro', rotulo: 'Novo paciente' },
          ]}
        />
        {aba === 'agenda' ? <AgendaDoDia unidadeId={unidadeId} /> : null}
        {aba === 'semHorario' ? <SemHorario unidadeId={unidadeId} /> : null}
        {aba === 'cadastro' ? <NovoPaciente aoCriar={() => setAba('semHorario')} /> : null}
      </Folha>
    </Tela>
  );
}

const A_CHEGAR = ['agendado', 'aguardando_recepcao'];
const NA_ESPERA = ['aguardando_medico', 'chamando', 'em_atendimento'];

function AgendaDoDia({ unidadeId }: { unidadeId: string }) {
  const { espacamento } = useTema();
  const [filtro, setFiltro] = useState<'chegar' | 'espera' | 'todos'>('chegar');
  const hoje = hojeNoRecife();
  const agenda = useQuery({
    queryKey: ['recepcao', unidadeId, hoje],
    queryFn: () => agendaDaUnidade(unidadeId),
    enabled: Boolean(unidadeId),
    refetchInterval: 20_000,
  });
  const lista = (agenda.data ?? []).filter((c) =>
    filtro === 'chegar'
      ? A_CHEGAR.includes(c.status)
      : filtro === 'espera'
        ? NA_ESPERA.includes(c.status)
        : true,
  );

  return (
    <Secao titulo={diaPorExtenso(hoje)}>
      <Opcoes
        valor={filtro}
        aoMudar={setFiltro}
        opcoes={[
          {
            valor: 'chegar',
            rotulo: `A chegar (${agenda.data?.filter((c) => A_CHEGAR.includes(c.status)).length ?? 0})`,
          },
          {
            valor: 'espera',
            rotulo: `Na espera (${agenda.data?.filter((c) => NA_ESPERA.includes(c.status)).length ?? 0})`,
          },
          { valor: 'todos', rotulo: 'Todos' },
        ]}
      />
      {agenda.isPending ? <EstadoTela tipo="carregando" titulo="Carregando a agenda" /> : null}
      {agenda.isError ? (
        <EstadoTela
          tipo="erro"
          titulo="Não conseguimos carregar a agenda"
          aoAgir={() => void agenda.refetch()}
        />
      ) : null}
      {agenda.data && lista.length === 0 ? (
        <EstadoTela tipo="vazio" icone="calendar" titulo="Ninguém nesta lista agora" />
      ) : null}
      <View style={{ gap: espacamento.espacamento12 }}>
        {lista.map((c) => (
          <ItemAgenda key={c.id} chamado={c} />
        ))}
      </View>
    </Secao>
  );
}

function ItemAgenda({ chamado: c }: { chamado: Chamado }) {
  const queryClient = useQueryClient();
  const { espacamento } = useTema();
  const atualizar = () => queryClient.invalidateQueries({ queryKey: ['recepcao'] });
  const chegada = useMutation({ mutationFn: () => confirmarChegada(c.id), onSuccess: atualizar });
  const falta = useMutation({ mutationFn: () => marcarFalta(c.id), onSuccess: atualizar });
  const pendente = A_CHEGAR.includes(c.status);

  return (
    <Cartao variante="interno">
      <View style={{ gap: espacamento.espacamento8 }}>
        <Texto estilo="tituloSecao">
          {c.hora ? `${c.hora} · ${c.paciente.nome}` : c.paciente.nome}
        </Texto>
        <Texto estilo="rotulo" cor="primaria">
          {`${c.especialidade.nome} · ${c.medico?.nome ?? 'Primeiro médico disponível'}`}
        </Texto>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: espacamento.espacamento8 }}>
          <Selo status={c.status} />
          {c.urgencia !== 'rotina' ? <SeloUrgencia urgencia={c.urgencia} /> : null}
        </View>
        {c.chegadaEm ? (
          <Texto estilo="apoio" cor="textoSecundario">
            {`Chegou às ${horaDe(c.chegadaEm)}${c.consultorio ? ` · ${c.consultorio}` : ''}`}
          </Texto>
        ) : null}
        <MensagemErro erro={chegada.error ?? falta.error} />
        {pendente ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: espacamento.espacamento8 }}>
            <Botao icone="check" carregando={chegada.isPending} aoTocar={() => chegada.mutate()}>
              Confirmar chegada
            </Botao>
            <Botao
              variante="secundario"
              icone="x"
              carregando={falta.isPending}
              aoTocar={async () => {
                if (
                  await confirmar(
                    'Marcar falta?',
                    `${c.paciente.nome} não compareceu.`,
                    'Marcar falta',
                  )
                )
                  falta.mutate();
              }}
            >
              Faltou
            </Botao>
          </View>
        ) : null}
      </View>
    </Cartao>
  );
}

function SemHorario({ unidadeId }: { unidadeId: string }) {
  const { espacamento } = useTema();
  const queryClient = useQueryClient();
  const unidade = useUnidade(unidadeId);
  const especialidades = useEspecialidades();
  const [cpf, setCpf] = useState('');
  const [paciente, setPaciente] = useState<Usuario | null>(null);
  const [especialidadeId, setEspecialidadeId] = useState<string | null>(null);
  const [urgencia, setUrgencia] = useState<Urgencia>('rotina');
  const [feito, setFeito] = useState<string | null>(null);

  const busca = useMutation({
    mutationFn: () => buscarPacientePorCpf(soDigitos(cpf)),
    onSuccess: (p) => {
      setPaciente(p);
      setFeito(null);
    },
    onError: () => setPaciente(null),
  });
  const registrar = useMutation({
    mutationFn: () =>
      registrarEspontaneo({
        unidadeId,
        pacienteId: paciente!.id,
        especialidadeId: especialidadeId!,
        urgencia,
      }),
    onSuccess: () => {
      setFeito(`${paciente!.nome} entrou na fila de espera.`);
      setPaciente(null);
      setCpf('');
      setEspecialidadeId(null);
      setUrgencia('rotina');
      void queryClient.invalidateQueries({ queryKey: ['recepcao'] });
    },
  });
  const opcoesEsp = (especialidades.data ?? [])
    .filter((e) => unidade.data?.especialidadeIds.includes(e.id))
    .map((e) => ({ valor: e.id, rotulo: e.nome }));
  const naoAchou = busca.error && comoErroApi(busca.error).codigo === 'NAO_ENCONTRADO';

  return (
    <View style={{ gap: espacamento.espacamento16 }}>
      <Texto estilo="corpo">
        Para quem chegou sem consulta marcada. A pessoa entra direto na fila de espera.
      </Texto>
      {feito ? <Mensagem tipo="sucesso" titulo={feito} /> : null}
      <Campo rotulo="CPF do paciente" tipo="cpf" valor={cpf} aoMudar={setCpf} />
      <Botao
        variante="secundario"
        larguraTotal
        icone="search"
        carregando={busca.isPending}
        aoTocar={() => busca.mutate()}
      >
        Buscar paciente
      </Botao>
      {naoAchou ? (
        <Mensagem tipo="atencao" titulo="Paciente sem cadastro">
          Toque em “Novo paciente” no alto da tela para fazer o pré-cadastro.
        </Mensagem>
      ) : (
        <MensagemErro erro={busca.error} />
      )}
      {paciente ? (
        <Cartao titulo={paciente.nome}>
          <View style={{ gap: espacamento.espacamento16 }}>
            <Opcoes
              rotulo="Especialidade"
              valor={especialidadeId}
              aoMudar={setEspecialidadeId}
              opcoes={opcoesEsp}
            />
            <Opcoes
              rotulo="Urgência"
              valor={urgencia}
              aoMudar={setUrgencia}
              opcoes={[
                { valor: 'rotina', rotulo: 'Rotina' },
                { valor: 'prioritario', rotulo: 'Prioritário' },
                { valor: 'emergencia', rotulo: 'Emergência' },
              ]}
            />
            <MensagemErro erro={registrar.error} />
            <Botao
              principal
              icone="users"
              desabilitado={!especialidadeId}
              carregando={registrar.isPending}
              aoTocar={() => registrar.mutate()}
            >
              Colocar na fila
            </Botao>
          </View>
        </Cartao>
      ) : null}
    </View>
  );
}

function NovoPaciente({ aoCriar }: { aoCriar: () => void }) {
  const { espacamento } = useTema();
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [painel, setPainel] = useState(false);
  const criar = useMutation({
    mutationFn: () =>
      preCadastrarPaciente({
        nome,
        cpf: soDigitos(cpf),
        telefone: telefone ? soDigitos(telefone) : undefined,
        dataNascimento: nascimento ? dataParaIso(nascimento) : undefined,
        exibicaoPainel: painel,
      }),
  });

  if (criar.isSuccess) {
    return (
      <View style={{ gap: espacamento.espacamento16 }}>
        <Mensagem tipo="sucesso" titulo={`${criar.data.nome} foi cadastrado`}>
          Para usar o app, a pessoa toca em “Esqueci minha senha” na tela de entrada.
        </Mensagem>
        <Botao principal aoTocar={aoCriar}>
          Colocar na fila agora
        </Botao>
        <Botao variante="secundario" larguraTotal aoTocar={() => criar.reset()}>
          Cadastrar outra pessoa
        </Botao>
      </View>
    );
  }

  return (
    <View style={{ gap: espacamento.espacamento16 }}>
      <Campo rotulo="Nome completo" valor={nome} aoMudar={setNome} autoCapitalize="words" />
      <Campo rotulo="CPF" tipo="cpf" valor={cpf} aoMudar={setCpf} />
      <Campo
        rotulo="Telefone com DDD"
        tipo="telefone"
        valor={telefone}
        aoMudar={setTelefone}
        obrigatorio={false}
      />
      <Campo
        rotulo="Data de nascimento"
        tipo="data"
        valor={nascimento}
        aoMudar={setNascimento}
        obrigatorio={false}
      />
      <CaixaMarcacao
        rotulo="A pessoa aceita que o nome completo apareça e seja falado na TV da sala de espera"
        marcado={painel}
        aoMudar={setPainel}
      />
      <MensagemErro erro={criar.error} />
      <Botao
        principal
        icone="user-plus"
        carregando={criar.isPending}
        aoTocar={() => criar.mutate()}
      >
        Cadastrar paciente
      </Botao>
    </View>
  );
}
