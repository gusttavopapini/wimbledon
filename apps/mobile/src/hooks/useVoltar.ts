import { router, type Href } from 'expo-router';
import { useCallback } from 'react';

/** Volta para a tela anterior; se a pessoa chegou direto pelo endereço, vai para o destino. */
export function useVoltar(destino: Href = '/') {
  return useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace(destino);
  }, [destino]);
}
