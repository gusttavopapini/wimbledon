import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

/** true quando o sistema pede menos movimento: o indicador de carregamento para. */
export function useReduzirMovimento(): boolean {
  const [reduzir, setReduzir] = useState(false);
  useEffect(() => {
    let ativo = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((valor) => {
      if (ativo) setReduzir(valor);
    });
    const inscricao = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduzir);
    return () => {
      ativo = false;
      inscricao.remove();
    };
  }, []);
  return reduzir;
}
