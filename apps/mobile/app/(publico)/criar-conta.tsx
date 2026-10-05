import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Platform, View } from 'react-native';

import { comoErroApi } from '@/api/erros';
import { textoDoErro, type TextoErro } from '@/api/mensagens';
import { VERSAO_TERMO } from '@/auth/termo';
import { Botao } from '@/components/Botao';
import { CaixaMarcacao } from '@/components/CaixaMarcacao';
import { Campo, type CampoProps } from '@/components/Campo';
import { Folha } from '@/components/Folha';
import { Mensagem } from '@/components/Mensagem';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { Topo } from '@/components/Topo';
import { useSessao } from '@/hooks/useSessao';
import { useTema } from '@/hooks/useTema';
import { dataParaIso, soDigitos } from '@/utils/mascaras';
import { CAMPO_DA_API, esquemaCriarConta, type FormCriarConta } from '@/validacao/formularios';

type CampoDeTexto = Exclude<keyof FormCriarConta, 'aceiteTermo' | 'exibicaoPainel'>;

const CAMPOS: (Omit<CampoProps, 'valor' | 'aoMudar' | 'aoSair' | 'erro'> & {
  nome: CampoDeTexto;
})[] = [
  {
    nome: 'nome',
    rotulo: 'Nome completo',
    ajuda: 'Como está no seu documento.',
    autoComplete: 'name',
    textContentType: 'name',
    autoCapitalize: 'words',
  },
  {
    nome: 'cpf',
    rotulo: 'CPF',
    tipo: 'cpf',
    ajuda: 'Os 11 números do seu documento. Usamos o CPF para achar seu cadastro na recepção.',
  },
  {
    nome: 'dataNascimento',
    rotulo: 'Data de nascimento',
    tipo: 'data',
    ajuda: 'Dia, mês e ano. Exemplo: 12/03/1948',
    autoComplete: 'birthdate-full',
  },
  {
    nome: 'telefone',
    rotulo: 'Telefone',
    tipo: 'telefone',
    ajuda: 'Com DDD. Exemplo: (81) 99999-1234. Usamos para avisar sobre suas consultas.',
    autoComplete: 'tel',
    textContentType: 'telephoneNumber',
  },
  {
    nome: 'email',
    rotulo: 'E-mail',
    tipo: 'email',
    ajuda: 'Você vai usar o e-mail para entrar no app. Exemplo: ana@gmail.com',
    autoComplete: 'email',
    textContentType: 'emailAddress',
  },
  {
    nome: 'senha',
    rotulo: 'Senha',
    tipo: 'senha',
    ajuda: 'Pelo menos 8 letras ou números.',
    autoComplete: 'new-password',
    textContentType: 'newPassword',
  },
];

export default function CriarConta() {
  const { criarConta } = useSessao();
  const { espacamento } = useTema();
  const [falha, setFalha] = useState<TextoErro | null>(null);

  // Valida ao sair do campo ou ao tocar em Criar minha conta; nunca a cada tecla.
  const { control, handleSubmit, setError, formState } = useForm<FormCriarConta>({
    resolver: zodResolver(esquemaCriarConta),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    defaultValues: {
      nome: '',
      cpf: '',
      dataNascimento: '',
      telefone: '',
      email: '',
      senha: '',
      aceiteTermo: false,
      exibicaoPainel: false,
    },
  });

  const aoCriar = handleSubmit(async (dados) => {
    setFalha(null);
    try {
      await criarConta({
        nome: dados.nome.trim().replace(/\s+/g, ' '),
        cpf: soDigitos(dados.cpf),
        dataNascimento: dataParaIso(dados.dataNascimento),
        telefone: soDigitos(dados.telefone),
        email: dados.email.trim().toLowerCase(),
        senha: dados.senha,
        consentimento: {
          versaoTermo: VERSAO_TERMO,
          aceito: true,
          canal: Platform.OS === 'web' ? 'pwa' : 'app',
          exibicaoPainel: dados.exibicaoPainel,
        },
      });
      // Conta criada e sessão aberta: as rotas protegidas levam ao Início.
    } catch (bruto) {
      const erro = comoErroApi(bruto);
      if (erro.codigo === 'CPF_JA_CADASTRADO') setError('cpf', { message: erro.message });
      if (erro.codigo === 'EMAIL_JA_CADASTRADO') setError('email', { message: erro.message });
      for (const detalhe of erro.detalhes) {
        const campoForm = CAMPO_DA_API[detalhe.campo];
        if (campoForm) setError(campoForm, { message: detalhe.mensagem });
      }
      setFalha(textoDoErro(erro));
    }
  });

  return (
    <Tela>
      <Topo titulo="Olá!" subtitulo="Vamos criar sua conta. Leva poucos minutos." />
      <Folha>
        <Texto estilo="tituloSecao" cor="primariaEscura" accessibilityRole="header">
          Seus dados
        </Texto>

        {CAMPOS.map(({ nome, ...props }) => (
          <Controller
            key={nome}
            control={control}
            name={nome}
            render={({ field, fieldState }) => (
              <Campo
                {...props}
                ref={field.ref}
                valor={field.value}
                aoMudar={field.onChange}
                aoSair={field.onBlur}
                erro={fieldState.error?.message}
              />
            )}
          />
        ))}

        <View style={{ gap: espacamento.espacamento12 }}>
          <Texto estilo="tituloSecao" cor="primariaEscura" accessibilityRole="header">
            Termo de uso
          </Texto>
          <Texto>
            O termo explica quais dados guardamos e para que usamos. Leia antes de criar a conta.
          </Texto>
          <Botao variante="terciario" aoTocar={() => router.push('/termo')}>
            Ler o termo de uso
          </Botao>
          <Controller
            control={control}
            name="aceiteTermo"
            render={({ field, fieldState }) => (
              <CaixaMarcacao
                rotulo="Li e aceito o termo de uso e privacidade."
                marcado={field.value}
                aoMudar={(marcado) => {
                  field.onChange(marcado);
                  // Marcar é uma escolha só (como sair do campo): revalida já.
                  field.onBlur();
                }}
                erro={fieldState.error?.message}
              />
            )}
          />
        </View>

        <View style={{ gap: espacamento.espacamento12 }}>
          <Texto estilo="tituloSecao" cor="primariaEscura" accessibilityRole="header">
            Painel da recepção
          </Texto>
          <Texto>
            Se você não marcar, o painel mostra só o seu primeiro nome e a primeira letra do
            sobrenome, como “Ana S.”. Você pode criar a conta das duas formas.
          </Texto>
          <Controller
            control={control}
            name="exibicaoPainel"
            render={({ field }) => (
              <CaixaMarcacao
                rotulo="Posso mostrar e falar seu nome completo no painel da recepção quando chegar a sua vez."
                marcado={field.value}
                aoMudar={field.onChange}
              />
            )}
          />
        </View>

        {falha ? (
          <Mensagem
            tipo="erro"
            titulo={falha.titulo}
            acao={
              falha.acao === 'entrar' ? (
                <Botao variante="secundario" larguraTotal aoTocar={() => router.replace('/entrar')}>
                  Entrar
                </Botao>
              ) : undefined
            }
          >
            {falha.texto}
          </Mensagem>
        ) : null}

        <Botao
          principal
          carregando={formState.isSubmitting}
          rotuloCarregando="Criando sua conta…"
          aoTocar={() => void aoCriar()}
        >
          Criar minha conta
        </Botao>
        <Botao variante="secundario" larguraTotal aoTocar={() => router.replace('/entrar')}>
          Voltar
        </Botao>
      </Folha>
    </Tela>
  );
}
