import { ADMIN_NOTIFICACIONES_ROLES, hasAnyRole } from '@/core/auth/roles';
import { getSession } from '@/core/auth/session';
import { isApiException } from '@/core/http/api-error';
import { getSoporteStream } from '@/features/paquetes/services/paquetes.service';

/** Encabezados del backend que se reenvían tal cual al navegador. */
const HEADERS_REENVIADOS = ['content-type', 'content-length', 'content-disposition'] as const;
/** El backend no respondió (timeout o red): el portal responde como pasarela. */
const STATUS_SIN_RESPUESTA = 502;

interface SoporteRouteContext {
  params: Promise<{ idSoporte: string }>;
}

/**
 * Imagen de soporte de un paquete (PRD 7.3). El navegador nunca la pide a la API: este handler la trae con el token de
 * la sesión y la sirve en streaming, sin guardarla en caché compartida.
 */
export async function GET(_request: Request, { params }: SoporteRouteContext): Promise<Response> {
  const session = await getSession();
  if (!session) return new Response(null, { status: 401 });
  if (!hasAnyRole(session.user, ADMIN_NOTIFICACIONES_ROLES)) return new Response(null, { status: 403 });

  const idSoporte = Number((await params).idSoporte);
  if (!Number.isInteger(idSoporte) || idSoporte <= 0) return new Response(null, { status: 400 });

  try {
    const { body, headers } = await getSoporteStream(idSoporte);
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
