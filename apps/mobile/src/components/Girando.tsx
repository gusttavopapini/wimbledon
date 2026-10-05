import { useEffect, useState } from 'react';
import { Animated, Easing } from 'react-native';

import { useReduzirMovimento } from '@/hooks/useReduzirMovimento';
import type { NomeCor } from '@/theme/tema';

import { Icone } from './Icone';

/** O único movimento do app: para quando o sistema pede menos movimento. */
export function Girando({ cor }: { cor: NomeCor }) {
  const reduzir = useReduzirMovimento();
  const [giro] = useState(() => new Animated.Value(0));
  const [rotate] = useState(() =>
    giro.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }),
  );

  useEffect(() => {
    if (reduzir) return;
    const animacao = Animated.loop(
      Animated.timing(giro, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    animacao.start();
    return () => animacao.stop();
  }, [giro, reduzir]);

  return (
    <Animated.View style={reduzir ? undefined : { transform: [{ rotate }] }}>
      <Icone nome="loader-circle" cor={cor} />
    </Animated.View>
  );
}
