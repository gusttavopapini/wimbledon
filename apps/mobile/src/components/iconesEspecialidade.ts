// GERADO POR apps/mobile/scripts/gerar-icones.mjs A PARTIR DE assets/especialidades/*.svg
// (cópia de design-system/assets/Especialidades). NÃO EDITE À MÃO: rode npm run icones.
// Só a geometria, em grade de 24; traço e cor vêm do componente IconeEspecialidade.

export type FormaIcone =
  | { tipo: 'path'; d: string }
  | { tipo: 'circle'; cx: number; cy: number; r: number };

export const ICONES_ESPECIALIDADE = {
  "cardiologia": [
    {
      "tipo": "path",
      "d": "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5"
    },
    {
      "tipo": "path",
      "d": "M3.22 13H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"
    }
  ],
  "clinicoGeral": [
    {
      "tipo": "path",
      "d": "M11 2v2"
    },
    {
      "tipo": "path",
      "d": "M5 2v2"
    },
    {
      "tipo": "path",
      "d": "M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"
    },
    {
      "tipo": "path",
      "d": "M8 15a6 6 0 0 0 12 0v-3"
    },
    {
      "tipo": "circle",
      "cx": 20,
      "cy": 10,
      "r": 2
    }
  ],
  "dermatologia": [
    {
      "tipo": "path",
      "d": "M3 10v10a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V10"
    },
    {
      "tipo": "path",
      "d": "M3 10c2-1.3 4-1.3 6 0s4 1.3 6 0 4-1.3 6 0"
    },
    {
      "tipo": "path",
      "d": "M3 15.5h7"
    },
    {
      "tipo": "path",
      "d": "M16 15.5h5"
    },
    {
      "tipo": "circle",
      "cx": 13,
      "cy": 17,
      "r": 1.5
    },
    {
      "tipo": "path",
      "d": "M13 15.5V9c0-2.5 1.5-4.5 3.5-5.5"
    }
  ],
  "gastroenterologia": [
    {
      "tipo": "path",
      "d": "M13.5 2v3c1-1.2 2.8-1.7 4.6-1.1 3 1 3.6 5.6 1.6 9.6-2 4-6.6 6.9-11.2 5.5H4"
    },
    {
      "tipo": "path",
      "d": "M10.5 2v5c0 3.6-1.2 6.6-3.6 7.6H4"
    }
  ],
  "ginecologia": [
    {
      "tipo": "path",
      "d": "M8 8c0-1 1-1.5 4-1.5s4 .5 4 1.5c0 3.5-1.5 5.5-2.8 6.5v4c0 .8-.6 1.5-1.2 1.5s-1.2-.7-1.2-1.5v-4C9.5 13.5 8 11.5 8 8z"
    },
    {
      "tipo": "path",
      "d": "M8.2 8.2C7 6.8 5 6.2 4 7.2c-.7.7-.6 1.8 0 2.4"
    },
    {
      "tipo": "path",
      "d": "M15.8 8.2C17 6.8 19 6.2 20 7.2c.7.7.6 1.8 0 2.4"
    },
    {
      "tipo": "circle",
      "cx": 5.2,
      "cy": 11.4,
      "r": 1.6
    },
    {
      "tipo": "circle",
      "cx": 18.8,
      "cy": 11.4,
      "r": 1.6
    }
  ],
  "imunologia": [
    {
      "tipo": "path",
      "d": "M12 14.991h.01"
    },
    {
      "tipo": "path",
      "d": "M12 22v-3"
    },
    {
      "tipo": "path",
      "d": "M12 2v3"
    },
    {
      "tipo": "path",
      "d": "M13 22h-2"
    },
    {
      "tipo": "path",
      "d": "M13 2h-2"
    },
    {
      "tipo": "path",
      "d": "M13.99 10H14"
    },
    {
      "tipo": "path",
      "d": "m16.5 19.794-1-1.733"
    },
    {
      "tipo": "path",
      "d": "m16.5 4.205-1 1.732"
    },
    {
      "tipo": "path",
      "d": "m19.794 16.5-1.732-1"
    },
    {
      "tipo": "path",
      "d": "m19.794 7.5-1.732 1"
    },
    {
      "tipo": "path",
      "d": "M2 12h3"
    },
    {
      "tipo": "path",
      "d": "M2 13v-2"
    },
    {
      "tipo": "path",
      "d": "M22 12h-3"
    },
    {
      "tipo": "path",
      "d": "M22 13v-2"
    },
    {
      "tipo": "path",
      "d": "m4.206 16.5 1.732-1"
    },
    {
      "tipo": "path",
      "d": "m4.206 7.5 1.732 1"
    },
    {
      "tipo": "path",
      "d": "m7.5 19.794 1-1.733"
    },
    {
      "tipo": "path",
      "d": "m7.5 4.205 1 1.732"
    },
    {
      "tipo": "path",
      "d": "M9 12h.01"
    },
    {
      "tipo": "circle",
      "cx": 12,
      "cy": 12,
      "r": 7
    }
  ],
  "neurologia": [
    {
      "tipo": "path",
      "d": "M12 18V5"
    },
    {
      "tipo": "path",
      "d": "M15 13a4.17 4.17 0 0 1-3-4 4.17 4.17 0 0 1-3 4"
    },
    {
      "tipo": "path",
      "d": "M17.598 6.5A3 3 0 1 0 12 5a3 3 0 1 0-5.598 1.5"
    },
    {
      "tipo": "path",
      "d": "M17.997 5.125a4 4 0 0 1 2.526 5.77"
    },
    {
      "tipo": "path",
      "d": "M18 18a4 4 0 0 0 2-7.464"
    },
    {
      "tipo": "path",
      "d": "M19.967 17.483A4 4 0 1 1 12 18a4 4 0 1 1-7.967-.517"
    },
    {
      "tipo": "path",
      "d": "M6 18a4 4 0 0 1-2-7.464"
    },
    {
      "tipo": "path",
      "d": "M6.003 5.125a4 4 0 0 0-2.526 5.77"
    }
  ],
  "obstetricia": [
    {
      "tipo": "circle",
      "cx": 10.5,
      "cy": 4,
      "r": 2.2
    },
    {
      "tipo": "path",
      "d": "M9.5 7.6C8.2 9.6 8 12.6 8.7 15.2L8.2 21"
    },
    {
      "tipo": "path",
      "d": "M11.6 7.6c.7 1.1 1 2.2 1.2 3.2 4 .8 5 5.2 2.4 7.3-1.1.9-2.5 1.2-3.8 1.2l.4 1.7"
    }
  ],
  "oftalmologia": [
    {
      "tipo": "path",
      "d": "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
    },
    {
      "tipo": "circle",
      "cx": 12,
      "cy": 12,
      "r": 3
    }
  ],
  "ortopedia": [
    {
      "tipo": "path",
      "d": "M17 10c.7-.7 1.69 0 2.5 0a2.5 2.5 0 1 0 0-5 .5.5 0 0 1-.5-.5 2.5 2.5 0 1 0-5 0c0 .81.7 1.8 0 2.5l-7 7c-.7.7-1.69 0-2.5 0a2.5 2.5 0 0 0 0 5c.28 0 .5.22.5.5a2.5 2.5 0 1 0 5 0c0-.81-.7-1.8 0-2.5Z"
    }
  ],
  "otorrinolaringologia": [
    {
      "tipo": "path",
      "d": "M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"
    },
    {
      "tipo": "path",
      "d": "M15 8.5a2.5 2.5 0 0 0-5 0v1a2 2 0 1 1 0 4"
    }
  ],
  "pediatria": [
    {
      "tipo": "path",
      "d": "M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"
    },
    {
      "tipo": "path",
      "d": "M15 12h.01"
    },
    {
      "tipo": "path",
      "d": "M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1"
    },
    {
      "tipo": "path",
      "d": "M9 12h.01"
    }
  ],
  "pneumologia": [
    {
      "tipo": "path",
      "d": "M12 2v9"
    },
    {
      "tipo": "path",
      "d": "M12 11l-2.5 2"
    },
    {
      "tipo": "path",
      "d": "M12 11l2.5 2"
    },
    {
      "tipo": "path",
      "d": "M9.5 8c0-1.2-.8-1.9-1.7-1.5C5 7.8 3 12.2 3 17c0 2.5 1.2 4 3 4 2 0 3.5-1.5 3.5-3.5z"
    },
    {
      "tipo": "path",
      "d": "M14.5 8c0-1.2.8-1.9 1.7-1.5C19 7.8 21 12.2 21 17c0 2.5-1.2 4-3 4-2 0-3.5-1.5-3.5-3.5z"
    }
  ]
} as const satisfies Record<string, readonly FormaIcone[]>;

export type IdIconeEspecialidade = keyof typeof ICONES_ESPECIALIDADE;
