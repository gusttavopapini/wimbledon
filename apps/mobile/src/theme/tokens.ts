// GERADO POR scripts/gerar-tema.mjs A PARTIR DO DESIGN SYSTEM — NÃO EDITE À MÃO.
// Fonte: "Saúde na Palma da Mão" v1. Para mudar um valor, mude no design system
// e rode: npm run tema
//
// Fonte Heebo: @expo-google-fonts/heebo (Heebo_400Regular, Heebo_700Bold).

export const cores = {
  claro: {
    primaria: "#015F68",
    primariaEscura: "#014A52",
    primariaClara: "#03757F",
    teal50: "#F2F8F9",
    superficie: "#FFFFFF",
    texto: "#1A1A1A",
    textoSecundario: "#4A6B6F",
    textoSobrePrimaria: "#FFFFFF",
    bordaCampo: "rgba(1, 95, 104, 0.4)",
    contorno: "#015F68",
    anelFoco: "#014A52",
    sucesso: "#1B6E3A",
    erro: "#B3261E",
    atencao: "#8A5300",
    textoSobreStatus: "#FFFFFF",
    veuDialogo: "rgba(26, 26, 26, 0.6)",
    painelFundo: "#1A1A1A",
    painelTexto: "#FFFFFF",
    painelDestaque: "#FFD54F"
  },
  altoContraste: {
    primaria: "#FFD54F",
    primariaEscura: "#FFFFFF",
    primariaClara: "#000000",
    teal50: "#1A1A1A",
    superficie: "#000000",
    texto: "#FFFFFF",
    textoSecundario: "#E0E0E0",
    textoSobrePrimaria: "#000000",
    bordaCampo: "#FFFFFF",
    contorno: "#FFFFFF",
    anelFoco: "#FFD54F",
    sucesso: "#7FE0A0",
    erro: "#FF8A80",
    atencao: "#FFB74D",
    textoSobreStatus: "#000000",
    veuDialogo: "rgba(0, 0, 0, 0.9)",
    painelFundo: "#1A1A1A",
    painelTexto: "#FFFFFF",
    painelDestaque: "#FFD54F"
  }
} as const;

export type ModoCor = keyof typeof cores;

export const espacamento = {
  espacamento4: 4,
  espacamento8: 8,
  espacamento12: 12,
  espacamento16: 16,
  espacamento24: 24,
  espacamento32: 32,
  espacamento48: 48
} as const;

export const raio = {
  raioCartao: 32,
  raioBotao: 28,
  raioCampo: 28,
  raioCartaoInterno: 16,
  raioChip: 9999
} as const;

export const tamanho = {
  alturaBotao: 56,
  alturaBotaoPrincipal: 64,
  alturaCampo: 56,
  alvoToqueMinimo: 48,
  respiroEntreAlvos: 8,
  margemLateral: 24,
  larguraReferencia: 390,
  espessuraBorda: 2,
  espessuraFoco: 3,
  tamanhoIcone: 24,
  tamanhoIconeNavegacao: 28,
  circuloEspecialidade: 88,
  tamanhoAvatar: 64
} as const;

export const tipo = {
  display: {
    fontSize: 40,
    lineHeight: 48,
    fontFamily: "Heebo_700Bold",
    fontWeight: "700"
  },
  tituloTela: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: "Heebo_700Bold",
    fontWeight: "700"
  },
  tituloSecao: {
    fontSize: 24,
    lineHeight: 32,
    fontFamily: "Heebo_700Bold",
    fontWeight: "700"
  },
  subtitulo: {
    fontSize: 20,
    lineHeight: 28,
    fontFamily: "Heebo_400Regular",
    fontWeight: "400"
  },
  corpo: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: "Heebo_400Regular",
    fontWeight: "400"
  },
  corpoForte: {
    fontSize: 18,
    lineHeight: 28,
    fontFamily: "Heebo_700Bold",
    fontWeight: "700"
  },
  rotulo: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Heebo_700Bold",
    fontWeight: "700"
  },
  apoio: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: "Heebo_400Regular",
    fontWeight: "400"
  }
} as const;

export const tipoGrande = {
  displayGrande: {
    fontSize: 49,
    lineHeight: 58,
    fontFamily: "Heebo_700Bold",
    fontWeight: "700"
  },
  tituloTelaGrande: {
    fontSize: 39,
    lineHeight: 48,
    fontFamily: "Heebo_700Bold",
    fontWeight: "700"
  },
  tituloSecaoGrande: {
    fontSize: 29,
    lineHeight: 40,
    fontFamily: "Heebo_700Bold",
    fontWeight: "700"
  },
  subtituloGrande: {
    fontSize: 24,
    lineHeight: 34,
    fontFamily: "Heebo_400Regular",
    fontWeight: "400"
  },
  corpoGrande: {
    fontSize: 22,
    lineHeight: 34,
    fontFamily: "Heebo_400Regular",
    fontWeight: "400"
  },
  corpoForteGrande: {
    fontSize: 22,
    lineHeight: 34,
    fontFamily: "Heebo_700Bold",
    fontWeight: "700"
  },
  rotuloGrande: {
    fontSize: 20,
    lineHeight: 30,
    fontFamily: "Heebo_700Bold",
    fontWeight: "700"
  },
  apoioGrande: {
    fontSize: 20,
    lineHeight: 30,
    fontFamily: "Heebo_400Regular",
    fontWeight: "400"
  }
} as const;

export const tipoPainel = {
  painelUnidade: {
    fontSize: 40,
    lineHeight: 48,
    fontFamily: "Heebo_700Bold",
    fontWeight: "700"
  },
  painelRelogio: {
    fontSize: 64,
    lineHeight: 72,
    fontFamily: "Heebo_700Bold",
    fontWeight: "700"
  },
  painelRotulo: {
    fontSize: 48,
    lineHeight: 56,
    fontFamily: "Heebo_700Bold",
    fontWeight: "700"
  },
  painelNome: {
    fontSize: 104,
    lineHeight: 112,
    fontFamily: "Heebo_700Bold",
    fontWeight: "700"
  },
  painelConsultorio: {
    fontSize: 200,
    lineHeight: 200,
    fontFamily: "Heebo_700Bold",
    fontWeight: "700"
  },
  painelAnterior: {
    fontSize: 48,
    lineHeight: 56,
    fontFamily: "Heebo_700Bold",
    fontWeight: "700"
  },
  painelApoio: {
    fontSize: 40,
    lineHeight: 48,
    fontFamily: "Heebo_400Regular",
    fontWeight: "400"
  }
} as const;

/** Multiplicador do modo "Letra grande" (18px -> 22px). */
export const FATOR_LETRA_GRANDE = 1.2222;

export const sombras = {
  claro: {
    sombraCartao: {
      elevation: 3,
      shadowColor: "#014A52",
      shadowOpacity: 0.12,
      shadowRadius: 12,
      shadowOffset: {
        width: 0,
        height: 4
      }
    },
    sombraNavegacao: {
      elevation: 8,
      shadowColor: "#014A52",
      shadowOpacity: 0.16,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: -2
      }
    },
    sombraDialogo: {
      elevation: 16,
      shadowColor: "#1A1A1A",
      shadowOpacity: 0.32,
      shadowRadius: 24,
      shadowOffset: {
        width: 0,
        height: 8
      }
    }
  },
  altoContraste: {
    sombraCartao: {
      elevation: 0,
      borderWidth: 2,
      borderColor: "#FFFFFF"
    },
    sombraNavegacao: {
      elevation: 0,
      borderWidth: 2,
      borderColor: "#FFFFFF"
    },
    sombraDialogo: {
      elevation: 0,
      borderWidth: 3,
      borderColor: "#FFFFFF"
    }
  }
} as const;

/**
 * A borda do campo em repouso mede 1,98:1 sobre branco e NÃO passa no
 * WCAG 1.4.11 (mínimo 3:1). Ver project/contraste.md. Correção recomendada,
 * quando o design system for atualizado: opacidade 0,65 (3,31:1) ou 0,70 (3,70:1).
 */
export const BORDA_CAMPO_REPROVA_CONTRASTE = true;
