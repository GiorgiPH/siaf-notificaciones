import { ADMIN_NOTIFICACIONES_ROLES } from '@/core/auth/roles';
import { proxyBinario } from '@/core/http/binary-proxy';
import { getSoporteStream } from '@/features/paquetes/services/paquetes.service';

interface SoporteRouteContext {
  params: Promise<{ idSoporte: string }>;
}

/**
 * Imagen de soporte de un paquete (PRD 7.3). El navegador nunca la pide a la API: este handler la trae con el token de
 * la sesión y la sirve en streaming, sin guardarla en caché compartida.
 */
export async function GET(_request: Request, { params }: SoporteRouteContext): Promise<Response> {
  return proxyBinario((await params).idSoporte, ADMIN_NOTIFICACIONES_ROLES, getSoporteStream);
}
