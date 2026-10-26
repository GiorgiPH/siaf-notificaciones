import { NOTIFICADOR_ROLES } from '@/core/auth/roles';
import { proxyBinario } from '@/core/http/binary-proxy';
import { getSoporteStream } from '@/features/mis-paquetes/services/mis-paquetes.service';

interface SoporteRouteContext {
  params: Promise<{ idSoporte: string }>;
}

/**
 * Fotografía propia del notificador (PRD 8). El navegador nunca la pide a la API: este handler la trae con el token de
 * la sesión (el backend valida que sea de un paquete suyo) y la sirve en streaming.
 */
export async function GET(_request: Request, { params }: SoporteRouteContext): Promise<Response> {
  return proxyBinario((await params).idSoporte, NOTIFICADOR_ROLES, getSoporteStream);
}
