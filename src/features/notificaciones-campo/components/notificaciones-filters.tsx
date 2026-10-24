'use client';

import { useEffect, useState } from 'react';
import { DateRangePicker } from '@/core/components/ui/date-range-picker';
import { SearchInput } from '@/core/components/ui/search-input';
import type { QueryPatch } from '@/core/lib/hooks/use-query-params';
import { SEARCH_DEBOUNCE_MS } from '../constants';
import type { NotificacionesQuery } from '../schemas';

interface NotificacionesFiltersProps {
  query: NotificacionesQuery;
  onChange: (patch: QueryPatch) => void;
}

/** Búsqueda por número de orden u oficio y rango de fecha del oficio (PRD 6.2). */
export function NotificacionesFilters({ query, onChange }: NotificacionesFiltersProps) {
  const [texto, setTexto] = useState(query.q ?? '');

  useEffect(() => {
    if (texto.trim() === (query.q ?? '')) return;
    const timer = setTimeout(() => onChange({ q: texto.trim() }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [texto, query.q, onChange]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchInput
        placeholder="Buscar por número de orden u oficio..."
        value={texto}
        onChange={setTexto}
        className="w-full sm:w-72"
      />
      <DateRangePicker
        placeholder="Fecha del oficio"
        value={{ from: query.desde, to: query.hasta }}
        onValueChange={({ from, to }) => onChange({ desde: from, hasta: to })}
      />
    </div>
  );
}
