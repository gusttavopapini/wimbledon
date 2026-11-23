import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Botao } from '@/components/Botao';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { ChipEspecialidade } from '@/components/Chip';
import { EstadoTela } from '@/components/EstadoTela';
import { Folha } from '@/components/Folha';
import { Opcoes, Secao } from '@/components/Pecas';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { useHorarios } from '@/hooks/useAtendimento';
import { useEspecialidade, useUnidade } from '@/hooks/useCadastros';
import { useTema } from '@/hooks/useTema';
import { useVoltar } from '@/hooks/useVoltar';
import { diaCurto, diaPorExtenso } from '@/utils/datas';

/** Escolher dia e horário: uma decisão por vez (primeiro o dia, depois a hora). */
export default function EscolherHorario() {
  const p = useLocalSearchParams<{
    medicoId: string;
    unidadeId: string;
    especialidadeId: string;
    preTriagemId?: string;
    nomeMedico?: string;
  }>();
  const voltar = useVoltar('/especialidades');
  const { espacamento, cores, raio, tamanho } = useTema();
  const unidade = useUnidade(p.unidadeId ?? '');
  const especialidade = useEspecialidade(p.especialidadeId ?? '');
  const { data, isPending, isError, refetch } = useHorarios(p.medicoId ?? '', p.unidadeId ?? '');
  const [diaEscolhido, setDia] = useState<string | null>(null);
  // Sem escolha ainda, o primeiro dia com horário já vem marcado.
  const dia = diaEscolhido ?? data?.[0]?.data ?? null;
  const [hora, setHora] = useState<string | null>(null);

  const doDia = data?.find((d) => d.data === dia);

  return (
    <Tela>
      <Folha semTopo>
        <CabecalhoTela
          titulo="Escolha o horário"
          subtitulo={unidade.data?.nome}
          aoVoltar={voltar}
        />
        {especialidade.data ? (
          <ChipEspecialidade especialidade={especialidade.data.id}>
            {especialidade.data.nome}
          </ChipEspecialidade>
        ) : null}

        {isPending ? <EstadoTela tipo="carregando" titulo="Buscando os horários livres" /> : null}
        {isError ? (
          <EstadoTela
            tipo="erro"
            titulo="Não conseguimos buscar os horários"
            mensagem="Confira a internet e toque em Tentar de novo."
            aoAgir={() => void refetch()}
          />
        ) : null}
        {data && data.length === 0 ? (
          <EstadoTela
            tipo="vazio"
            icone="calendar-x"
            titulo="Sem horários livres nas próximas 3 semanas"
            mensagem="Escolha outro médico ou outra unidade."
            rotuloAcao="Escolher outro médico"
            aoAgir={voltar}
          />
        ) : null}

        {data && data.length > 0 ? (
          <>
            <Secao titulo="1. Escolha o dia">
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: espacamento.espacamento8 }}
              >
                {data.map((d) => {
                  const c = diaCurto(d.data);
                  const marcado = d.data === dia;
                  return (
                    <Pressable
                      key={d.data}
                      accessibilityRole="radio"
                      aria-checked={marcado}
                      accessibilityLabel={`${diaPorExtenso(d.data)}, ${d.horarios.length} horários livres`}
                      onPress={() => {
                        setDia(d.data);
                        setHora(null);
                      }}
                      style={{
                        width: 84,
                        minHeight: 96,
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        borderRadius: raio.raioCartaoInterno,
                        borderWidth: tamanho.espessuraBorda,
                        borderColor: marcado ? cores.primaria : cores.contorno,
                        backgroundColor: marcado ? cores.primaria : cores.superficie,
                      }}
                    >
                      <Texto
                        estilo="rotulo"
                        cor={marcado ? 'textoSobrePrimaria' : 'textoSecundario'}
                      >
                        {c.semana}
                      </Texto>
                      <Texto
                        estilo="tituloSecao"
                        cor={marcado ? 'textoSobrePrimaria' : 'primariaEscura'}
                      >
                        {c.dia}
                      </Texto>
                      <Texto
                        estilo="rotulo"
                        cor={marcado ? 'textoSobrePrimaria' : 'textoSecundario'}
                      >
                        {c.mes}
                      </Texto>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </Secao>

            {doDia ? (
              <Secao titulo="2. Escolha a hora">
                <Texto estilo="apoio" cor="textoSecundario">
                  {diaPorExtenso(doDia.data)}
                </Texto>
                <Opcoes
                  colunas={3}
                  valor={hora}
                  aoMudar={setHora}
                  opcoes={doDia.horarios.map((h) => ({ valor: h, rotulo: h }))}
                />
              </Secao>
            ) : null}

            <View style={{ gap: espacamento.espacamento8 }}>
              <Botao
                principal
                desabilitado={!dia || !hora}
                iconeFim="chevron-right"
                aoTocar={() =>
                  router.push({
                    pathname: '/agendar/revisao',
                    params: { ...p, data: dia!, hora: hora! },
                  })
                }
              >
                Continuar
              </Botao>
              {!hora ? (
                <Texto estilo="apoio" cor="textoSecundario" style={{ textAlign: 'center' }}>
                  Escolha um horário para continuar.
                </Texto>
              ) : null}
            </View>
          </>
        ) : null}
      </Folha>
    </Tela>
  );
}
