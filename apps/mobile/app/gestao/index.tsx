import { useState } from 'react';

import { EstadoTela } from '@/components/EstadoTela';
import { Folha } from '@/components/Folha';
import { Opcoes } from '@/components/Pecas';
import { Tela } from '@/components/Tela';
import { useUnidade, useUnidades } from '@/hooks/useCadastros';
import { useSessao } from '@/hooks/useSessao';
import { TopoEquipe } from '@/telas/comum';
import { AgendaMedicos, Cadastros, Consultorios, Equipe, PainelDoDia, Tvs } from '@/telas/gestao';

type Aba = 'hoje' | 'equipe' | 'agenda' | 'consultorios' | 'tvs' | 'cadastros';

/**
 * Manutenção: tudo da PRÓPRIA unidade (RN19). Administrativo: escolhe a
 * unidade e ainda cadastra especialidades e médicos (RN24).
 */
export default function Gestao() {
  const { usuario } = useSessao();
  const admin = usuario?.perfil === 'administrativo';
  const unidades = useUnidades();
  const [escolhida, setEscolhida] = useState<string | null>(null);
  const unidadeId = admin
    ? (escolhida ?? unidades.data?.[0]?.id ?? '')
    : (usuario?.unidadeId ?? '');
  const unidade = useUnidade(unidadeId);
  const [aba, setAba] = useState<Aba>('hoje');

  const abas: { valor: Aba; rotulo: string }[] = [
    { valor: 'hoje', rotulo: 'Hoje' },
    { valor: 'equipe', rotulo: 'Equipe' },
    { valor: 'agenda', rotulo: 'Agenda' },
    { valor: 'consultorios', rotulo: 'Consultórios' },
    { valor: 'tvs', rotulo: 'TVs' },
    ...(admin ? [{ valor: 'cadastros' as const, rotulo: 'Cadastros' }] : []),
  ];

  return (
    <Tela>
      <TopoEquipe titulo={admin ? 'Administração' : 'Manutenção'} subtitulo={unidade.data?.nome} />
      <Folha>
        {admin ? (
          <Opcoes
            rotulo="Unidade"
            valor={unidadeId || null}
            aoMudar={setEscolhida}
            opcoes={(unidades.data ?? []).map((u) => ({ valor: u.id, rotulo: u.nome }))}
          />
        ) : null}
        <Opcoes valor={aba} aoMudar={setAba} opcoes={abas} />
        {!unidadeId && aba !== 'cadastros' ? (
          <EstadoTela tipo="vazio" titulo="Nenhuma unidade cadastrada ainda" />
        ) : (
          <>
            {aba === 'hoje' ? <PainelDoDia key={unidadeId} unidadeId={unidadeId} /> : null}
            {aba === 'equipe' ? <Equipe key={unidadeId} unidadeId={unidadeId} /> : null}
            {aba === 'agenda' ? <AgendaMedicos key={unidadeId} unidadeId={unidadeId} /> : null}
            {aba === 'consultorios' ? <Consultorios key={unidadeId} unidadeId={unidadeId} /> : null}
            {aba === 'tvs' ? <Tvs key={unidadeId} unidadeId={unidadeId} /> : null}
          </>
        )}
        {aba === 'cadastros' && admin ? <Cadastros /> : null}
      </Folha>
    </Tela>
  );
}
