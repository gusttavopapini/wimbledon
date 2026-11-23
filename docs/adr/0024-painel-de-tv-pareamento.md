# ADR 0024 — Painel de TV: APK Android TV + PWA, pareados por código

- **Status:** aceita
- **Data:** 2026-11-22
- **Resolve:** P12 (APK de Android TV ou PWA em quiosque)

## Contexto

A unidade tem uma TV TCL com Android TV. Digitar um token longo com o
controle remoto é inviável, e o painel não pode usar login de pessoa (RN25).

## Decisão

- **As duas formas existem**, do mesmo código Expo: o APK da TV
  (`eas build --profile tv`, `APP_VARIANT=tv`, aparece no launcher do Android TV
  pelo plugin `plugins/comAndroidTv.js`) e o PWA em `/painel` para qualquer
  navegador em tela cheia.
- **Pareamento por código:** a TV pede `POST /painel/pareamentos` e mostra 6
  números. A manutenção (ou o administrativo) digita o código no app
  (`POST /unidades/{id}/paineis`). A TV, que consulta a cada 3 s, recebe o token
  de dispositivo **uma vez**. O banco guarda só o SHA-256 do token.
- Desligar a TV no app (`DELETE /paineis/{id}`) invalida o token na hora: a TV
  volta a mostrar um código.
- RN26: o nome que vai à TV é calculado no agendamento (nome completo só com
  consentimento; senão, primeiro nome + inicial).

## Consequências

- Nenhuma credencial digitada na TV; o código vale 10 minutos.
- Se o áudio falhar (autoplay do navegador, TV sem voz em português), a
  chamada continua na tela. No PWA, um toque libera o som.
