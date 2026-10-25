import { ADMIN_NOTIFICACIONES_ROLES } from '@/core/auth/roles';
import { responderBinario } from '@/core/http/binary-proxy';
import { formatoInformeSchema, paquetesQuerySchema } from '@/features/paquetes/schemas';
import { getInformeStream } from '@/features/paquetes/services/paquetes.service';

/**
 * Informe general de notificaciones (PRD 7.2) en PDF o Excel, como descarga, con los filtros de la bandeja que trae la
 * URL. El navegador nunca lo pide a la API: este handler lo trae con el token de la sesión y lo sirve en streaming.
 */
export async function GET(request: Request): Promise<Response> {
  const params = new URL(request.url).searchParams;
  const formato = formatoInformeSchema.safeParse(params.get('formato'));
  const query = paquetesQuerySchema.parse(Object.fromEntries(params));
  return responderBinario(ADMIN_NOTIFICACIONES_ROLES, () =>
    formato.success ? getInformeStream(query, formato.data) : null,
  );
}
