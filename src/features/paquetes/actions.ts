'use server';

import { revalidatePath } from 'next/cache';
import { ADMIN_NOTIFICACIONES_ROLES, hasAnyRole } from '@/core/auth/roles';
import { PAQUETES_PATH } from '@/core/auth/routes';
import { getSession } from '@/core/auth/session';
import { fieldErrorsToRecord, isApiException } from '@/core/http/api-error';
import type { ActionState } from '@/core/lib/action-state';
import { buscarDisponiblesSchema, guardarPaqueteSchema, iniciarPaqueteSchema } from './schemas';
import { createPaquete, iniciarPaquete, listDisponibles, updatePaquete } from './services/paquetes.service';
import type { PaginaDisponibles } from './types';

async function autorizado(): Promise<boolean> {
  const session = await getSession();
  return !!session && hasAnyRole(session.user, ADMIN_NOTIFICACIONES_ROLES);
}

/**
 * Alta o edición del paquete (PRD 7.1): `id` presente = edición, solo Programado. El backend vuelve a autorizar,
 * valida el máximo de notificaciones y que estén disponibles, y avisa por correo al notificador.
 */
export async function guardarPaqueteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await autorizado())) return { error: 'No autorizado' };

  const parsed = guardarPaqueteSchema.safeParse({
    ...Object.fromEntries(formData),
    idsRevision: formData.getAll('idsRevision'),
  });
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return { error: 'Revisa los campos marcados', fieldErrors };
  }

  const { id, version, ...datos } = parsed.data;
  if (id !== undefined && version === undefined) return { error: 'Actualiza la información e inténtalo de nuevo' };
  try {
    if (id !== undefined && version !== undefined) {
      await updatePaquete({ ...datos, idPaquete: id, version });
    } else {
      await createPaquete(datos);
    }
  } catch (err) {
    if (isApiException(err)) {
      return { error: err.error.message, fieldErrors: fieldErrorsToRecord(err.error.fieldErrors) };
    }
    console.error('[paquetes] Error inesperado al guardar', err);
    return { error: 'No se pudo guardar el paquete' };
  }

  revalidatePath(PAQUETES_PATH);
  return { success: true };
}

/** Inicia un paquete Programado: pasa a Abierto con su fecha de apertura (PRD 7.3). */
export async function iniciarPaqueteAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  if (!(await autorizado())) return { error: 'No autorizado' };

  const parsed = iniciarPaqueteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: 'No se pudo identificar el paquete' };

  try {
    await iniciarPaquete(parsed.data);
  } catch (err) {
    if (isApiException(err)) return { error: err.error.message };
    console.error('[paquetes] Error inesperado al iniciar', err);
    return { error: 'No se pudo iniciar el paquete' };
  }

  revalidatePath(PAQUETES_PATH);
  return { success: true };
}

export interface DisponiblesState {
  readonly resultado?: PaginaDisponibles;
  readonly error?: string;
}

/**
 * Lectura de la lista "Num. Orden Disponibles" mientras se arma el paquete (PRD 7.1). Es una action porque la
 * búsqueda cambia dentro del modal y un componente cliente nunca llama a la API de negocio.
 */
export async function buscarDisponiblesAction(texto: string): Promise<DisponiblesState> {
  if (!(await autorizado())) return { error: 'No autorizado' };

  const parsed = buscarDisponiblesSchema.safeParse({ texto });
  if (!parsed.success) return { error: 'La búsqueda no puede exceder 100 caracteres' };

  try {
    return { resultado: await listDisponibles(parsed.data.texto || undefined) };
  } catch (err) {
    if (isApiException(err)) return { error: err.error.message };
    console.error('[paquetes] Error inesperado al buscar disponibles', err);
    return { error: 'No se pudieron consultar las notificaciones disponibles' };
  }
}
