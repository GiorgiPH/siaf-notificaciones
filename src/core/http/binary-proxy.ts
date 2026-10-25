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
 * Sirve en streaming un archivo del backend (imagen de soporte, PDF de un reporte) desde un route handler propio: el
 * navegador nunca lo pide a la API. Verifica sesión y rol, valida el id de la ruta, reenvía tipo, tamaño y
 * `Content-Disposition` (en línea o adjunto, lo decide el backend) y no deja copia en cachés compartidas.
 */
export async function proxyBinario(
  idRuta: string,
  roles: readonly string[],
  obtener: (id: number) => Promise<ApiBinaryResult>,
): Promise<Response> {
  const session = await getSession();
  if (!session) return new Response(null, { status: 401 });
  if (!hasAnyRole(session.user, roles)) return new Response(null, { status: 403 });

  const id = Number(idRuta);
  if (!Number.isInteger(id) || id <= 0) return new Response(null, { status: 400 });

  try {
    const { body, headers } = await obtener(id);
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
