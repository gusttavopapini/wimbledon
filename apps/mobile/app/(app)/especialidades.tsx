import { router } from 'expo-router';
import { useState } from 'react';

import { CabecalhoTela } from '@/components/CabecalhoTela';
import { Campo } from '@/components/Campo';
import { CartaoEspecialidade, GradeEspecialidades } from '@/components/CartaoEspecialidade';
import { EstadoTela } from '@/components/EstadoTela';
import { Folha } from '@/components/Folha';
import { Tela } from '@/components/Tela';
import { useEspecialidades } from '@/hooks/useCadastros';
import { useVoltar } from '@/hooks/useVoltar';
import { contemTermo } from '@/utils/texto';

export default function Especialidades() {
  const voltar = useVoltar('/');
  const [busca, setBusca] = useState('');

  return (
    <Tela>
      <Folha semTopo>
        <CabecalhoTela titulo="Especialidades" aoVoltar={voltar} />
        <Campo
          tipo="busca"
          rotulo="Buscar especialidade"
          ajuda="Digite o nome ou o que você está sentindo. Exemplo: coração"
          valor={busca}
          aoMudar={setBusca}
        />
        <Lista busca={busca} aoLimpar={() => setBusca('')} />
      </Folha>
    </Tela>
  );
}

function Lista({ busca, aoLimpar }: { busca: string; aoLimpar: () => void }) {
  const voltar = useVoltar('/');
  const { data, isPending, isError, refetch } = useEspecialidades();

  if (isPending) return <EstadoTela tipo="carregando" titulo="Carregando as especialidades" />;
  if (isError) {
    return (
      <EstadoTela
        tipo="erro"
        titulo="Não conseguimos carregar as especialidades"
        mensagem="Confira se o celular está conectado à internet e toque em Tentar de novo."
        aoAgir={() => void refetch()}
      />
    );
  }
  if (data.length === 0) {
    return (
      <EstadoTela
        tipo="vazio"
        titulo="Ainda não há especialidades disponíveis"
        mensagem="Quando as unidades cadastrarem as especialidades, elas aparecem aqui."
        rotuloAcao="Voltar ao início"
        aoAgir={voltar}
      />
    );
  }

  // Busca no nome e nas palavras-chave ("coração" acha Cardiologia), sem acento.
  const encontradas = data.filter((e) => contemTermo(busca, [e.nome, ...e.palavrasChave]));
  if (encontradas.length === 0) {
    return (
      <EstadoTela
        tipo="vazio"
        icone="search"
        titulo="Nenhuma especialidade encontrada"
        mensagem={`Não achamos nada para "${busca.trim()}". Tente outra palavra ou limpe a busca para ver todas.`}
        rotuloAcao="Limpar a busca"
        aoAgir={aoLimpar}
      />
    );
  }

  return (
    <GradeEspecialidades>
      {encontradas.map((especialidade) => (
        <CartaoEspecialidade
          key={especialidade.id}
          especialidade={especialidade.id}
          nome={especialidade.nome}
          aoTocar={() => router.push(`/especialidades/${especialidade.id}/unidades`)}
        />
      ))}
    </GradeEspecialidades>
  );
}
