/** "Coração " -> "coracao": minúsculo, sem acento, para comparar buscas. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** true se o termo aparece em algum dos textos (sem diferenciar acento e maiúscula). */
export function contemTermo(termo: string, textos: readonly string[]): boolean {
  const procurado = normalizar(termo);
  if (!procurado) return true;
  return textos.some((texto) => normalizar(texto).includes(procurado));
}

/** "Dra. Helena Marinho Duarte" -> "HD" (ignora Dr./Dra., como o Avatar do design system). */
export function iniciais(nome: string): string {
  const partes = nome
    .replace(/^(Dr|Dra|Sr|Sra)\.?\s+/i, '')
    .split(/\s+/)
    .filter((parte) => parte.length > 2 || /^[A-ZÀ-Ý]/.test(parte));
  const primeira = partes[0]?.[0] ?? '';
  const ultima = partes.length > 1 ? (partes[partes.length - 1]?.[0] ?? '') : '';
  return (primeira + ultima).toUpperCase();
}

/** ["Cardiologia", "Clínico geral"] -> "Cardiologia e Clínico geral" */
export function juntarComE(itens: readonly string[]): string {
  if (itens.length <= 1) return itens[0] ?? '';
  return `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`;
}
