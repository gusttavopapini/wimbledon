import { createContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';

import { montarTema, type PreferenciasVisuais, type Tema } from './tema';

interface ValorTema extends Tema {
  definirPreferencias: (mudanca: Partial<PreferenciasVisuais>) => void;
}

export const ContextoTema = createContext<ValorTema | null>(null);

/**
 * Guarda as preferências visuais (alto contraste e letra grande). Liga o alto
 * contraste sozinho quando o Android pede texto de alto contraste; o ajuste do
 * app sempre pode sobrescrever.
 */
export function TemaProvider({ children }: { children: ReactNode }) {
  const [preferencias, setPreferencias] = useState<PreferenciasVisuais>({
    altoContraste: false,
    letraGrande: false,
  });

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    let ativo = true;
    void AccessibilityInfo.isHighTextContrastEnabled().then((ligado) => {
      if (ativo && ligado) setPreferencias((atual) => ({ ...atual, altoContraste: true }));
    });
    const inscricao = AccessibilityInfo.addEventListener('highTextContrastChanged', (ligado) =>
      setPreferencias((atual) => ({ ...atual, altoContraste: ligado })),
    );
    return () => {
      ativo = false;
      inscricao.remove();
    };
  }, []);

  const valor = useMemo<ValorTema>(
    () => ({
      ...montarTema(preferencias),
      definirPreferencias: (mudanca) => setPreferencias((atual) => ({ ...atual, ...mudanca })),
    }),
    [preferencias],
  );

  return <ContextoTema.Provider value={valor}>{children}</ContextoTema.Provider>;
}
