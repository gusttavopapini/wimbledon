import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { comoErroApi } from '@/api/erros';
import { textoDoErro, type TextoErro } from '@/api/mensagens';
import { Botao } from '@/components/Botao';
import { Campo } from '@/components/Campo';
import { Folha } from '@/components/Folha';
import { Mensagem } from '@/components/Mensagem';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { Topo } from '@/components/Topo';
import { useSessao } from '@/hooks/useSessao';
import { campo } from '@/validacao';
import { esquemaEntrar, type FormEntrar } from '@/validacao/formularios';

export default function Entrar() {
  const { entrar, enviarLinkNovaSenha } = useSessao();
  const [falha, setFalha] = useState<TextoErro | null>(null);
  const [linkEnviadoPara, setLinkEnviadoPara] = useState<string | null>(null);
  const [enviandoLink, setEnviandoLink] = useState(false);

  // Valida ao sair do campo ou ao tocar em Entrar; nunca a cada tecla.
  const { control, handleSubmit, getValues, setError, clearErrors, trigger, formState } =
    useForm<FormEntrar>({
      resolver: zodResolver(esquemaEntrar),
      mode: 'onBlur',
      reValidateMode: 'onBlur',
      defaultValues: { email: '', senha: '' },
    });

  const aoEntrar = handleSubmit(async ({ email, senha }) => {
    setFalha(null);
    setLinkEnviadoPara(null);
    try {
      await entrar(email, senha);
      // A navegação acontece sozinha: a sessão muda e as rotas protegidas trocam.
    } catch (erro) {
      setFalha(textoDoErro(comoErroApi(erro)));
    }
  });

  async function aoEsquecerSenha() {
    setFalha(null);
    setLinkEnviadoPara(null);
    // Espera a validação de "sair do campo" (disparada pelo toque) terminar,
    // para a mensagem abaixo não ser sobrescrita por ela.
    await trigger('email');
    const email = getValues('email');
    if (!email.trim()) {
      setError(
        'email',
        { message: 'Digite seu e-mail aqui e toque de novo em Esqueci minha senha.' },
        { shouldFocus: true },
      );
      return;
    }
    const valido = campo.email.safeParse(email);
    if (!valido.success) {
      setError('email', { message: valido.error.issues[0]?.message }, { shouldFocus: true });
      return;
    }
    clearErrors('email');
    setEnviandoLink(true);
    try {
      await enviarLinkNovaSenha(email);
      setLinkEnviadoPara(email.trim().toLowerCase());
    } catch (erro) {
      setFalha(textoDoErro(comoErroApi(erro)));
    } finally {
      setEnviandoLink(false);
    }
  }

  return (
    <Tela>
      <Topo titulo="Olá!" subtitulo="Que bom ter você aqui." />
      <Folha>
        <Texto estilo="tituloSecao" cor="primariaEscura" accessibilityRole="header">
          Entrar na sua conta
        </Texto>

        <Controller
          control={control}
          name="email"
          render={({ field, fieldState }) => (
            <Campo
              ref={field.ref}
              rotulo="E-mail"
              tipo="email"
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="next"
              valor={field.value}
              aoMudar={field.onChange}
              aoSair={field.onBlur}
              erro={fieldState.error?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="senha"
          render={({ field, fieldState }) => (
            <Campo
              ref={field.ref}
              rotulo="Senha"
              tipo="senha"
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={() => void aoEntrar()}
              valor={field.value}
              aoMudar={field.onChange}
              aoSair={field.onBlur}
              erro={fieldState.error?.message}
            />
          )}
        />

        {linkEnviadoPara ? (
          <Mensagem tipo="sucesso" titulo="Pedido enviado">
            {`Se houver uma conta com o e-mail ${linkEnviadoPara}, você vai receber um link para criar uma senha nova. Confira também a caixa de spam.`}
          </Mensagem>
        ) : null}

        <Botao
          variante="terciario"
          carregando={enviandoLink}
          rotuloCarregando="Enviando o link…"
          dica="Envia para o e-mail digitado acima um link para criar uma senha nova"
          aoTocar={() => void aoEsquecerSenha()}
        >
          Esqueci minha senha
        </Botao>

        {falha ? (
          <Mensagem tipo="erro" titulo={falha.titulo}>
            {falha.texto}
          </Mensagem>
        ) : null}

        <Botao
          principal
          icone="log-in"
          carregando={formState.isSubmitting}
          rotuloCarregando="Entrando…"
          aoTocar={() => void aoEntrar()}
        >
          Entrar
        </Botao>
        <Botao variante="secundario" larguraTotal aoTocar={() => router.push('/criar-conta')}>
          Criar minha conta
        </Botao>
      </Folha>
    </Tela>
  );
}
