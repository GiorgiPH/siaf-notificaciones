'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export type QueryPatch = Record<string, string | number | undefined>;

interface SetQueryOptions {
  /** Cambiar un filtro regresa a la página 1. Desactívalo para parámetros que no filtran (p. ej. abrir un modal). */
  readonly resetPage?: boolean;
}

/** Parámetro de página de los listados. */
export const PAGE_PARAM = 'page';

/**
 * Estado de listados en la URL (`searchParams`): compartible, sobrevive al refresh y lo lee el Server Component.
 * Un valor `undefined` o vacío borra el parámetro.
 */
export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return useCallback(
    (patch: QueryPatch, { resetPage = true }: SetQueryOptions = {}) => {
      const next = new URLSearchParams(params);
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === '') next.delete(key);
        else next.set(key, String(value));
      }
      if (resetPage && !(PAGE_PARAM in patch)) next.delete(PAGE_PARAM);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );
}
