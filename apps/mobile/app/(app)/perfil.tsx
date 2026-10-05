import { useState } from 'react';
import { View } from 'react-native';

import type { Usuario } from '@/api/auth';
import { Avatar } from '@/components/Avatar';
import { Botao } from '@/components/Botao';
import { CabecalhoTela } from '@/components/CabecalhoTela';
import { Cartao } from '@/components/Cartao';
import { EstadoTela } from '@/components/EstadoTela';
import { Folha } from '@/components/Folha';
import { Tela } from '@/components/Tela';
import { Texto } from '@/components/Texto';
import { useMe } from '@/hooks/useMe';
import { useSessao } from '@/hooks/useSessao';
import { useTema } from '@/hooks/useTema';
import { dataIsoPorExtenso, mascararCpf, telefoneLegivel } from '@/utils/mascaras';

export default function Perfil() {
  const { sair } = useSessao();
  const { espacamento } = useTema();
  const { data, isPending, isError, refetch } = useMe();
  const [saindo, setSaindo] = useState(false);

  return (
    <Tela>
      <Folha semTopo>
        <CabecalhoTela titulo="Meu perfil" aoVoltar={null} />
        {isPending ? (
          <EstadoTela tipo="carregando" titulo="Carregando seus dados" />
        ) : isError ? (
          <EstadoTela
            tipo="erro"
            titulo="Não conseguimos carregar seus dados"
            mensagem="Confira se o celular está conectado à internet e toque em Tentar de novo. Seus dados continuam guardados."
            aoAgir={() => void refetch()}
          />
        ) : (
          <View style={{ gap: espacamento.espacamento24 }}>
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: espacamento.espacamento16 }}
            >
              <Avatar nome={data.usuario.nome} tamanho={96} />
              <Texto estilo="tituloSecao" style={{ flex: 1 }}>
                {data.usuario.nome}
              </Texto>
            </View>
            <Dados usuario={data.usuario} />
          </View>
        )}
        <Botao
          variante="secundario"
          larguraTotal
          icone="log-out"
          carregando={saindo}
          rotuloCarregando="Saindo da conta…"
          aoTocar={() => {
            setSaindo(true);
            void sair();
          }}
        >
          Sair da conta
        </Botao>
      </Folha>
    </Tela>
  );
}

function Dados({ usuario }: { usuario: Usuario }) {
  const linhas: [string, string][] = [
    ['E-mail', usuario.email],
    ['CPF', mascararCpf(usuario.cpf)],
  ];
  if (usuario.telefone) linhas.push(['Telefone', telefoneLegivel(usuario.telefone)]);
  const nascimento = usuario.dataNascimento ? dataIsoPorExtenso(usuario.dataNascimento) : null;
  if (nascimento) linhas.push(['Data de nascimento', nascimento]);
  linhas.push([
    'Painel da recepção',
    usuario.consentimento.exibicaoPainel
      ? 'Seu nome completo pode aparecer e ser falado no painel quando chegar a sua vez.'
      : 'O painel mostra só o seu primeiro nome e a primeira letra do sobrenome.',
  ]);

  return (
    <Cartao variante="interno" titulo="Seus dados">
      {linhas.map(([rotulo, valor]) => (
        <View
          key={rotulo}
          accessible
          accessibilityLabel={`${rotulo}: ${valor}`}
          style={{ gap: 2, marginBottom: 8 }}
        >
          <Texto estilo="rotulo" cor="primariaEscura">
            {rotulo}
          </Texto>
          <Texto>{valor}</Texto>
        </View>
      ))}
    </Cartao>
  );
}
