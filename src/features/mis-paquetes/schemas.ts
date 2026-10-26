import { z } from 'zod';
import { ESTADOS_PAQUETE } from '@/core/lib/domain/notificaciones';
import { paginationQuerySchema } from '@/core/lib/schemas/query';

/** Máximo de observaciones del resultado (`OBSERVACIONES_RESULTADO nvarchar(1000)`). */
export const MAX_OBSERVACIONES = 1000;
/** Resultados que registra el notificador (PRD 8; Por Notificar → Notificado | No entregado). */
export const RESULTADOS = ['NOTIFICADO', 'NO_ENTREGADO'] as const;
export type Resultado = (typeof RESULTADOS)[number];

const firstValue = (v: unknown) => (Array.isArray(v) ? v[0] : v);
const idPositivo = z.coerce.number().int().positive();

/** Query de "Mis paquetes": pestaña de estado (Abiertos por defecto: es lo que se trabaja hoy) y página. */
export const misPaquetesQuerySchema = paginationQuerySchema.extend({
  estado: z.preprocess(firstValue, z.enum(ESTADOS_PAQUETE)).catch('ABIERTO'),
});

export type MisPaquetesQuery = z.infer<typeof misPaquetesQuerySchema>;

/** Id del paquete en la ruta `/mis-paquetes/[idPaquete]`; inválido = 404 de la página. */
export const idPaqueteSchema = idPositivo;

/** Resultado de una notificación; la fecha y hora las pone el servidor (no se capturan). */
export const registrarResultadoSchema = z.object({
  idNotificacion: idPositivo,
  resultado: z.enum(RESULTADOS, { errorMap: () => ({ message: 'Selecciona el resultado' }) }),
  observaciones: z
    .string()
    .trim()
    .max(MAX_OBSERVACIONES, `Las observaciones no pueden exceder ${MAX_OBSERVACIONES} caracteres`)
    .optional()
    .transform((v) => (v ? v : undefined)),
  version: z.coerce.number().int().min(0),
});

export type RegistrarResultadoInput = z.infer<typeof registrarResultadoSchema>;

export const quitarSoporteSchema = z.object({ idSoporte: idPositivo });

/** Carga de una fotografía al route handler propio: notificación + archivo. */
export const subirSoporteSchema = z.object({
  idNotificacion: idPositivo,
  archivo: z.instanceof(File).refine((f) => f.size > 0, 'Selecciona una fotografía'),
});
