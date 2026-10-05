import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { View } from 'react-native';

import { atualizarMe, type Preferencias, type Usuario } from '@/api/auth';
import { comoErroApi } from '@/api/erros';
import { textoDoErro, type TextoErro } from '@/api/mensagens';
import { CHAVE_ME } from '@/auth/SessaoProvider';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { CaixaMarcacao } from '@/components/CaixaMarcacao';
import { EstadoTela } from '@/components/EstadoTela';
import { Folha } from '@/components/Folha';
import { Mensagem } from '@/components/Mensagem';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { useMe } from '@/hooks/useMe';
import { useTema } from '@/hooks/useTema';

type Ajuste = 'letraGrande' | 'altoContraste';

/**
 * Letra grande e alto contraste: aplicados na hora pelo TemaProvider e salvos
 * na conta (PUT /usuarios/me), para valerem em qualquer aparelho. Se salvar
 * falhar, a tela volta como estava e diz o que fazer.
 */
export default function Ajustes() {
  const { espacamento, definirPreferencias } = useTema();
  const queryClient = useQueryClient();
  const { data, isPending, isError, refetch } = useMe();
  const [salvo, setSalvo] = useState(false);
  const [falha, setFalha] = useState<TextoErro | null>(null);

  const salvar = useMutation({
    mutationFn: ({ usuario, preferencias }: { usuario: Usuario; preferencias: Preferencias }) =>
      // PUT substitui o conjunto editável: reenvia o que deve continuar igual.
      atualizarMe({
        nome: usuario.nome,
        ...(usuario.telefone ? { telefone: usuario.telefone } : {}),
        ...(usuario.dataNascimento ? { dataNascimento: usuario.dataNascimento } : {}),
        ...(usuario.sexo ? { sexo: usuario.sexo } : {}),
        preferencias,
      }),
    onMutate: ({ preferencias }) => {
      setSalvo(false);
      setFalha(null);
      definirPreferencias(preferencias);
    },
    onSuccess: (usuario) => {
      queryClient.setQueryData([...CHAVE_ME, usuario.id], { usuario, perfil: usuario.perfil });
      setSalvo(true);
    },
    onError: (erro, { usuario }) => {
      definirPreferencias(usuario.preferencias);
      setFalha(textoDoErro(comoErroApi(erro)));
    },
  });

  function alternar(usuario: Usuario, ajuste: Ajuste, valor: boolean) {
    if (salvar.isPending) return;
    salvar.mutate({ usuario, preferencias: { ...usuario.preferencias, [ajuste]: valor } });
  }

  return (
    <Tela>
      <Folha semTopo>
        <CabecalhoTela titulo="Ajustes" aoVoltar={null} />
        {isPending ? (
          <EstadoTela tipo="carregando" titulo="Carregando seus ajustes" />
        ) : isError ? (
          <EstadoTela
            tipo="erro"
            titulo="Não conseguimos carregar seus ajustes"
            mensagem="Confira se o celular está conectado à internet e toque em Tentar de novo."
            aoAgir={() => void refetch()}
          />
        ) : (
          <View style={{ gap: espacamento.espacamento24 }}>
            <Texto>
              Os ajustes valem na hora e ficam guardados na sua conta, em qualquer aparelho em que
              você entrar.
            </Texto>
            <View style={{ gap: espacamento.espacamento8 }}>
              <CaixaMarcacao
                rotulo="Usar letra grande"
                marcado={data.usuario.preferencias.letraGrande}
                aoMudar={(valor) => alternar(data.usuario, 'letraGrande', valor)}
              />
              <Texto estilo="apoio" cor="textoSecundario">
                Todos os textos e botões do app ficam maiores.
              </Texto>
            </View>
            <View style={{ gap: espacamento.espacamento8 }}>
              <CaixaMarcacao
                rotulo="Usar alto contraste"
                marcado={data.usuario.preferencias.altoContraste}
                aoMudar={(valor) => alternar(data.usuario, 'altoContraste', valor)}
              />
              <Texto estilo="apoio" cor="textoSecundario">
                Letras brancas e amarelas sobre fundo preto, mais fáceis de ler com pouca visão.
              </Texto>
            </View>
            {salvo ? (
              <Mensagem tipo="sucesso" titulo="Ajuste salvo">
                Ele já está valendo e fica guardado na sua conta.
              </Mensagem>
            ) : null}
            {falha ? (
              <Mensagem tipo="erro" titulo="Não conseguimos salvar o ajuste">
                {falha.acao === 'tentarDeNovo'
                  ? 'Confira se o celular está conectado à internet e toque de novo na opção.'
                  : falha.texto}
              </Mensagem>
            ) : null}
          </View>
        )}
      </Folha>
    </Tela>
  );
}
