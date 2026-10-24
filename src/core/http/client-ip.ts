/**
 * IP del navegador que originó la petición, para reenviarla al backend en
 * `X-Forwarded-For`. Sin esto el backend vería siempre la IP del servidor Next
 * y su rate limit por IP (10 logins/min) se compartiría entre todos los usuarios.
 * El backend solo la acepta si Next está en `PROXIES_CONFIABLES`.
 */
export function getClientIp(headers: Headers): string | undefined {
  const forwarded = headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || headers.get('x-real-ip')?.trim() || undefined;
}
