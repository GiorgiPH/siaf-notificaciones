import { z } from 'zod';

/** Tamaño de página de los listados (el backend acepta 1 a 100). */
export const PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

/**
 * Valor de `searchParams` (puede venir repetido) → primer valor. La URL nunca es confiable: todo esquema de query
 * usa `.catch(...)` para caer al valor por defecto en vez de reventar la página.
 */
const firstValue = (value: unknown) => (Array.isArray(value) ? value[0] : value);

/** Texto libre opcional, recortado; vacío = sin filtro. */
export const queryTextSchema = (max: number) =>
  z.preprocess(
    firstValue,
    z
      .string()
      .trim()
      .max(max)
      .optional()
      .transform((value) => (value ? value : undefined)),
  ).catch(undefined);

/** Fecha `YYYY-MM-DD` opcional. */
export const queryDateSchema = z
  .preprocess(firstValue, z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional())
  .catch(undefined);

export const paginationQuerySchema = z.object({
  page: z.preprocess(firstValue, z.coerce.number().int().min(1)).catch(1),
  limit: z.preprocess(firstValue, z.coerce.number().int().min(1).max(MAX_PAGE_SIZE)).catch(PAGE_SIZE),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

/** Página 1-based de la URL → `PaginaRequestDTO` del backend (`start` = desplazamiento). */
export function toPaginaRequest({ page, limit }: PaginationQuery): { start: number; limit: number } {
  return { start: (page - 1) * limit, limit };
}
