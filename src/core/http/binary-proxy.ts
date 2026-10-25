import 'server-only';
import { hasAnyRole } from '@/core/auth/roles';
import { getSession } from '@/core/auth/session';
import { isApiException } from './api-error';
import type { ApiBinaryResult } from './api-fetch';

/** Encabezados del backend que se reenvían tal cual al navegador. */
const HEADERS_REENVIADOS = ['content-type', 'content-length', 'content-disposition'] as const;
/** El backend no respondió (timeout o red): el portal responde como pasarela. */
const STATUS_SIN_RESPUESTA = 502;

/**
 * Sirve en streaming un archivo del backend (imagen de soporte, PDF o Excel de un reporte) desde un route handler
 * propio: el navegador nunca lo pide a la API. Verifica sesión y rol, reenvía tipo, tamaño y `Content-Disposition` (en
 * línea o adjunto, lo decide el backend) y no deja copia en cachés compartidas. `obtener` solo corre con sesión y rol
 * válidos; si devuelve `null`, la petición era inválida (400).
 */
export async function responderBinario(
  roles: readonly string[],
  obtener: () => Promise<ApiBinaryResult> | null,
): Promise<Response> {
  const session = await getSession();
  if (!session) return new Response(null, { status: 401 });
  if (!hasAnyRole(session.user, roles)) return new Response(null, { status: 403 });

  try {
    const pendiente = obtener();
    if (!pendiente) return new Response(null, { status: 400 });
    const { body, headers } = await pendiente;
    const respuesta = new Headers({ 'Cache-Control': 'private, no-store' });
    for (const nombre of HEADERS_REENVIADOS) {
      const valor = headers.get(nombre);
      if (valor) respuesta.set(nombre, valor);
    }
    return new Response(body, { status: 200, headers: respuesta });
  } catch (err) {
    if (isApiException(err)) return new Response(null, { status: err.error.status ?? STATUS_SIN_RESPUESTA });
    throw err;
  }
}

/** Igual que `responderBinario` para un archivo identificado por el id de la ruta (entero positivo; si no, 400). */
export function proxyBinario(
  idRuta: string,
  roles: readonly string[],
  obtener: (id: number) => Promise<ApiBinaryResult>,
): Promise<Response> {
  const id = Number(idRuta);
  return responderBinario(roles, () => (Number.isInteger(id) && id > 0 ? obtener(id) : null));
}
