import { z } from 'zod';

const ANIO_MINIMO = 2000;
const ANIO_MAXIMO = 2100;

/** `?anio=` del tablero. Inválido o ausente = el backend usa el año actual. */
export const tableroQuerySchema = z.object({
  anio: z
    .preprocess((v) => (Array.isArray(v) ? v[0] : v), z.coerce.number().int().min(ANIO_MINIMO).max(ANIO_MAXIMO).optional())
    .catch(undefined),
});

export type TableroQuery = z.infer<typeof tableroQuerySchema>;
