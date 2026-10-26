'use server';

import { revalidatePath } from 'next/cache';
import { hasAnyRole, NOTIFICADOR_ROLES } from '@/core/auth/roles';
import { MIS_PAQUETES_PATH } from '@/core/auth/routes';
import { getSession } from '@/core/auth/session';
import { fieldErrorsToRecord, isApiException } from '@/core/http/api-error';
import type { ActionState } from '@/core/lib/action-state';
import { quitarSoporteSchema, registrarResultadoSchema } from './schemas';
import { quitarSoporte, registrarResultado } from './services/mis-paquetes.service';

async function autorizado(): Promise<boolean> {
  const session = await getSession();
  return !!session && hasAnyRole(session.user, NOTIFICADOR_ROLES);
}

/** Lista y detalle del portal: el resultado y las fotografías cambian el avance de ambos. */
function revalidarPortal() {
  revalidatePath(MIS_PAQUETES_PATH, 'layout');
}

export interface ResultadoState extends ActionState {
  /** El resultado fue el último del paquete y este se cerró solo (RN-09). */
  readonly paqueteCerrado?: boolean;
}

/**
 * Registra Notificado o No entregado (PRD 8). La fecha y hora las pone el servidor; el backend valida que el paquete
 * sea del notificador y esté Abierto, que la notificación siga Por Notificar y que tenga al menos una fotografía.
 */
export async function registrarResultadoAction(_prev: ResultadoState, formData: FormData): Promise<ResultadoState> {
  if (!(await autorizado())) return { error: 'No autorizado' };

  const parsed = registrarResultadoSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return { error: 'Revisa los campos marcados', fieldErrors };
  }

  try {
    const { paqueteCerrado } = await registrarResultado(parsed.data);
    revalidarPortal();
    return { success: true, paqueteCerrado };
  } catch (err) {
    if (isApiException(err)) {
      return { error: err.error.message, fieldErrors: fieldErrorsToRecord(err.error.fieldErrors) };
    }
    console.error('[mis-paquetes] Error inesperado al registrar el resultado', err);
    return { error: 'No se pudo registrar el resultado' };
  }
}

/** Quita una fotografía (baja lógica); con resultado registrado el backend exige conservar al menos una. */
export async function quitarSoporteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await autorizado())) return { error: 'No autorizado' };

  const parsed = quitarSoporteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'No se pudo identificar la fotografía' };

  try {
    await quitarSoporte(parsed.data.idSoporte);
  } catch (err) {
    if (isApiException(err)) return { error: err.error.message };
    console.error('[mis-paquetes] Error inesperado al quitar la fotografía', err);
    return { error: 'No se pudo quitar la fotografía' };
  }

  revalidarPortal();
  return { success: true };
}
