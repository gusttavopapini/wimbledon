import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { View } from 'react-native';

import {
  alterarStatusConta,
  aprovarPainel,
  atualizarConsultorio,
  consultoriosDaUnidade,
  criarConsultorio,
  criarContaEquipe,
  criarDisponibilidade,
  criarEspecialidade,
  criarMedico,
  desativarPainel,
  disponibilidadesDoMedico,
  equipeDaUnidade,
  indicadores,
  paineisDaUnidade,
  redefinirSenha,
  removerDisponibilidade,
  type DadosContaEquipe,
} from '@/api/atendimento';
import type { Usuario } from '@/api/auth';
import { Botao } from '@/components/Botao';
import { Campo } from '@/components/Campo';
import { Cartao } from '@/components/Cartao';
import { EstadoTela } from '@/components/EstadoTela';
import { Mensagem } from '@/components/Mensagem';
import {
  AreaTexto,
  ItemLista,
  MultiOpcoes,
  Opcoes,
  Secao,
  avisar,
  confirmar,
} from '@/components/Pecas';
import { Texto } from '@/components/Texto';
import { useEspecialidades, useUnidades } from '@/hooks/useCadastros';
import { useSessao } from '@/hooks/useSessao';
import { useTema } from '@/hooks/useTema';
import { NOMES_DIAS } from '@/utils/datas';
import { soDigitos } from '@/utils/mascaras';

import { MensagemErro } from './comum';

const PERFIS = {
  recepcionista: 'Recepção',
  manutencao: 'Manutenção',
  medico: 'Médico',
  administrativo: 'Administrativo',
  paciente: 'Paciente',
} as const;

// ---------------------------------------------------------------------------
export function PainelDoDia({ unidadeId }: { unidadeId: string }) {
  const { espacamento } = useTema();
  const q = useQuery({
    queryKey: ['gestao', 'indicadores', unidadeId],
    queryFn: () => indicadores(unidadeId),
    refetchInterval: 30_000,
  });
  if (q.isPending) return <EstadoTela tipo="carregando" titulo="Carregando os números de hoje" />;
  if (q.isError) return <MensagemErro erro={q.error} />;
  const d = q.data;
  const numeros: [string, number | string][] = [
    ['Atendimentos do dia', d.total],
    ['A chegar', d.porStatus.agendado + d.porStatus.aguardando_recepcao],
    ['Na sala de espera', d.porStatus.aguardando_medico],
    ['Em atendimento', d.porStatus.chamando + d.porStatus.em_atendimento],
    ['Concluídos', d.porStatus.concluido],
    ['Faltas', d.porStatus.nao_compareceu],
    ['Sem horário marcado', d.espontaneos],
    ['Espera média', d.esperaMediaMinutos === null ? '—' : `${d.esperaMediaMinutos} min`],
  ];
  return (
    <View style={{ gap: espacamento.espacamento16 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: espacamento.espacamento12 }}>
        {numeros.map(([rotulo, valor]) => (
          <View key={rotulo} style={{ flexBasis: '47%', flexGrow: 1 }}>
            <Cartao variante="alternativo">
              <Texto estilo="display" cor="primariaEscura">
                {String(valor)}
              </Texto>
              <Texto estilo="rotulo">{rotulo}</Texto>
            </Cartao>
          </View>
        ))}
      </View>
      <Secao titulo="Plantões abertos">
        {d.plantoesAtivos.length === 0 ? (
          <Texto estilo="apoio" cor="textoSecundario">
            Nenhum médico de plantão agora.
          </Texto>
        ) : (
          d.plantoesAtivos.map((p) => (
            <ItemLista
              key={p.medicoNome}
              icone="stethoscope"
              titulo={p.medicoNome}
              subtitulo={p.consultorioNome}
            />
          ))
        )}
      </Secao>
    </View>
  );
}

// ---------------------------------------------------------------------------
export function Equipe({ unidadeId }: { unidadeId: string }) {
  const { usuario } = useSessao();
  const admin = usuario?.perfil === 'administrativo';
  const queryClient = useQueryClient();
  const { espacamento } = useTema();
  const q = useQuery({
    queryKey: ['gestao', 'equipe', unidadeId],
    queryFn: () => equipeDaUnidade(unidadeId),
  });
  const atualizar = () => queryClient.invalidateQueries({ queryKey: ['gestao', 'equipe'] });
  const [nova, setNova] = useState<DadosContaEquipe['perfil'] | null>(null);
  const [acessoMedico, setAcessoMedico] = useState<string | null>(null);

  return (
    <View style={{ gap: espacamento.espacamento24 }}>
      <Secao titulo="Contas da unidade">
        {q.isPending ? <EstadoTela tipo="carregando" titulo="Carregando a equipe" /> : null}
        <MensagemErro erro={q.error} />
        <View style={{ gap: espacamento.espacamento12 }}>
          {q.data?.contas.map((u) => (
            <ContaEquipe key={u.id} usuario={u} aoMudar={atualizar} />
          ))}
        </View>
        {nova ? (
          <NovaConta
            perfil={nova}
            unidadeId={unidadeId}
            aoTerminar={() => {
              setNova(null);
              void atualizar();
            }}
          />
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Botao variante="secundario" icone="user-plus" aoTocar={() => setNova('recepcionista')}>
              Nova recepcionista
            </Botao>
            {admin ? (
              <Botao variante="secundario" icone="user-plus" aoTocar={() => setNova('manutencao')}>
                Nova conta de manutenção
              </Botao>
            ) : null}
          </View>
        )}
      </Secao>

      <Secao titulo="Médicos que atendem aqui">
        <View style={{ gap: espacamento.espacamento12 }}>
          {q.data?.medicos.map((m) => (
            <View key={m.id} style={{ gap: 8 }}>
              <ItemLista
                icone="stethoscope"
                titulo={m.nome}
                subtitulo={`${m.conselho.tipo}-${m.conselho.uf} ${m.conselho.numero}`}
                detalhe={m.temConta ? 'Tem acesso ao app' : 'Ainda sem acesso ao app'}
              />
              {admin && !m.temConta ? (
                acessoMedico === m.id ? (
                  <NovaConta
                    perfil="medico"
                    medicoId={m.id}
                    nomeInicial={m.nome.replace(/^Dra?\.\s*/, '')}
                    aoTerminar={() => {
                      setAcessoMedico(null);
                      void atualizar();
                    }}
                  />
                ) : (
                  <Botao
                    variante="terciario"
                    icone="key-round"
                    aoTocar={() => setAcessoMedico(m.id)}
                  >
                    Criar acesso ao app
                  </Botao>
                )
              ) : null}
            </View>
          ))}
        </View>
        {!admin ? (
          <Texto estilo="apoio" cor="textoSecundario">
            Contas de médico são criadas pela administração (RN24).
          </Texto>
        ) : null}
      </Secao>
    </View>
  );
}

function ContaEquipe({ usuario: u, aoMudar }: { usuario: Usuario; aoMudar: () => void }) {
  const senha = useMutation({
    mutationFn: () => redefinirSenha(u.id),
    onSuccess: (r) =>
      avisar(
        'Senha provisória',
        `Passe para ${u.nome}: ${r.senhaProvisoria}\n\nEla não aparece de novo.`,
      ),
  });
  const status = useMutation({
    mutationFn: (ativo: boolean) => alterarStatusConta(u.id, ativo),
    onSuccess: aoMudar,
  });
  const ativa = u.status !== 'inativo';
  return (
    <Cartao variante="interno">
      <Texto estilo="corpoForte">{u.nome}</Texto>
      <Texto
        estilo="rotulo"
        cor="primaria"
      >{`${PERFIS[u.perfil]} · ${u.email}${ativa ? '' : ' · desativada'}`}</Texto>
      <MensagemErro erro={senha.error ?? status.error} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {u.perfil === 'recepcionista' || u.perfil === 'manutencao' ? (
          <Botao
            variante="secundario"
            icone="key-round"
            carregando={senha.isPending}
            aoTocar={() => senha.mutate()}
          >
            Nova senha
          </Botao>
        ) : null}
        <Botao
          variante={ativa ? 'destrutivo' : 'secundario'}
          icone="power"
          carregando={status.isPending}
          aoTocar={async () => {
            if (
              !ativa ||
              (await confirmar(
                'Desativar a conta?',
                `${u.nome} não vai mais conseguir entrar.`,
                'Desativar',
              ))
            ) {
              status.mutate(!ativa);
            }
          }}
        >
          {ativa ? 'Desativar' : 'Reativar'}
        </Botao>
      </View>
    </Cartao>
  );
}

function NovaConta({
  perfil,
  unidadeId,
  medicoId,
  nomeInicial = '',
  aoTerminar,
}: {
  perfil: DadosContaEquipe['perfil'];
  unidadeId?: string;
  medicoId?: string;
  nomeInicial?: string;
  aoTerminar: () => void;
}) {
  const { espacamento } = useTema();
  const [nome, setNome] = useState(nomeInicial);
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const criar = useMutation({
    mutationFn: () =>
      criarContaEquipe({
        nome,
        cpf: soDigitos(cpf),
        email,
        perfil,
        unidadeId: perfil === 'recepcionista' || perfil === 'manutencao' ? unidadeId : undefined,
        medicoId,
      }),
    onSuccess: (r) => {
      avisar(
        'Conta criada',
        `E-mail: ${email}\nSenha provisória: ${r.senhaProvisoria ?? '(a que você definiu)'}\n\nAnote agora: ela não aparece de novo.`,
      );
      aoTerminar();
    },
  });
  return (
    <Cartao variante="interno" titulo={`Nova conta: ${PERFIS[perfil]}`}>
      <View style={{ gap: espacamento.espacamento12 }}>
        <Campo rotulo="Nome completo" valor={nome} aoMudar={setNome} autoCapitalize="words" />
        <Campo rotulo="CPF" tipo="cpf" valor={cpf} aoMudar={setCpf} />
        <Campo rotulo="E-mail de acesso" tipo="email" valor={email} aoMudar={setEmail} />
        <MensagemErro erro={criar.error} />
        <Botao
          principal
          icone="user-plus"
          carregando={criar.isPending}
          aoTocar={() => criar.mutate()}
        >
          Criar conta
        </Botao>
        <Botao variante="terciario" aoTocar={aoTerminar}>
          Cancelar
        </Botao>
      </View>
    </Cartao>
  );
}

// ---------------------------------------------------------------------------
export function Consultorios({ unidadeId }: { unidadeId: string }) {
  const queryClient = useQueryClient();
  const { espacamento } = useTema();
  const q = useQuery({
    queryKey: ['consultorios', unidadeId],
    queryFn: () => consultoriosDaUnidade(unidadeId),
  });
  const [nome, setNome] = useState('');
  const atualizar = () => queryClient.invalidateQueries({ queryKey: ['consultorios', unidadeId] });
  const criar = useMutation({
    mutationFn: () => criarConsultorio(unidadeId, nome),
    onSuccess: () => {
      setNome('');
      void atualizar();
    },
  });
  const alternar = useMutation({
    mutationFn: (c: { id: string; ativo: boolean }) =>
      atualizarConsultorio(c.id, { ativo: !c.ativo }),
    onSuccess: atualizar,
  });
  return (
    <View style={{ gap: espacamento.espacamento16 }}>
      {q.data?.map((c) => (
        <ItemLista
          key={c.id}
          icone="door-open"
          titulo={c.nome}
          subtitulo={c.ativo ? 'Em uso' : 'Desativado'}
          depois={
            <Botao variante="terciario" aoTocar={() => alternar.mutate(c)}>
              {c.ativo ? 'Desativar' : 'Reativar'}
            </Botao>
          }
        />
      ))}
      <Campo
        rotulo="Novo consultório"
        ajuda="Como aparece na TV. Exemplo: Consultório 4"
        valor={nome}
        aoMudar={setNome}
      />
      <MensagemErro erro={criar.error} />
      <Botao
        variante="secundario"
        larguraTotal
        icone="plus"
        desabilitado={!nome.trim()}
        carregando={criar.isPending}
        aoTocar={() => criar.mutate()}
      >
        Adicionar consultório
      </Botao>
    </View>
  );
}

// ---------------------------------------------------------------------------
export function Tvs({ unidadeId }: { unidadeId: string }) {
  const queryClient = useQueryClient();
  const { espacamento } = useTema();
  const q = useQuery({
    queryKey: ['paineis', unidadeId],
    queryFn: () => paineisDaUnidade(unidadeId),
  });
  const [codigo, setCodigo] = useState('');
  const [nome, setNome] = useState('TV da recepção');
  const atualizar = () => queryClient.invalidateQueries({ queryKey: ['paineis', unidadeId] });
  const ligar = useMutation({
    mutationFn: () => aprovarPainel(unidadeId, soDigitos(codigo), nome),
    onSuccess: () => {
      setCodigo('');
      void atualizar();
    },
  });
  const desligar = useMutation({ mutationFn: desativarPainel, onSuccess: atualizar });
  return (
    <View style={{ gap: espacamento.espacamento16 }}>
      <Texto estilo="corpo">
        Abra o app do painel na TV. Ela mostra um código de 6 números: digite aqui para ligar a TV a
        esta unidade.
      </Texto>
      {ligar.isSuccess ? (
        <Mensagem
          tipo="sucesso"
          titulo="TV ligada! Em alguns segundos ela começa a mostrar as chamadas."
        />
      ) : null}
      <Campo
        rotulo="Código que aparece na TV"
        valor={codigo}
        aoMudar={(v) => setCodigo(soDigitos(v).slice(0, 6))}
      />
      <Campo rotulo="Nome da TV" valor={nome} aoMudar={setNome} />
      <MensagemErro erro={ligar.error} />
      <Botao
        principal
        icone="tv"
        desabilitado={codigo.length !== 6}
        carregando={ligar.isPending}
        aoTocar={() => ligar.mutate()}
      >
        Ligar uma TV
      </Botao>
      <Secao titulo="TVs ligadas">
        {q.data?.length === 0 ? (
          <Texto estilo="apoio" cor="textoSecundario">
            Nenhuma TV ligada ainda.
          </Texto>
        ) : null}
        {q.data?.map((tv) => (
          <ItemLista
            key={tv.id}
            icone="tv"
            titulo={tv.nome}
            depois={
              <Botao
                variante="terciario"
                aoTocar={async () => {
                  if (
                    await confirmar(
                      'Desligar a TV?',
                      'Ela para de mostrar as chamadas e volta a pedir um código.',
                      'Desligar',
                    )
                  ) {
                    desligar.mutate(tv.id);
                  }
                }}
              >
                Desligar do painel
              </Botao>
            }
          />
        ))}
      </Secao>
    </View>
  );
}

// ---------------------------------------------------------------------------
export function AgendaMedicos({ unidadeId }: { unidadeId: string }) {
  const queryClient = useQueryClient();
  const { espacamento } = useTema();
  const equipe = useQuery({
    queryKey: ['gestao', 'equipe', unidadeId],
    queryFn: () => equipeDaUnidade(unidadeId),
  });
  const [medicoId, setMedicoId] = useState<string | null>(null);
  const janelas = useQuery({
    queryKey: ['disponibilidades', medicoId, unidadeId],
    queryFn: () => disponibilidadesDoMedico(medicoId!, unidadeId),
    enabled: Boolean(medicoId),
  });
  const [dia, setDia] = useState<string | null>('1');
  const [inicio, setInicio] = useState('08:00');
  const [fim, setFim] = useState('12:00');
  const [duracao, setDuracao] = useState<string | null>('30');
  const atualizar = () => queryClient.invalidateQueries({ queryKey: ['disponibilidades'] });
  const criar = useMutation({
    mutationFn: () =>
      criarDisponibilidade(medicoId!, {
        unidadeId,
        diaSemana: Number(dia),
        inicio,
        fim,
        duracaoMinutos: Number(duracao),
      }),
    onSuccess: atualizar,
  });
  const remover = useMutation({ mutationFn: removerDisponibilidade, onSuccess: atualizar });

  return (
    <View style={{ gap: espacamento.espacamento16 }}>
      <Opcoes
        rotulo="Médico"
        valor={medicoId}
        aoMudar={setMedicoId}
        opcoes={(equipe.data?.medicos ?? []).map((m) => ({ valor: m.id, rotulo: m.nome }))}
      />
      {medicoId ? (
        <>
          <Secao titulo="Horários de atendimento nesta unidade">
            {janelas.data?.length === 0 ? (
              <Texto estilo="apoio" cor="textoSecundario">
                Nenhum horário cadastrado.
              </Texto>
            ) : null}
            {janelas.data?.map((j) => (
              <ItemLista
                key={j.id}
                icone="calendar-clock"
                titulo={`${NOMES_DIAS[j.diaSemana]}, ${j.inicio} às ${j.fim}`}
                subtitulo={`Consultas de ${j.duracaoMinutos} min`}
                depois={
                  <Botao variante="terciario" aoTocar={() => remover.mutate(j.id)}>
                    Remover
                  </Botao>
                }
              />
            ))}
          </Secao>
          <Cartao variante="interno" titulo="Adicionar horário">
            <View style={{ gap: espacamento.espacamento12 }}>
              <Opcoes
                rotulo="Dia da semana"
                valor={dia}
                aoMudar={setDia}
                opcoes={NOMES_DIAS.map((n, i) => ({
                  valor: String(i),
                  rotulo: n.replace('-feira', ''),
                }))}
              />
              <Campo rotulo="Começa às (HH:MM)" valor={inicio} aoMudar={setInicio} />
              <Campo rotulo="Termina às (HH:MM)" valor={fim} aoMudar={setFim} />
              <Opcoes
                rotulo="Duração de cada consulta"
                valor={duracao}
                aoMudar={setDuracao}
                opcoes={['15', '20', '30', '40', '60'].map((m) => ({
                  valor: m,
                  rotulo: `${m} min`,
                }))}
              />
              <MensagemErro erro={criar.error ?? remover.error} />
              <Botao
                principal
                icone="plus"
                carregando={criar.isPending}
                aoTocar={() => criar.mutate()}
              >
                Adicionar horário
              </Botao>
            </View>
          </Cartao>
        </>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
/** Só o administrativo: especialidades e médicos (RN24). */
export function Cadastros() {
  const { espacamento } = useTema();
  const queryClient = useQueryClient();
  const especialidades = useEspecialidades();
  const unidades = useUnidades();
  const [nomeEsp, setNomeEsp] = useState('');
  const [descricao, setDescricao] = useState('');
  const [palavras, setPalavras] = useState('');
  const criarEsp = useMutation({
    mutationFn: () =>
      criarEspecialidade({
        nome: nomeEsp,
        descricao,
        palavrasChave: palavras
          .split(',')
          .map((p) => p.trim())
          .filter(Boolean),
      }),
    onSuccess: () => {
      setNomeEsp('');
      setDescricao('');
      setPalavras('');
      void queryClient.invalidateQueries({ queryKey: ['especialidades'] });
    },
  });

  const [nomeMed, setNomeMed] = useState('Dr. ');
  const [crm, setCrm] = useState('');
  const [espIds, setEspIds] = useState<string[]>([]);
  const [uniIds, setUniIds] = useState<string[]>([]);
  const criarMed = useMutation({
    mutationFn: () =>
      criarMedico({
        nome: nomeMed,
        conselho: { tipo: 'CRM', numero: crm, uf: 'PE' },
        especialidadeIds: espIds,
        unidadeIds: uniIds,
      }),
    onSuccess: () => {
      setNomeMed('Dr. ');
      setCrm('');
      setEspIds([]);
      setUniIds([]);
      void queryClient.invalidateQueries({ queryKey: ['gestao'] });
      void queryClient.invalidateQueries({ queryKey: ['medicos'] });
      avisar(
        'Médico cadastrado',
        'Agora cadastre os horários dele na aba "Agenda" e crie o acesso ao app na aba "Equipe".',
      );
    },
  });

  return (
    <View style={{ gap: espacamento.espacamento24 }}>
      <Cartao titulo="Nova especialidade">
        <View style={{ gap: espacamento.espacamento12 }}>
          <Campo rotulo="Nome" valor={nomeEsp} aoMudar={setNomeEsp} />
          <AreaTexto
            rotulo="Descrição para o paciente"
            valor={descricao}
            aoMudar={setDescricao}
            linhas={2}
          />
          <Campo
            rotulo="Palavras-chave (separe por vírgula)"
            valor={palavras}
            aoMudar={setPalavras}
            obrigatorio={false}
          />
          <MensagemErro erro={criarEsp.error} />
          <Botao
            principal
            icone="plus"
            carregando={criarEsp.isPending}
            aoTocar={() => criarEsp.mutate()}
          >
            Cadastrar especialidade
          </Botao>
        </View>
      </Cartao>
      <Cartao titulo="Novo médico">
        <View style={{ gap: espacamento.espacamento12 }}>
          <Campo rotulo='Nome com "Dr." ou "Dra."' valor={nomeMed} aoMudar={setNomeMed} />
          <Campo rotulo="CRM (PE), só números" valor={crm} aoMudar={(v) => setCrm(soDigitos(v))} />
          <MultiOpcoes
            rotulo="Especialidades"
            valores={espIds}
            aoMudar={setEspIds}
            opcoes={(especialidades.data ?? []).map((e) => ({ valor: e.id, rotulo: e.nome }))}
          />
          <MultiOpcoes
            rotulo="Unidades onde atende"
            valores={uniIds}
            aoMudar={setUniIds}
            opcoes={(unidades.data ?? []).map((u) => ({ valor: u.id, rotulo: u.nome }))}
          />
          <MensagemErro erro={criarMed.error} />
          <Botao
            principal
            icone="stethoscope"
            carregando={criarMed.isPending}
            aoTocar={() => criarMed.mutate()}
          >
            Cadastrar médico
          </Botao>
        </View>
      </Cartao>
    </View>
  );
}
