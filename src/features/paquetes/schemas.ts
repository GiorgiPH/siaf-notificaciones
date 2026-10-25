import { z } from 'zod';
import { ESTADOS_PAQUETE } from '@/core/lib/domain/notificaciones';
import { paginationQuerySchema, queryDateSchema, queryTextSchema } from '@/core/lib/schemas/query';

/** Valor del filtro de estado que no filtra. */
export const ESTADO_TODOS = 'TODOS';
/** Pestañas del detalle del paquete. */
export const VISTA_NOTIFICACIONES = 'notificaciones';
export const VISTA_SOPORTES = 'soportes';

const MAX_BUSQUEDA = 100;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const firstValue = (v: unknown) => (Array.isArray(v) ? v[0] : v);
const queryIdSchema = z.preprocess(firstValue, z.coerce.number().int().positive().optional()).catch(undefined);

/**
 * Query params de la bandeja (PRD 7.2): búsqueda por ID u orden/oficio, rangos de fecha programada, de apertura y de
 * cierre, notificador, estado y página; `paquete` abre el detalle y `editar` la edición. ⚠️ El filtro "Tipo fecha
 * operación" no se incluye hasta que el área confirme sus valores (PRD 17).
 */
export const paquetesQuerySchema = paginationQuerySchema.extend({
  q: queryTextSchema(MAX_BUSQUEDA),
  programadaDesde: queryDateSchema,
  programadaHasta: queryDateSchema,
  aperturaDesde: queryDateSchema,
  aperturaHasta: queryDateSchema,
  cierreDesde: queryDateSchema,
  cierreHasta: queryDateSchema,
  notificador: queryIdSchema,
  estado: z
    .preprocess(firstValue, z.union([z.enum(ESTADOS_PAQUETE), z.literal(ESTADO_TODOS)]))
    .catch(ESTADO_TODOS),
  /** Paquete abierto en el detalle (solo lectura). */
  paquete: queryIdSchema,
  /** Paquete abierto en la edición (solo Programado; el backend lo vuelve a validar). */
  editar: queryIdSchema,
  /** Pestaña inicial del detalle: `soportes` abre directo las imágenes. */
  vista: z.preprocess(firstValue, z.literal(VISTA_SOPORTES).optional()).catch(undefined),
});

export type PaquetesQuery = z.infer<typeof paquetesQuerySchema>;

/**
 * Alta o edición del paquete (PRD 7.1): `id` presente = edición. Las órdenes llegan como varios `idsRevision` del
 * `FormData`. El máximo de notificaciones lo valida el backend (`app.paquetes.max-notificaciones`).
 */
export const guardarPaqueteSchema = z.object({
  id: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().positive().optional()),
  version: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.number().int().min(0).optional()),
  fechaProgramada: z.string().regex(ISO_DATE, 'La fecha programada es obligatoria'),
  idNotificador: z.coerce
    .number({ invalid_type_error: 'Selecciona el notificador' })
    .int()
    .positive('Selecciona el notificador'),
  idsRevision: z.array(z.coerce.number().int().positive()).min(1, 'Asigna al menos una notificación'),
});

export type GuardarPaqueteInput = z.infer<typeof guardarPaqueteSchema>;

/** Inicio del paquete (PRD 7.3): solo Programado; lleva la versión leída. */
export const iniciarPaqueteSchema = z.object({
  idPaquete: z.coerce.number().int().positive(),
  version: z.coerce.number().int().min(0),
});

export type IniciarPaqueteInput = z.infer<typeof iniciarPaqueteSchema>;

/** Búsqueda de la lista de disponibles (número de orden u oficio). */
export const buscarDisponiblesSchema = z.object({
  texto: z.string().trim().max(MAX_BUSQUEDA).optional(),
});
