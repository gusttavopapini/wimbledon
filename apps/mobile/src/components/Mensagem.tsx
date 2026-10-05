import { useEffect, type ReactNode } from 'react';
import { AccessibilityInfo, StyleSheet, View } from 'react-native';

import { useTema } from '@/hooks/useTema';
import type { NomeCor } from '@/theme/tema';

import { Icone, type NomeIcone } from './Icone';
import { Texto } from './Texto';

type TipoMensagem = 'sucesso' | 'erro' | 'atencao' | 'informacao';

const MENSAGEM: Record<TipoMensagem, { icone: NomeIcone; cor: NomeCor }> = {
  sucesso: { icone: 'circle-check', cor: 'sucesso' },
  erro: { icone: 'circle-alert', cor: 'erro' },
  atencao: { icone: 'triangle-alert', cor: 'atencao' },
  informacao: { icone: 'info', cor: 'primaria' },
};

export interface MensagemProps {
  tipo: TipoMensagem;
  /** O que aconteceu, em poucas palavras. */
  titulo: string;
  /** O que fazer agora. */
  children?: string;
  /** Um Botao opcional. */
  acao?: ReactNode;
}

/**
 * Mensagem do design system. Fica na tela até a pessoa sair dela: nada de
 * toast. Erro é anunciado como alerta; os outros, como status.
 */
export function Mensagem({ tipo, titulo, children, acao }: MensagemProps) {
  const { cores, espacamento, raio, tamanho, letraGrande } = useTema();
  const def = MENSAGEM[tipo];

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(children ? `${titulo}. ${children}` : titulo);
  }, [titulo, children]);

  return (
    <View
      accessibilityRole={tipo === 'erro' ? 'alert' : 'summary'}
      accessibilityLiveRegion={tipo === 'erro' ? 'assertive' : 'polite'}
      style={[
        estilos.caixa,
        {
          gap: espacamento.espacamento12,
          padding: espacamento.espacamento16,
          borderRadius: raio.raioCartaoInterno,
          borderWidth: tamanho.espessuraBorda,
          borderColor: cores[def.cor],
          backgroundColor: cores.superficie,
        },
      ]}
    >
      <Icone
        nome={def.icone}
        cor={def.cor}
        tamanho={(letraGrande ? tamanho.tamanhoIconeNavegacao : tamanho.tamanhoIcone) + 4}
      />
      <View style={[estilos.corpo, { gap: espacamento.espacamento8 }]}>
        <Texto estilo="corpoForte" cor={def.cor}>
          {titulo}
        </Texto>
        {children ? <Texto estilo="corpo">{children}</Texto> : null}
        {acao ?? null}
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  caixa: { flexDirection: 'row', alignItems: 'flex-start' },
  corpo: { flex: 1, minWidth: 0, alignItems: 'stretch' },
});
