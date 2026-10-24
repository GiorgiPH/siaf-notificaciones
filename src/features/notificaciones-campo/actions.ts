'use server';

import { revalidatePath } from 'next/cache';
import { ADMIN_NOTIFICACIONES_ROLES, hasAnyRole } from '@/core/auth/roles';
import { NOTIFICACIONES_PATH } from '@/core/auth/routes';
import { getSession } from '@/core/auth/session';
import { fieldErrorsToRecord, isApiException } from '@/core/http/api-error';
import type { ActionState } from '@/core/lib/action-state';
import { editarNotificacionSchema } from './schemas';
import { updateNotificacion } from './services/notificaciones-campo.service';

/** Edición de datos de campo de una notificación Por Asignar (PRD 6.3). El backend vuelve a autorizar y validar. */
export async function editarNotificacionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || !hasAnyRole(session.user, ADMIN_NOTIFICACIONES_ROLES)) return { error: 'No autorizado' };

  const parsed = editarNotificacionSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return { error: 'Revisa los campos marcados', fieldErrors };
  }

  try {
    await updateNotificacion(parsed.data);
  } catch (err) {
    if (isApiException(err)) {
      return { error: err.error.message, fieldErrors: fieldErrorsToRecord(err.error.fieldErrors) };
    }
    console.error('[notificaciones] Error inesperado al editar', err);
    return { error: 'No se pudo guardar la notificación' };
  }

  revalidatePath(NOTIFICACIONES_PATH);
  return { success: true };
}
