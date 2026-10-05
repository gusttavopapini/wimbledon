import { router } from 'expo-router';
import { View } from 'react-native';

import { Botao } from '@/components/Botao';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { useTema } from '@/hooks/useTema';

// TEXTO PROVISÓRIO: o termo definitivo deve ser escrito pelo grupo com
// orientação jurídica (LGPD). Ao trocar o texto, suba VERSAO_TERMO aqui e
// VERSAO_TERMO_ATUAL na API.
const PARAGRAFOS = [
  'O Saúde na Palma da Mão ajuda você a marcar consultas e acompanhar a fila nas unidades de saúde do polo médico do Recife.',
  'Para isso, guardamos seu nome, CPF, data de nascimento, telefone e e-mail. Usamos esses dados para identificar você e cuidar do seu atendimento.',
  'Seu nome completo só aparece no painel da recepção se você permitir. Sem a sua permissão, o painel mostra o primeiro nome e a primeira letra do sobrenome.',
  'Você pode ver e corrigir seus dados no app a qualquer momento. Para outras dúvidas sobre seus dados, fale com a recepção da unidade.',
];

export default function Termo() {
  const { espacamento, tamanho } = useTema();
  return (
    <Tela>
      <View
        style={{
          paddingTop: espacamento.espacamento48,
          paddingHorizontal: tamanho.margemLateral,
          paddingBottom: espacamento.espacamento24,
          gap: espacamento.espacamento16,
        }}
      >
        <Botao variante="secundario" aoTocar={() => router.back()}>
          Voltar
        </Botao>
        <Texto estilo="tituloTela" cor="primariaEscura" accessibilityRole="header">
          Termo de uso e privacidade
        </Texto>
        <Texto estilo="apoio" cor="textoSecundario">
          Versão de 1º de outubro de 2026
        </Texto>
        {PARAGRAFOS.map((paragrafo) => (
          <Texto key={paragrafo}>{paragrafo}</Texto>
        ))}
        <Botao principal aoTocar={() => router.back()}>
          Voltar ao cadastro
        </Botao>
      </View>
    </Tela>
  );
}
