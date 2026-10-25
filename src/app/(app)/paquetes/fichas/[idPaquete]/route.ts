import { ADMIN_NOTIFICACIONES_ROLES } from '@/core/auth/roles';
import { proxyBinario } from '@/core/http/binary-proxy';
import { getFichaStream } from '@/features/paquetes/services/paquetes.service';

interface FichaRouteContext {
  params: Promise<{ idPaquete: string }>;
}

/**
 * Ficha del paquete en PDF (PRD 7.3 "Imp. Ficha"), como descarga. El navegador nunca la pide a la API: este handler la
 * trae con el token de la sesión y la sirve en streaming con el `Content-Disposition` del backend.
 */
export async function GET(_request: Request, { params }: FichaRouteContext): Promise<Response> {
  return proxyBinario((await params).idPaquete, ADMIN_NOTIFICACIONES_ROLES, getFichaStream);
}
