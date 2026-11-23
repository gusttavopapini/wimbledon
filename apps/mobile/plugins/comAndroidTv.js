// Config plugin do build da TV (APP_VARIANT=tv): faz o APK aparecer no
// launcher do Android TV / Google TV (TCL) e não exigir tela de toque.
// eslint-disable-next-line @typescript-eslint/no-require-imports -- config plugin do Expo é CommonJS
const { withAndroidManifest } = require('expo/config-plugins');

module.exports = function comAndroidTv(config) {
  return withAndroidManifest(config, (mod) => {
    const manifesto = mod.modResults.manifest;
    const recursos = manifesto['uses-feature'] ?? [];
    for (const nome of ['android.software.leanback', 'android.hardware.touchscreen']) {
      if (!recursos.some((r) => r.$['android:name'] === nome)) {
        recursos.push({ $: { 'android:name': nome, 'android:required': 'false' } });
      }
    }
    manifesto['uses-feature'] = recursos;

    const app = manifesto.application[0];
    app.$['android:banner'] = '@mipmap/ic_launcher';
    const principal = app.activity.find((a) => a.$['android:name'] === '.MainActivity');
    const filtro = principal?.['intent-filter']?.find((f) =>
      (f.action ?? []).some((a) => a.$['android:name'] === 'android.intent.action.MAIN'),
    );
    if (filtro) {
      filtro.category = filtro.category ?? [];
      if (
        !filtro.category.some(
          (c) => c.$['android:name'] === 'android.intent.category.LEANBACK_LAUNCHER',
        )
      ) {
        filtro.category.push({
          $: { 'android:name': 'android.intent.category.LEANBACK_LAUNCHER' },
        });
      }
    }
    return mod;
  });
};
