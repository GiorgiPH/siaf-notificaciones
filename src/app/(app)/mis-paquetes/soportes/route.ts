import { revalidatePath } from 'next/cache';
import { hasAnyRole, NOTIFICADOR_ROLES } from '@/core/auth/roles';
import { MIS_PAQUETES_PATH } from '@/core/auth/routes';
import { getSession } from '@/core/auth/session';
import { isApiException } from '@/core/http/api-error';
import { subirSoporteSchema } from '@/features/mis-paquetes/schemas';
import { subirSoporte } from '@/features/mis-paquetes/services/mis-paquetes.service';

/** El backend no respondió (timeout o red): el portal responde como pasarela. */
const STATUS_SIN_RESPUESTA = 502;

/**
 * Carga de una fotografía (PRD 8, RN-08). Es un route handler y no una Server Action porque las fotos del celular
 * rebasan el límite de 1 MB de las actions y el cliente sube una por una mostrando su avance. Verifica sesión y rol,
 * valida la entrada y reenvía el multipart al backend, que valida el contenido (JPEG/PNG), el tamaño, el máximo y que
 * el paquete sea del notificador y esté Abierto. Respuesta: `{ soporte }` o `{ error }` con el estatus del backend.
 */
export async function POST(request: Request): Promise<Response> {
  const session = await getSession();
  if (!session) return Response.json({ error: 'Tu sesión expiró' }, { status: 401 });
  if (!hasAnyRole(session.user, NOTIFICADOR_ROLES)) return Response.json({ error: 'No autorizado' }, { status: 403 });

  let entrada: FormData;
  try {
    entrada = await request.formData();
  } catch {
    return Response.json({ error: 'Selecciona una fotografía' }, { status: 400 });
  }
  const parsed = subirSoporteSchema.safeParse({
    idNotificacion: entrada.get('idNotificacion'),
    archivo: entrada.get('archivo'),
  });
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 });

  const form = new FormData();
  form.set('idNotificacion', String(parsed.data.idNotificacion));
  form.set('archivo', parsed.data.archivo, parsed.data.archivo.name);
  try {
    const soporte = await subirSoporte(form);
    revalidatePath(MIS_PAQUETES_PATH, 'layout');
    return Response.json({ soporte });
  } catch (err) {
    if (isApiException(err)) {
      return Response.json({ error: err.error.message }, { status: err.error.status ?? STATUS_SIN_RESPUESTA });
    }
    throw err;
  }
}
