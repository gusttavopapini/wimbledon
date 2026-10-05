import { router } from 'expo-router';

import { CabecalhoTela } from '@/components/CabecalhoTela';
import { EstadoTela } from '@/components/EstadoTela';
import { Folha } from '@/components/Folha';
import { Tela } from '@/components/Tela';

/**
 * Ainda não há agendamento (RF12): por enquanto, sempre o estado vazio, que
 * leva ao começo do fluxo de marcar consulta.
 */
export default function Consultas() {
  return (
    <Tela>
      <Folha semTopo>
        <CabecalhoTela titulo="Minhas consultas" aoVoltar={null} />
        <EstadoTela
          tipo="vazio"
          titulo="Você ainda não tem consultas marcadas"
          rotuloAcao="Marcar consulta"
          aoAgir={() => router.push('/especialidades')}
        />
      </Folha>
    </Tela>
  );
}
