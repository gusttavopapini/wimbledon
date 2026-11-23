import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { triar } from '@/api/atendimento';
import { comoErroApi } from '@/api/erros';
import { Botao } from '@/components/Botao';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { Folha } from '@/components/Folha';
import { Mensagem } from '@/components/Mensagem';
import { AreaTexto, Opcoes } from '@/components/Pecas';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { chavesAtendimento } from '@/hooks/useAtendimento';
import { useTema } from '@/hooks/useTema';
import { useVoltar } from '@/hooks/useVoltar';

/** As mesmas perguntas do protótipo, uma por tela; no fim, a pessoa pode escrever com as próprias palavras. */
const PERGUNTAS = [
  {
    chave: 'sinto',
    pergunta: 'O que você está sentindo?',
    opcoes: [
      'Dor no peito',
      'Falta de ar ou tosse',
      'Dor de cabeça',
      'Dor de estômago',
      'Dor nas articulações',
      'Problema na pele',
      'Outro',
    ],
  },
  {
    chave: 'tempo',
    pergunta: 'Há quanto tempo?',
    opcoes: ['Começou hoje', 'Há alguns dias', 'Há mais de uma semana', 'Há mais de um mês'],
  },
  {
    chave: 'outros',
    pergunta: 'Tem algum outro sintoma?',
    opcoes: [
      'Nenhum outro',
      'Febre',
      'Tontura',
      'Cansaço',
      'Dor forte e repentina',
      'Desmaio',
      'Falta de ar intensa',
    ],
  },
] as const;

export default function PreTriagem() {
  const voltar = useVoltar('/');
  const { espacamento } = useTema();
  const queryClient = useQueryClient();
  const [passo, setPasso] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [texto, setTexto] = useState('');

  const enviar = useMutation({
    mutationFn: () => {
      const relato = [
        `Sinto: ${respostas.sinto ?? 'não informado'}.`,
        `Há quanto tempo: ${respostas.tempo ?? 'não informado'}.`,
        `Outros sintomas: ${respostas.outros ?? 'não informado'}.`,
        texto.trim() ? `Nas palavras da pessoa: ${texto.trim()}` : '',
      ]
        .filter(Boolean)
        .join(' ');
      return triar(relato);
    },
    onSuccess: (resultado) => {
      queryClient.setQueryData(chavesAtendimento.triagem(resultado.id), resultado);
      router.replace({ pathname: '/triagem/resultado', params: { id: resultado.id } });
    },
  });

  const atual = PERGUNTAS[passo];
  const total = PERGUNTAS.length + 1;

  return (
    <Tela>
      <Folha semTopo>
        <CabecalhoTela
          titulo="Pré-triagem"
          subtitulo={`Passo ${passo + 1} de ${total}`}
          aoVoltar={passo === 0 ? voltar : () => setPasso(passo - 1)}
        />
        <Mensagem tipo="informacao" titulo="Isto não substitui o médico">
          Vamos sugerir a especialidade certa para você marcar a consulta. Em caso de emergência,
          ligue 192.
        </Mensagem>

        {atual ? (
          <View style={{ gap: espacamento.espacamento16 }}>
            <Texto estilo="tituloTela" accessibilityRole="header">
              {atual.pergunta}
            </Texto>
            <Opcoes
              valor={respostas[atual.chave] ?? null}
              aoMudar={(v) => {
                setRespostas({ ...respostas, [atual.chave]: v });
                setPasso(passo + 1);
              }}
              opcoes={atual.opcoes.map((o) => ({ valor: o, rotulo: o }))}
            />
          </View>
        ) : (
          <View style={{ gap: espacamento.espacamento16 }}>
            <AreaTexto
              rotulo="Quer contar mais alguma coisa? (opcional)"
              ajuda="Escreva com suas palavras. Exemplo: dói mais quando subo escada."
              valor={texto}
              aoMudar={setTexto}
            />
            {enviar.error ? (
              <Mensagem tipo="erro" titulo="Não conseguimos analisar agora">
                {comoErroApi(enviar.error).message}
              </Mensagem>
            ) : null}
            <Botao
              principal
              icone="sparkles"
              carregando={enviar.isPending}
              rotuloCarregando="Analisando seus sintomas…"
              aoTocar={() => enviar.mutate()}
            >
              Ver sugestão de especialidade
            </Botao>
          </View>
        )}
      </Folha>
    </Tela>
  );
}
