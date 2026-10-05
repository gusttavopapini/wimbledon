import { useState } from 'react';

import { Botao } from '@/components/Botao';
import { Folha } from '@/components/Folha';
import { Mensagem } from '@/components/Mensagem';
import { Tela } from '@/components/Tela';
import { Topo } from '@/components/Topo';
import { useSessao } from '@/hooks/useSessao';

/** Início provisório: as funções (consultas, fila, pré-triagem) chegam nas próximas entregas. */
export default function Inicio() {
  const { usuario, sair } = useSessao();
  const [saindo, setSaindo] = useState(false);
  const primeiroNome = usuario?.nome.split(' ')[0] ?? '';

  return (
    <Tela>
      <Topo titulo={`Olá, ${primeiroNome}!`} subtitulo="Que bom ter você aqui." />
      <Folha>
        <Mensagem tipo="informacao" titulo="Sua conta está pronta">
          Em breve você vai poder marcar consultas e acompanhar a fila por aqui.
        </Mensagem>
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
