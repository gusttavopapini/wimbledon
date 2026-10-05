import { Platform } from 'react-native';

/**
 * O anel de foco (sombraFoco) é para quem navega por teclado ou controle remoto,
 * como o :focus-visible do CSS. Na web, um clique também foca o botão: aqui se
 * guarda se a última interação foi de teclado. No Android/iOS, botão só recebe
 * foco por teclado físico ou controle, então vale sempre.
 */
let ultimaFoiTeclado = Platform.OS !== 'web';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.addEventListener(
    'keydown',
    (evento) => {
      if (!evento.metaKey && !evento.altKey && !evento.ctrlKey) ultimaFoiTeclado = true;
    },
    true,
  );
  document.addEventListener(
    'pointerdown',
    () => {
      ultimaFoiTeclado = false;
    },
    true,
  );
}

export function focoVeioDoTeclado(): boolean {
  return ultimaFoiTeclado;
}
