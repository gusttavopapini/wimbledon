import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Um só projeto, dois aplicativos:
 * - padrão: o app de celular (paciente e equipe) e o PWA;
 * - APP_VARIANT=tv: o painel da sala de espera para Android TV (EXPO_PUBLIC_MODO=tv).
 * Os perfis do eas.json escolhem a variante.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const tv = process.env.APP_VARIANT === 'tv';
  const base = config as ExpoConfig;
  if (!tv) return base;
  return {
    ...base,
    name: 'Painel Saúde na Palma',
    slug: base.slug,
    orientation: 'landscape',
    android: { ...base.android, package: 'br.senac.saudenapalma.tv' },
    plugins: [...(base.plugins ?? []), './plugins/comAndroidTv.js'],
  };
};
