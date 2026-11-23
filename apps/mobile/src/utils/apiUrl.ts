/**
 * No Expo Go, "localhost" é o próprio celular. Em desenvolvimento, troca pelo
 * IP do computador que roda o Expo (hostUri), para a API local responder.
 */
export function resolverApiUrl(
  url: string,
  hostUri: string | null | undefined,
  plataforma: string,
): string {
  if (plataforma === 'web' || !/localhost|127\.0\.0\.1/.test(url) || !hostUri) return url;
  const host = hostUri.split(':')[0];
  return host ? url.replace(/localhost|127\.0\.0\.1/, host) : url;
}
