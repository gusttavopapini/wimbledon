/** "Ilha do Leite " -> "ilha do leite": minúsculo, sem acento e sem espaços repetidos. */
export function normalizarBusca(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** "Clínico geral" -> "clinicoGeral": id estável, igual ao nome do ícone no design system. */
export function idDoNome(nome: string): string {
  const palavras = normalizarBusca(nome)
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(' ')
    .filter(Boolean);
  return palavras
    .map((palavra, i) => (i === 0 ? palavra : palavra.charAt(0).toUpperCase() + palavra.slice(1)))
    .join('');
}
