/* @ds-bundle: {"format":4,"namespace":"SaudeNaPalma","components":[{"name":"Botao"},{"name":"Campo"},{"name":"Chip"},{"name":"Cartao"},{"name":"CartaoEspecialidade"},{"name":"CartaoProfissional"},{"name":"Avatar"},{"name":"Topo"},{"name":"CabecalhoTela"},{"name":"NavegacaoInferior"},{"name":"SeloStatus"},{"name":"SeloUrgencia"},{"name":"ListaFila"},{"name":"BannerEmergencia"},{"name":"AvisoIA"},{"name":"Mensagem"},{"name":"EstadoTela"},{"name":"DialogoConfirmacao"},{"name":"PainelTV"},{"name":"Icone"},{"name":"IconeEspecialidade"}]} */
/* Saúde na Palma da Mão — implementação de referência (web / react-native-web) dos componentes.
   Ícones de interface: Lucide, licença ISC, © Lucide Icons and Contributors.
   Ícones de especialidade sem equivalente no Lucide: desenho próprio. */
(function () {
  'use strict';
  var React = window.React;
  var h = React.createElement;
  var useState = React.useState, useEffect = React.useEffect, useRef = React.useRef, useId = React.useId;

  var ICONES = {"arrow-left": "<path d=\"m12 19-7-7 7-7\"/><path d=\"M19 12H5\"/>", "chevron-right": "<path d=\"m9 18 6-6-6-6\"/>", "calendar": "<path d=\"M8 2v3\"/><path d=\"M16 2v3\"/><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 9h18\"/>", "calendar-check": "<path d=\"M8 2v3\"/><path d=\"M16 2v3\"/><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 9h18\"/><path d=\"m9 15 2 2 4-4\"/>", "calendar-x": "<path d=\"M8 2v3\"/><path d=\"M16 2v3\"/><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M3 9h18\"/><path d=\"m14 13-4 4\"/><path d=\"m10 13 4 4\"/>", "calendar-plus": "<path d=\"M16 18h6\"/><path d=\"M16 2v3\"/><path d=\"M19 15v6\"/><path d=\"M21 11.5V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h8.3\"/><path d=\"M3 9h18\"/><path d=\"M8 2v3\"/>", "clock": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 6v6l4 2\"/>", "hourglass": "<path d=\"M5 22h14\"/><path d=\"M5 2h14\"/><path d=\"M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22\"/><path d=\"M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2\"/>", "megaphone": "<path d=\"M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z\"/><path d=\"M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14\"/><path d=\"M8 6v8\"/>", "stethoscope": "<path d=\"M11 2v2\"/><path d=\"M5 2v2\"/><path d=\"M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1\"/><path d=\"M8 15a6 6 0 0 0 12 0v-3\"/><circle cx=\"20\" cy=\"10\" r=\"2\"/>", "check": "<path d=\"M20 6 9 17l-5-5\"/>", "circle-check": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m16 9-5.5 5.5L8 12\"/>", "circle-x": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m15 9-6 6\"/><path d=\"m9 9 6 6\"/>", "user-x": "<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><line x1=\"17\" x2=\"22\" y1=\"8\" y2=\"13\"/><line x1=\"22\" x2=\"17\" y1=\"8\" y2=\"13\"/>", "siren": "<path d=\"M7 18v-6a5 5 0 1 1 10 0v6\"/><path d=\"M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2z\"/><path d=\"M21 12h1\"/><path d=\"M18.5 4.5 18 5\"/><path d=\"M2 12h1\"/><path d=\"M12 2v1\"/><path d=\"m4.929 4.929.707.707\"/><path d=\"M12 12v6\"/>", "triangle-alert": "<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"/><path d=\"M12 9v4\"/><path d=\"M12 17h.01\"/>", "circle-alert": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><line x1=\"12\" x2=\"12\" y1=\"8\" y2=\"12\"/><line x1=\"12\" x2=\"12.01\" y1=\"16\" y2=\"16\"/>", "phone": "<path d=\"M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384\"/>", "house": "<path d=\"M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8\"/><path d=\"M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z\"/>", "user-round": "<circle cx=\"12\" cy=\"8\" r=\"5\"/><path d=\"M20 21a8 8 0 0 0-16 0\"/>", "settings": "<path d=\"M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", "search": "<path d=\"m21 21-4.34-4.34\"/><circle cx=\"11\" cy=\"11\" r=\"8\"/>", "eye": "<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", "eye-off": "<path d=\"M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49\"/><path d=\"M14.084 14.158a3 3 0 0 1-4.242-4.242\"/><path d=\"M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143\"/><path d=\"m2 2 20 20\"/>", "lock": "<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/>", "mail": "<path d=\"m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7\"/><rect x=\"2\" y=\"4\" width=\"20\" height=\"16\" rx=\"2\"/>", "info": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"M12 16v-4\"/><path d=\"M12 8h.01\"/>", "loader-circle": "<path d=\"M21 12a9 9 0 1 1-6.219-8.56\"/>", "refresh-cw": "<path d=\"M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8\"/><path d=\"M21 3v5h-5\"/><path d=\"M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16\"/><path d=\"M8 16H3v5\"/>", "x": "<path d=\"M18 6 6 18\"/><path d=\"m6 6 12 12\"/>", "map-pin": "<path d=\"M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/>", "bell": "<path d=\"M10.268 21a2 2 0 0 0 3.464 0\"/><path d=\"M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326\"/>", "chevrons-up": "<path d=\"m17 11-5-5-5 5\"/><path d=\"m17 18-5-5-5 5\"/>", "circle-dot": "<circle cx=\"12\" cy=\"12\" r=\"1\"/><circle cx=\"12\" cy=\"12\" r=\"10\"/>", "wifi-off": "<path d=\"M12 20h.01\"/><path d=\"M8.5 16.429a5 5 0 0 1 7 0\"/><path d=\"M5 12.859a10 10 0 0 1 5.17-2.69\"/><path d=\"M19 12.859a10 10 0 0 0-2.007-1.523\"/><path d=\"M2 8.82a15 15 0 0 1 4.177-2.643\"/><path d=\"M22 8.82a15 15 0 0 0-11.288-3.764\"/><path d=\"m2 2 20 20\"/>", "message-circle": "<path d=\"M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719\"/>", "door-open": "<path d=\"M10 21H2\"/><path d=\"M10 3H7a2 2 0 00-2 2v16\"/><path d=\"M14 12h.01\"/><path d=\"M19 21V5a2 2 0 00-1.675-1.974l-6.163-1.013A1 1 0 0010 3v18a1 1 0 001.124.992z\"/><path d=\"M22 21h-3\"/>", "list-ordered": "<path d=\"M11 5h10\"/><path d=\"M11 12h10\"/><path d=\"M11 19h10\"/><path d=\"M4 4h1v5\"/><path d=\"M4 9h2\"/><path d=\"M6.5 20H3.4c0-1 2.6-1.925 2.6-3.5a1.5 1.5 0 0 0-2.6-1.02\"/>", "tv": "<path d=\"m17 2-5 5-5-5\"/><rect width=\"20\" height=\"15\" x=\"2\" y=\"7\" rx=\"2\"/>", "hospital": "<path d=\"M12 7v4\"/><path d=\"M14 21v-3a2 2 0 0 0-4 0v3\"/><path d=\"M14 9h-4\"/><path d=\"M18 11h2a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2h2\"/><path d=\"M18 21V5a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16\"/>", "log-in": "<path d=\"m10 17 5-5-5-5\"/><path d=\"M15 12H3\"/><path d=\"M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4\"/>", "clipboard-list": "<rect width=\"8\" height=\"4\" x=\"8\" y=\"2\" rx=\"1\" ry=\"1\"/><path d=\"M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2\"/><path d=\"M12 11h4\"/><path d=\"M12 16h4\"/><path d=\"M8 11h.01\"/><path d=\"M8 16h.01\"/>"};
  var ICONES_ESPECIALIDADE = {"cardiologia": "<path d=\"M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5\"/><path d=\"M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27\"/>", "clinicoGeral": "<path d=\"M11 2v2\"/><path d=\"M5 2v2\"/><path d=\"M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1\"/><path d=\"M8 15a6 6 0 0 0 12 0v-3\"/><circle cx=\"20\" cy=\"10\" r=\"2\"/>", "gastroenterologia": "<path d=\"M13.5 2v3c1-1.2 2.8-1.7 4.6-1.1 3 1 3.6 5.6 1.6 9.6-2 4-6.6 6.9-11.2 5.5H4\"/><path d=\"M10.5 2v5c0 3.6-1.2 6.6-3.6 7.6H4\"/>", "neurologia": "<path d=\"M12 18V5\"/><path d=\"M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4\"/><path d=\"M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5\"/><path d=\"M17.997 5.125a4 4 0 0 1 2.526 5.77\"/><path d=\"M18 18a4 4 0 0 0 2-7.464\"/><path d=\"M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517\"/><path d=\"M6 18a4 4 0 0 1-2-7.464\"/><path d=\"M6.003 5.125a4 4 0 0 0-2.526 5.77\"/>", "ortopedia": "<path d=\"M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z\"/>", "ginecologia": "<path d=\"M8 8c0-1 1-1.5 4-1.5s4 .5 4 1.5c0 3.5-1.5 5.5-2.8 6.5v4c0 .8-.6 1.5-1.2 1.5s-1.2-.7-1.2-1.5v-4C9.5 13.5 8 11.5 8 8z\"/><path d=\"M8.2 8.2C7 6.8 5 6.2 4 7.2c-.7.7-.6 1.8 0 2.4\"/><path d=\"M15.8 8.2C17 6.8 19 6.2 20 7.2c.7.7.6 1.8 0 2.4\"/><circle cx=\"5.2\" cy=\"11.4\" r=\"1.6\"/><circle cx=\"18.8\" cy=\"11.4\" r=\"1.6\"/>", "dermatologia": "<path d=\"M3 10v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V10\"/><path d=\"M3 10c2-1.3 4-1.3 6 0s4 1.3 6 0 4-1.3 6 0\"/><path d=\"M3 15.5h7\"/><path d=\"M16 15.5h5\"/><circle cx=\"13\" cy=\"17\" r=\"1.5\"/><path d=\"M13 15.5V9c0-2.5 1.5-4.5 3.5-5.5\"/>", "imunologia": "<path d=\"M12 14.991h.01\"/><path d=\"M12 22v-3\"/><path d=\"M12 2v3\"/><path d=\"M13 22h-2\"/><path d=\"M13 2h-2\"/><path d=\"M13.99 10H14\"/><path d=\"m16.5 19.794-1-1.733\"/><path d=\"m16.5 4.205-1 1.732\"/><path d=\"m19.794 16.5-1.732-1\"/><path d=\"m19.794 7.5-1.732 1\"/><path d=\"M2 12h3\"/><path d=\"M2 13v-2\"/><path d=\"M22 12h-3\"/><path d=\"M22 13v-2\"/><path d=\"m4.206 16.5 1.732-1\"/><path d=\"m4.206 7.5 1.732 1\"/><path d=\"m7.5 19.794 1-1.733\"/><path d=\"m7.5 4.205 1 1.732\"/><path d=\"M9 12h.01\"/><circle cx=\"12\" cy=\"12\" r=\"7\"/>", "obstetricia": "<circle cx=\"10.5\" cy=\"4\" r=\"2.2\"/><path d=\"M9.5 7.6C8.2 9.6 8 12.6 8.7 15.2L8.2 21\"/><path d=\"M11.6 7.6c.7 1.1 1 2.2 1.2 3.2 4 .8 5 5.2 2.4 7.3-1.1.9-2.5 1.2-3.8 1.2l.4 1.7\"/>", "pediatria": "<path d=\"M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5\"/><path d=\"M15 12h.01\"/><path d=\"M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1\"/><path d=\"M9 12h.01\"/>", "oftalmologia": "<path d=\"M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0\"/><circle cx=\"12\" cy=\"12\" r=\"3\"/>", "otorrinolaringologia": "<path d=\"M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0\"/><path d=\"M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4\"/>", "pneumologia": "<path d=\"M12 2v9\"/><path d=\"M12 11l-2.5 2\"/><path d=\"M12 11l2.5 2\"/><path d=\"M9.5 8c0-1.2-.8-1.9-1.7-1.5C5 7.8 3 12.2 3 17c0 2.5 1.2 4 3 4 2 0 3.5-1.5 3.5-3.5z\"/><path d=\"M14.5 8c0-1.2.8-1.9 1.7-1.5C19 7.8 21 12.2 21 17c0 2.5-1.2 4-3 4-2 0-3.5-1.5-3.5-3.5z\"/>"};
  var ESPECIALIDADES = [{"id": "cardiologia", "nome": "Cardiologia"}, {"id": "clinicoGeral", "nome": "Clínico geral"}, {"id": "gastroenterologia", "nome": "Gastroenterologia"}, {"id": "neurologia", "nome": "Neurologia"}, {"id": "ortopedia", "nome": "Ortopedia"}, {"id": "ginecologia", "nome": "Ginecologia"}, {"id": "dermatologia", "nome": "Dermatologia"}, {"id": "imunologia", "nome": "Imunologia"}, {"id": "obstetricia", "nome": "Obstetrícia"}, {"id": "pediatria", "nome": "Pediatria"}, {"id": "oftalmologia", "nome": "Oftalmologia"}, {"id": "otorrinolaringologia", "nome": "Otorrinolaringologia"}, {"id": "pneumologia", "nome": "Pneumologia"}];

  function cx() {
    var out = [];
    for (var i = 0; i < arguments.length; i++) if (arguments[i]) out.push(arguments[i]);
    return out.join(' ');
  }
  function omit(obj, keys) {
    var o = {};
    for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k) && keys.indexOf(k) < 0) o[k] = obj[k];
    return o;
  }

  /* ---------- utilitários de texto ---------- */
  var DIAS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  var MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  /** "9h30", "14h", "meio-dia", "meia-noite" */
  function formatarHora(d) {
    var hh = d.getHours(), mm = d.getMinutes();
    if (mm === 0 && hh === 12) return 'meio-dia';
    if (mm === 0 && hh === 0) return 'meia-noite';
    return hh + 'h' + (mm ? String(mm).padStart(2, '0') : '');
  }
  function preposicaoHora(d) {
    var hh = d.getHours(), mm = d.getMinutes();
    if (mm === 0 && hh === 12) return 'ao';
    if (mm === 0 && hh === 0) return 'à';
    return hh === 1 ? 'à' : 'às';
  }
  /** "terça-feira, 13 de outubro, às 9h30" — opcoes: { ano: bool, hora: bool, maiuscula: bool } */
  function formatarDataPorExtenso(d, opcoes) {
    var o = opcoes || {};
    var s = DIAS[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()];
    if (o.ano) s += ' de ' + d.getFullYear();
    if (o.hora) s += ', ' + preposicaoHora(d) + ' ' + formatarHora(d);
    if (o.maiuscula) s = s.charAt(0).toUpperCase() + s.slice(1);
    return s;
  }
  function soDigitos(v) { return String(v || '').replace(/\D/g, ''); }
  /** 12345678909 → 123.456.789-09 (aceita parcial) */
  function mascararCPF(v) {
    var d = soDigitos(v).slice(0, 11), out = '';
    for (var i = 0; i < d.length; i++) {
      if (i === 3 || i === 6) out += '.';
      if (i === 9) out += '-';
      out += d[i];
    }
    return out;
  }
  /** 12031948 → 12/03/1948 (aceita parcial) */
  function mascararData(v) {
    var d = soDigitos(v).slice(0, 8), out = '';
    for (var i = 0; i < d.length; i++) {
      if (i === 2 || i === 4) out += '/';
      out += d[i];
    }
    return out;
  }
  /** "12/03/1948" → Date ou null */
  function lerData(texto) {
    var m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(texto || '');
    if (!m) return null;
    var dia = +m[1], mes = +m[2] - 1, ano = +m[3];
    var d = new Date(ano, mes, dia);
    if (d.getFullYear() !== ano || d.getMonth() !== mes || d.getDate() !== dia) return null;
    return d;
  }
  function cpfValido(v) {
    var d = soDigitos(v);
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
    for (var t = 9; t < 11; t++) {
      var s = 0;
      for (var i = 0; i < t; i++) s += +d[i] * (t + 1 - i);
      var r = (s * 10) % 11 % 10;
      if (r !== +d[t]) return false;
    }
    return true;
  }
  /** razão de contraste WCAG 2 entre duas cores (#rgb, #rrggbb ou rgb()) */
  function paraRGB(c) {
    c = String(c).trim();
    var m = /^rgba?\(([^)]+)\)$/.exec(c);
    if (m) { var p = m[1].split(/[ ,/]+/).filter(Boolean).map(parseFloat); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; }
    c = c.replace('#', '');
    if (c.length === 3 || c.length === 4) c = c.split('').map(function (x) { return x + x; }).join('');
    return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16), c.length === 8 ? parseInt(c.slice(6, 8), 16) / 255 : 1];
  }
  function compor(fg, bg) {
    var a = fg[3];
    return [fg[0] * a + bg[0] * (1 - a), fg[1] * a + bg[1] * (1 - a), fg[2] * a + bg[2] * (1 - a), 1];
  }
  function luminancia(rgb) {
    var v = rgb.slice(0, 3).map(function (x) { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); });
    return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  }
  function razaoContraste(a, b) {
    var bg = paraRGB(b), fg = paraRGB(a);
    if (fg[3] < 1) fg = compor(fg, bg);
    var la = luminancia(fg), lb = luminancia(bg);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  }

  /* ---------- Ícones ---------- */
  function Icone(props) {
    var tamanho = props.tamanho || 24;
    var markup = ICONES[props.nome] || ICONES_ESPECIALIDADE[props.nome] || '';
    var rotulo = props.rotulo;
    return h('svg', {
      className: cx('sp-icone', props.className),
      width: tamanho, height: tamanho, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
      strokeWidth: props.espessura || 2, strokeLinecap: 'round', strokeLinejoin: 'round', focusable: 'false',
      role: rotulo ? 'img' : undefined, 'aria-label': rotulo || undefined, 'aria-hidden': rotulo ? undefined : 'true',
      dangerouslySetInnerHTML: { __html: markup }
    });
  }
  function IconeEspecialidade(props) {
    return h(Icone, { nome: props.especialidade, tamanho: props.tamanho || 48, rotulo: props.rotulo, className: props.className });
  }

  /* ---------- Botão ---------- */
  function Botao(props) {
    var variante = props.variante || 'primario';
    var principal = !!props.principal;
    var carregando = !!props.carregando;
    var desabilitado = !!props.desabilitado;
    var demo = props.demonstrarEstado;
    var rest = omit(props, ['variante', 'principal', 'larguraTotal', 'carregando', 'desabilitado', 'icone', 'iconeFim', 'rotuloCarregando', 'demonstrarEstado', 'children', 'className', 'href', 'aoTocar']);
    var cls = cx('sp-botao', 'sp-botao--' + variante, principal && 'sp-botao--principal', props.larguraTotal && 'sp-botao--largura-total',
      carregando && 'is-carregando', demo === 'pressionado' && 'is-pressionado', demo === 'foco' && 'is-foco', props.className);
    var conteudo = carregando
      ? [h(Icone, { key: 'i', nome: 'loader-circle', className: 'sp-girando' }), h('span', { key: 't' }, props.rotuloCarregando || 'Aguarde…')]
      : [props.icone ? h(Icone, { key: 'i', nome: props.icone }) : null, h('span', { key: 't' }, props.children), props.iconeFim ? h(Icone, { key: 'f', nome: props.iconeFim }) : null];
    var comum = Object.assign(rest, {
      className: cls,
      'aria-busy': carregando || undefined,
      'aria-disabled': (desabilitado || carregando) || undefined,
      onClick: function (e) { if (desabilitado || carregando) { e.preventDefault(); return; } if (props.aoTocar) props.aoTocar(e); if (props.onClick) props.onClick(e); }
    });
    if (props.href && !desabilitado) return h('a', Object.assign(comum, { href: props.href }), conteudo);
    return h('button', Object.assign(comum, { type: props.type || 'button', disabled: desabilitado || undefined }), conteudo);
  }

  /* ---------- Campo ---------- */
  function Campo(props) {
    var tipo = props.tipo || 'texto';
    var autoId = useId();
    var id = props.id || ('campo' + autoId.replace(/:/g, ''));
    function mascarar(v) { return tipo === 'cpf' ? mascararCPF(v) : tipo === 'data' ? mascararData(v) : v; }
    var interno = useState(function () { return mascarar(props.valorInicial || ''); });
    var controlado = props.valor !== undefined;
    var valor = controlado ? props.valor : interno[0];
    var revelar = useState(false);
    var demo = props.demonstrarEstado;
    function mudar(v) {
      v = mascarar(v);
      if (!controlado) interno[1](v);
      if (props.aoMudar) props.aoMudar(v);
    }
    var idAjuda = props.ajuda ? id + '-ajuda' : null;
    var idErro = props.erro ? id + '-erro' : null;
    var data = tipo === 'data' ? lerData(valor) : null;
    var idExtenso = data ? id + '-extenso' : null;
    var tipoInput = tipo === 'senha' ? (revelar[0] ? 'text' : 'password') : tipo === 'busca' ? 'search' : (props.tipoHtml || 'text');
    var modoTeclado = (tipo === 'cpf' || tipo === 'data') ? 'numeric' : props.inputMode;
    var rest = omit(props, ['tipo', 'rotulo', 'ajuda', 'erro', 'valor', 'valorInicial', 'aoMudar', 'desabilitado', 'demonstrarEstado', 'tipoHtml', 'className', 'id', 'inputMode', 'obrigatorio']);
    var acao = null;
    if (tipo === 'senha') {
      acao = h('button', {
        type: 'button', className: 'sp-campo-acao', 'aria-pressed': revelar[0], 'aria-controls': id, disabled: props.desabilitado || undefined,
        onClick: function () { revelar[1](!revelar[0]); }
      }, h(Icone, { nome: revelar[0] ? 'eye-off' : 'eye' }), h('span', null, revelar[0] ? 'Ocultar' : 'Mostrar'));
    } else if (tipo === 'busca' && valor) {
      acao = h('button', { type: 'button', className: 'sp-campo-acao', onClick: function () { mudar(''); }, 'aria-label': 'Limpar busca' },
        h(Icone, { nome: 'x' }), h('span', { 'aria-hidden': 'true' }, 'Limpar'));
    }
    return h('div', { className: cx('sp-campo', props.erro && 'sp-campo--erro', props.desabilitado && 'sp-campo--desabilitado', props.className), role: tipo === 'busca' ? 'search' : undefined },
      h('label', { className: 'sp-campo-rotulo', htmlFor: id }, props.rotulo, props.obrigatorio === false ? h('span', { className: 'sp-campo-opcional' }, ' (opcional)') : null),
      props.ajuda ? h('p', { className: 'sp-campo-ajuda', id: idAjuda }, props.ajuda) : null,
      props.erro ? h('p', { className: 'sp-campo-erro', id: idErro }, h(Icone, { nome: 'circle-alert' }), h('span', null, h('span', { className: 'sp-sr' }, 'Erro: '), props.erro)) : null,
      h('div', { className: cx('sp-campo-caixa', demo === 'foco' && 'is-foco') },
        tipo === 'busca' ? h(Icone, { nome: 'search', className: 'sp-campo-icone' }) : null,
        h('input', Object.assign(rest, {
          id: id, className: 'sp-campo-entrada', type: tipoInput, value: valor, inputMode: modoTeclado,
          maxLength: tipo === 'cpf' ? 14 : tipo === 'data' ? 10 : props.maxLength,
          disabled: props.desabilitado || undefined, 'aria-invalid': props.erro ? 'true' : undefined,
          'aria-describedby': [idAjuda, idErro, idExtenso].filter(Boolean).join(' ') || undefined,
          onChange: function (e) { mudar(e.target.value); }
        })),
        acao),
      data ? h('p', { className: 'sp-campo-extenso', id: idExtenso }, h(Icone, { nome: 'calendar-check' }), h('span', null, formatarDataPorExtenso(data, { ano: true, maiuscula: true }))) : null
    );
  }

  /* ---------- Chip ---------- */
  function Chip(props) {
    var tipo = props.tipo || 'filtro';
    if (tipo === 'especialidade') {
      var conteudo = [props.especialidade ? h(IconeEspecialidade, { key: 'i', especialidade: props.especialidade, tamanho: 24 }) : null, h('span', { key: 't' }, props.children)];
      return props.aoTocar
        ? h('button', { type: 'button', className: cx('sp-chip sp-chip--especialidade', props.className), onClick: props.aoTocar }, conteudo)
        : h('span', { className: cx('sp-chip sp-chip--especialidade', props.className) }, conteudo);
    }
    var sel = !!props.selecionado;
    return h('button', {
      type: 'button', className: cx('sp-chip', props.demonstrarEstado === 'foco' && 'is-foco', props.className), 'aria-pressed': sel,
      onClick: function () { if (props.aoTocar) props.aoTocar(!sel); }
    }, sel ? h(Icone, { nome: 'check' }) : null, h('span', null, props.children));
  }
  function GrupoChips(props) {
    return h('div', { className: 'sp-grupo-chips', role: 'group', 'aria-label': props.rotulo }, props.children);
  }

  /* ---------- Cartões ---------- */
  function Cartao(props) {
    var variante = props.variante || 'conteudo';
    var Tag = props.titulo ? 'section' : 'div';
    return h(Tag, { className: cx('sp-cartao', 'sp-cartao--' + variante, props.className), 'aria-labelledby': props.titulo ? props.idTitulo : undefined },
      props.titulo ? h('h2', { className: 'sp-cartao-titulo', id: props.idTitulo }, props.titulo) : null,
      props.children);
  }
  function CartaoEspecialidade(props) {
    return h('button', { type: 'button', className: cx('sp-especialidade', props.layout === 'lista' && 'sp-especialidade--lista', props.demonstrarEstado === 'foco' && 'is-foco', props.className), onClick: props.aoTocar, lang: 'pt-BR' },
      h('span', { className: 'sp-especialidade-circulo' }, h(IconeEspecialidade, { especialidade: props.especialidade, tamanho: 48 })),
      h('span', { className: 'sp-especialidade-nome' }, props.nome || nomeEspecialidade(props.especialidade)),
      h(Icone, { nome: 'chevron-right', className: 'sp-especialidade-seta' }));
  }
  function GradeEspecialidades(props) {
    return h('div', { className: 'sp-grade-caixa' }, h('div', { className: cx('sp-grade-especialidades', props.layout === 'lista' && 'sp-grade-especialidades--lista'), role: 'list' },
      React.Children.map(props.children, function (c) { return h('div', { role: 'listitem', className: 'sp-grade-item' }, c); })));
  }
  function nomeEspecialidade(id) {
    for (var i = 0; i < ESPECIALIDADES.length; i++) if (ESPECIALIDADES[i].id === id) return ESPECIALIDADES[i].nome;
    return id;
  }
  function iniciais(nome) {
    var p = String(nome || '').replace(/^(Dr|Dra|Sr|Sra)\.?\s+/i, '').split(/\s+/).filter(function (x) { return x.length > 2 || /^[A-Z]/.test(x); });
    return ((p[0] || '')[0] || '') + ((p.length > 1 ? p[p.length - 1] : '')[0] || '');
  }
  function Avatar(props) {
    var tam = props.tamanho || 64;
    var estilo = { width: tam, height: tam, fontSize: Math.max(16, Math.round(tam * 0.36)) };
    if (props.foto) return h('img', { className: 'sp-avatar', src: props.foto, alt: props.descricao || '', style: estilo });
    return h('span', { className: 'sp-avatar sp-avatar--iniciais', style: estilo, 'aria-hidden': props.descricao ? undefined : 'true', role: props.descricao ? 'img' : undefined, 'aria-label': props.descricao }, iniciais(props.nome).toUpperCase());
  }
  function CartaoProfissional(props) {
    return h('button', { type: 'button', className: cx('sp-profissional', props.demonstrarEstado === 'foco' && 'is-foco', props.className), onClick: props.aoTocar },
      h(Avatar, { nome: props.nome, foto: props.foto, tamanho: 64 }),
      h('span', { className: 'sp-profissional-info' },
        h('span', { className: 'sp-profissional-nome' }, props.nome),
        h('span', { className: 'sp-profissional-especialidade' }, props.especialidade),
        h('span', { className: 'sp-profissional-unidade' }, h(Icone, { nome: 'map-pin' }), h('span', null, props.unidade)),
        props.detalhe ? h('span', { className: 'sp-profissional-detalhe' }, props.detalhe) : null),
      h(Icone, { nome: 'chevron-right', className: 'sp-profissional-seta' }));
  }

  /* ---------- Topo, cabeçalho e navegação ---------- */
  function Topo(props) {
    return h('header', { className: cx('sp-topo', props.className) },
      /* onda decorativa em primariaClara: só no canto superior direito, recuando para a borda antes da altura do subtítulo */
      h('svg', { className: 'sp-topo-onda', viewBox: '0 0 220 112', preserveAspectRatio: 'none', 'aria-hidden': 'true', focusable: 'false' },
        h('path', { d: 'M40 0H220V112C196 108 176 92 158 72 132 44 112 40 84 32 62 26 46 16 40 0Z' })),
      h('div', { className: 'sp-topo-conteudo' },
        props.antes || null,
        props.titulo ? h('h1', { className: 'sp-topo-titulo' }, props.titulo) : null,
        props.subtitulo ? h('p', { className: 'sp-topo-subtitulo' }, props.subtitulo) : null,
        props.children));
  }
  function Folha(props) {
    return h('main', { className: cx('sp-folha', props.className) }, props.children);
  }
  function CabecalhoTela(props) {
    return h('header', { className: cx('sp-cabecalho', props.className) },
      props.aoVoltar !== null ? h(Botao, { variante: 'secundario', icone: 'arrow-left', className: 'sp-cabecalho-voltar', aoTocar: props.aoVoltar, demonstrarEstado: props.demonstrarEstado }, props.rotuloVoltar || 'Voltar') : null,
      h('h1', { className: 'sp-cabecalho-titulo' }, props.titulo),
      props.subtitulo ? h('p', { className: 'sp-cabecalho-subtitulo' }, props.subtitulo) : null);
  }
  var DESTINOS_PADRAO = [
    { id: 'inicio', rotulo: 'Início', icone: 'house' },
    { id: 'consultas', rotulo: 'Consultas', icone: 'calendar' },
    { id: 'perfil', rotulo: 'Meu perfil', icone: 'user-round' },
    { id: 'ajustes', rotulo: 'Ajustes', icone: 'settings' }
  ];
  function NavegacaoInferior(props) {
    var itens = props.itens || DESTINOS_PADRAO;
    return h('nav', { className: cx('sp-nav', props.className), 'aria-label': 'Navegação principal' },
      h('ul', null, itens.map(function (it) {
        var ativo = it.id === props.ativo;
        return h('li', { key: it.id },
          h('button', { type: 'button', className: 'sp-nav-item', 'aria-current': ativo ? 'page' : undefined, onClick: function () { if (props.aoNavegar) props.aoNavegar(it.id); } },
            h('span', { className: 'sp-nav-marca', 'aria-hidden': 'true' }),
            h(Icone, { nome: it.icone, tamanho: 28, espessura: ativo ? 2.5 : 2 }),
            h('span', { className: 'sp-nav-rotulo' }, it.rotulo)));
      })));
  }

  /* ---------- Status ---------- */
  var STATUS = {
    agendado: { texto: 'Agendado', icone: 'calendar-check', cor: 'primaria', estilo: 'contorno' },
    aguardandoRecepcao: { texto: 'Aguardando recepção', icone: 'clock', cor: 'atencao', estilo: 'contorno' },
    aguardandoMedico: { texto: 'Aguardando médico', icone: 'hourglass', cor: 'atencao', estilo: 'contorno' },
    chamando: { texto: 'Chamando você', icone: 'megaphone', cor: 'primaria', estilo: 'preenchido', sobre: 'textoSobrePrimaria' },
    emAtendimento: { texto: 'Em atendimento', icone: 'stethoscope', cor: 'primariaEscura', estilo: 'preenchido', sobre: 'textoSobrePrimaria' },
    concluido: { texto: 'Concluído', icone: 'circle-check', cor: 'sucesso', estilo: 'contorno' },
    cancelado: { texto: 'Cancelado', icone: 'circle-x', cor: 'textoSecundario', estilo: 'contorno' },
    naoCompareceu: { texto: 'Não compareceu', icone: 'user-x', cor: 'erro', estilo: 'contorno' },
    encaminhadoEmergencia: { texto: 'Encaminhado para emergência', icone: 'siren', cor: 'erro', estilo: 'preenchido', sobre: 'textoSobreStatus' }
  };
  var URGENCIA = {
    rotina: { texto: 'Rotina', icone: 'circle-dot', cor: 'primaria', estilo: 'contorno' },
    prioritario: { texto: 'Prioritário', icone: 'chevrons-up', cor: 'atencao', estilo: 'preenchido', sobre: 'textoSobreStatus' },
    emergencia: { texto: 'Emergência', icone: 'triangle-alert', cor: 'erro', estilo: 'preenchido', sobre: 'textoSobreStatus' }
  };
  function Selo(def, extra, className) {
    var estilo = { '--sp-cor': 'var(--' + def.cor + ')' };
    if (def.sobre) estilo['--sp-sobre'] = 'var(--' + def.sobre + ')';
    return h('span', { className: cx('sp-selo', 'sp-selo--' + def.estilo, className), style: estilo },
      h(Icone, { nome: def.icone }), h('span', null, extra ? extra + def.texto.toLowerCase() : def.texto));
  }
  function SeloStatus(props) {
    var def = STATUS[props.status] || STATUS.agendado;
    return Selo(def, null, props.className);
  }
  function SeloUrgencia(props) {
    var def = URGENCIA[props.nivel] || URGENCIA.rotina;
    return h('span', { className: 'sp-urgencia' }, h('span', { className: 'sp-sr' }, 'Urgência: '), Selo(def, null, props.className));
  }

  /* ---------- Fila ---------- */
  function ordinal(n) { return n + 'º'; }
  function ListaFila(props) {
    var itens = props.itens || [];
    var voce = null;
    for (var i = 0; i < itens.length; i++) if (itens[i].voce) voce = itens[i];
    var idTitulo = 'fila-' + useId().replace(/:/g, '');
    return h('section', { className: cx('sp-fila', props.className), 'aria-labelledby': idTitulo },
      h('h2', { className: 'sp-fila-titulo', id: idTitulo }, props.titulo || 'Fila de atendimento'),
      voce ? h('div', { className: 'sp-fila-resumo', role: 'status' },
        h('p', { className: 'sp-fila-resumo-posicao' }, 'Você é o ' + ordinal(voce.posicao) + ' da fila'),
        h('p', { className: 'sp-fila-resumo-apoio' }, voce.posicao > 1 ? (voce.posicao - 1) + (voce.posicao - 1 === 1 ? ' pessoa antes de você.' : ' pessoas antes de você.') : 'Você é o próximo.',
          props.previsao ? ' ' + props.previsao : '')) : null,
      h('ol', { className: 'sp-fila-lista' }, itens.map(function (it) {
        return h('li', { key: it.posicao, className: cx('sp-fila-item', it.voce && 'sp-fila-item--voce') },
          h('span', { className: 'sp-fila-posicao', 'aria-label': 'Posição ' + it.posicao }, ordinal(it.posicao)),
          h('span', { className: 'sp-fila-info' },
            h('span', { className: 'sp-fila-nome' }, it.nome, it.voce ? h('span', { className: 'sp-fila-voce' }, 'Você') : null),
            it.status ? h(SeloStatus, { status: it.status }) : null));
      })));
  }

  /* ---------- Avisos ---------- */
  function BannerEmergencia(props) {
    var tel = props.telefone || '192';
    return h('section', { className: cx('sp-emergencia', props.className), role: 'alert', 'aria-live': 'assertive' },
      h('div', { className: 'sp-emergencia-cabeca' },
        h('span', { className: 'sp-emergencia-icone' }, h(Icone, { nome: 'siren', tamanho: 40 })),
        h('h2', { className: 'sp-emergencia-titulo' }, props.titulo || 'Procure atendimento de emergência agora')),
      h('p', { className: 'sp-emergencia-texto' }, props.mensagem || 'Pelo que você contou, seus sintomas podem ser graves. Ligue para o SAMU no 192 ou peça para alguém levar você ao pronto-socorro mais próximo.'),
      h('a', { className: 'sp-botao sp-botao--principal sp-emergencia-ligar' + (props.demonstrarEstado === 'foco' ? ' is-foco' : ''), href: 'tel:' + tel, onClick: props.aoLigar },
        h(Icone, { nome: 'phone', tamanho: 28 }), h('span', null, 'Ligar para o ' + tel)),
      props.complemento !== null ? h('p', { className: 'sp-emergencia-apoio' }, props.complemento || 'Não espere a consulta marcada. Se estiver sozinho, peça ajuda a quem estiver perto.') : null);
  }
  function AvisoIA(props) {
    var compacto = props.variante === 'compacto';
    return h('aside', { className: cx('sp-aviso-ia', compacto && 'sp-aviso-ia--compacto', props.className), role: 'note', 'aria-label': 'Aviso sobre a orientação automática' },
      h(Icone, { nome: 'info', tamanho: compacto ? 24 : 28 }),
      compacto
        ? h('p', null, h('strong', null, 'Orientação automática.'), ' Não substitui a avaliação de um médico.')
        : h('div', null,
          h('p', { className: 'sp-aviso-ia-titulo' }, 'Esta orientação não é uma consulta'),
          h('p', null, 'Ela é feita por inteligência artificial com base no que você contou. Só um médico ou enfermeiro pode avaliar você. Se piorar, procure atendimento.')));
  }
  var MENSAGEM = {
    sucesso: { icone: 'circle-check', cor: 'sucesso', papel: 'status' },
    erro: { icone: 'circle-alert', cor: 'erro', papel: 'alert' },
    atencao: { icone: 'triangle-alert', cor: 'atencao', papel: 'status' },
    informacao: { icone: 'info', cor: 'primaria', papel: 'status' }
  };
  function Mensagem(props) {
    var def = MENSAGEM[props.tipo] || MENSAGEM.informacao;
    return h('div', { className: cx('sp-mensagem', props.className), role: def.papel, style: { '--sp-cor': 'var(--' + def.cor + ')' } },
      h(Icone, { nome: def.icone, tamanho: 28 }),
      h('div', { className: 'sp-mensagem-corpo' },
        h('p', { className: 'sp-mensagem-titulo' }, props.titulo),
        props.children ? h('p', { className: 'sp-mensagem-texto' }, props.children) : null,
        props.acao || null));
  }
  var ESTADO = {
    carregando: { icone: 'loader-circle', titulo: 'Carregando suas consultas', mensagem: 'Isso pode levar alguns segundos. Não precisa fazer nada.' },
    vazio: { icone: 'calendar', titulo: 'Você ainda não tem consultas marcadas', mensagem: 'Quando você marcar uma consulta, ela aparece aqui com o dia, a hora e o endereço.', acao: 'Marcar consulta' },
    erro: { icone: 'wifi-off', titulo: 'Não conseguimos carregar suas consultas', mensagem: 'Confira se o celular está conectado à internet e toque em Tentar de novo. Suas consultas continuam marcadas.', acao: 'Tentar de novo' }
  };
  function EstadoTela(props) {
    var tipo = props.tipo || 'carregando';
    var def = ESTADO[tipo];
    var rotuloAcao = props.rotuloAcao || def.acao;
    return h('div', { className: cx('sp-estado', 'sp-estado--' + tipo, props.className), role: tipo === 'erro' ? 'alert' : 'status', 'aria-live': 'polite', 'aria-busy': tipo === 'carregando' || undefined },
      h('span', { className: 'sp-estado-icone' }, h(Icone, { nome: props.icone || def.icone, tamanho: 44, className: tipo === 'carregando' ? 'sp-girando' : null })),
      h('h2', { className: 'sp-estado-titulo' }, props.titulo || def.titulo),
      h('p', { className: 'sp-estado-texto' }, props.mensagem || def.mensagem),
      rotuloAcao && tipo !== 'carregando' ? h(Botao, { principal: true, icone: tipo === 'erro' ? 'refresh-cw' : 'calendar-plus', aoTocar: props.aoAgir }, rotuloAcao) : null);
  }
  function DialogoConfirmacao(props) {
    var idT = 'dlg-' + useId().replace(/:/g, '');
    var refVoltar = useRef(null);
    useEffect(function () {
      if (!props.aberto || props.emLinha) return;
      if (refVoltar.current) refVoltar.current.focus();
      function tecla(e) { if (e.key === 'Escape' && props.aoVoltar) props.aoVoltar(); }
      document.addEventListener('keydown', tecla);
      return function () { document.removeEventListener('keydown', tecla); };
    }, [props.aberto]);
    if (!props.aberto) return null;
    var caixa = h('div', { className: 'sp-dialogo', role: 'alertdialog', 'aria-modal': props.emLinha ? undefined : 'true', 'aria-labelledby': idT, 'aria-describedby': idT + '-d' },
      h('h2', { className: 'sp-dialogo-titulo', id: idT }, props.titulo),
      h('div', { className: 'sp-dialogo-texto', id: idT + '-d' }, props.mensagem),
      h('div', { className: 'sp-dialogo-acoes' },
        h('button', { ref: refVoltar, type: 'button', className: 'sp-botao sp-botao--secundario sp-botao--largura-total', onClick: props.aoVoltar }, h('span', null, props.rotuloVoltar || 'Não, voltar')),
        h(Botao, { variante: props.destrutivo === false ? 'primario' : 'destrutivo', principal: true, aoTocar: props.aoConfirmar, carregando: props.carregando, rotuloCarregando: props.rotuloCarregando }, props.rotuloConfirmar)));
    if (props.emLinha) return h('div', { className: 'sp-dialogo-veu sp-dialogo-veu--em-linha' }, caixa);
    return h('div', { className: 'sp-dialogo-veu' }, caixa);
  }

  /* ---------- Painel de TV ---------- */
  function PainelTV(props) {
    var agora = props.agora || {};
    var hora = props.horario || new Date();
    return h('div', { className: 'sp-painel', role: 'region', 'aria-label': 'Painel de chamadas' },
      h('div', { className: 'sp-painel-topo' },
        h('div', { className: 'sp-painel-unidade' }, h(Icone, { nome: 'hospital', tamanho: 48 }), h('span', null, props.unidade)),
        h('div', { className: 'sp-painel-hora' },
          h('span', { className: 'sp-painel-relogio' }, formatarHora(hora)),
          h('span', { className: 'sp-painel-data' }, formatarDataPorExtenso(hora, { maiuscula: true })))),
      h('div', { className: 'sp-painel-atual', 'aria-live': 'polite' },
        h('div', { className: 'sp-painel-quem' },
          h('p', { className: 'sp-painel-rotulo sp-painel-rotulo--destaque' }, h(Icone, { nome: 'megaphone', tamanho: 48 }), h('span', null, 'Chamando agora')),
          h('p', { className: 'sp-painel-nome' }, agora.nome),
          h('p', { className: 'sp-painel-detalhe' }, [agora.especialidade, agora.senha ? 'Senha ' + agora.senha : null].filter(Boolean).join(' · '))),
        h('div', { className: 'sp-painel-onde' },
          h('p', { className: 'sp-painel-rotulo' }, 'Consultório'),
          h('p', { className: 'sp-painel-consultorio' }, agora.consultorio),
          agora.andar ? h('p', { className: 'sp-painel-detalhe' }, agora.andar) : null)),
      h('div', { className: 'sp-painel-anteriores' },
        h('p', { className: 'sp-painel-rotulo' }, 'Chamadas anteriores'),
        h('ol', null, (props.anteriores || []).slice(0, 3).map(function (c, i) {
          return h('li', { key: i },
            h('span', { className: 'sp-painel-anterior-nome' }, c.nome),
            h('span', { className: 'sp-painel-anterior-detalhe' }, 'Consultório ' + c.consultorio + (c.horario ? ' · ' + formatarHora(c.horario) : '')));
        }))),
      h('p', { className: 'sp-painel-rodape' }, h(Icone, { nome: 'info', tamanho: 40 }), h('span', null, props.rodape || 'Não viu seu nome? Procure a recepção. Os nomes também aparecem no aplicativo.')));
  }

  var api = {
    Botao: Botao, Campo: Campo, Chip: Chip, GrupoChips: GrupoChips, Cartao: Cartao, CartaoEspecialidade: CartaoEspecialidade,
    GradeEspecialidades: GradeEspecialidades, CartaoProfissional: CartaoProfissional, Avatar: Avatar, Topo: Topo, Folha: Folha,
    CabecalhoTela: CabecalhoTela, NavegacaoInferior: NavegacaoInferior, SeloStatus: SeloStatus, SeloUrgencia: SeloUrgencia,
    ListaFila: ListaFila, BannerEmergencia: BannerEmergencia, AvisoIA: AvisoIA, Mensagem: Mensagem, EstadoTela: EstadoTela,
    DialogoConfirmacao: DialogoConfirmacao, PainelTV: PainelTV, Icone: Icone, IconeEspecialidade: IconeEspecialidade,
    ESPECIALIDADES: ESPECIALIDADES, STATUS: STATUS, URGENCIA: URGENCIA, NOMES_ICONES: Object.keys(ICONES),
    formatarDataPorExtenso: formatarDataPorExtenso, formatarHora: formatarHora, mascararCPF: mascararCPF, mascararData: mascararData,
    lerData: lerData, cpfValido: cpfValido, razaoContraste: razaoContraste
  };
  window.SaudeNaPalma = Object.assign(window.SaudeNaPalma || {}, api);
})();
