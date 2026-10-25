import { z } from 'zod';
import { ESTATUS_NOTIFICACION, type EstatusNotificacion } from '@/core/lib/domain/notificaciones';
import { paginationQuerySchema, queryDateSchema, queryTextSchema } from '@/core/lib/schemas/query';

export const estatusNotificacionSchema = z.enum(ESTATUS_NOTIFICACION);

/** Valor del filtro de estatus que no filtra. */
export const ESTATUS_TODOS = 'TODOS';
/** La bandeja abre en "Por Asignar" (PRD 6.2). */
export const ESTATUS_POR_DEFECTO: EstatusNotificacion = 'POR_ASIGNAR';

const MAX_BUSQUEDA = 100;
const MAX_DOMICILIO = 1000;

/** Query params de la bandeja: búsqueda, rango de fecha del oficio, estatus, página y notificación abierta. */
export const notificacionesQuerySchema = paginationQuerySchema.extend({
  q: queryTextSchema(MAX_BUSQUEDA),
  desde: queryDateSchema,
  hasta: queryDateSchema,
  estatus: z
    .preprocess((v) => (Array.isArray(v) ? v[0] : v), z.union([estatusNotificacionSchema, z.literal(ESTATUS_TODOS)]))
    .catch(ESTATUS_POR_DEFECTO),
  /** `idRevision` de la notificación abierta en el modal (edición si está Por Asignar, si no, solo lectura). */
  notificacion: z.preprocess((v) => (Array.isArray(v) ? v[0] : v), z.coerce.number().int().positive().optional()).catch(
    undefined,
  ),
});

export type NotificacionesQuery = z.infer<typeof notificacionesQuerySchema>;

/** Edición de datos de campo (PRD 6.3). Misma validación que el backend (`EditarNotificacionRequestDTO`). */
export const editarNotificacionSchema = z.object({
  idRevision: z.coerce.number().int().positive(),
  domicilio: z
    .string()
    .trim()
    .min(1, 'El domicilio es obligatorio')
    .max(MAX_DOMICILIO, 'El domicilio no puede exceder 1000 caracteres'),
  referencia: z
    .string()
    .trim()
    .max(MAX_DOMICILIO, 'La referencia no puede exceder 1000 caracteres')
    .optional()
    .transform((value) => (value ? value : undefined)),
  idPrioridad: z.coerce.number({ invalid_type_error: 'Selecciona la prioridad' }).int().positive('Selecciona la prioridad'),
  /** Ausente en la primera edición (la notificación aún no tiene registro). */
  version: z.preprocess((v) => (v === '' || v === null ? undefined : v), z.coerce.number().int().min(0).optional()),
});

export type EditarNotificacionInput = z.infer<typeof editarNotificacionSchema>;
