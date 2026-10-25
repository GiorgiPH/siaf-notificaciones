'use client';

import { useEffect, useState } from 'react';
import { DateRangePicker } from '@/core/components/ui/date-range-picker';
import { SearchInput } from '@/core/components/ui/search-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import type { QueryPatch } from '@/core/lib/hooks/use-query-params';
import { NOTIFICADOR_TODOS, SEARCH_DEBOUNCE_MS } from '../constants';
import type { PaquetesQuery } from '../schemas';
import type { Notificador } from '../types';

interface PaquetesFiltersProps {
  query: PaquetesQuery;
  notificadores: readonly Notificador[];
  onChange: (patch: QueryPatch) => void;
}

/** Filtros de la bandeja (PRD 7.2): ID u orden/oficio, notificador y fechas programada, de apertura y de cierre. */
export function PaquetesFilters({ query, notificadores, onChange }: PaquetesFiltersProps) {
  const [texto, setTexto] = useState(query.q ?? '');

  useEffect(() => {
    if (texto.trim() === (query.q ?? '')) return;
    const timer = setTimeout(() => onChange({ q: texto.trim() }), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [texto, query.q, onChange]);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <SearchInput
        placeholder="Buscar por ID, número de orden u oficio..."
        value={texto}
        onChange={setTexto}
        className="w-full sm:w-72"
      />
      <Select
        value={query.notificador ? String(query.notificador) : NOTIFICADOR_TODOS}
        onValueChange={(valor) => onChange({ notificador: valor === NOTIFICADOR_TODOS ? undefined : valor })}
      >
        <SelectTrigger className="w-full sm:w-56" aria-label="Notificador">
          <SelectValue placeholder="Notificador" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NOTIFICADOR_TODOS}>Todos los notificadores</SelectItem>
          {notificadores.map((n) => (
            <SelectItem key={n.idUsuario} value={String(n.idUsuario)}>
              {n.nombre}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <DateRangePicker
        placeholder="Fecha programada"
        value={{ from: query.programadaDesde, to: query.programadaHasta }}
        onValueChange={({ from, to }) => onChange({ programadaDesde: from, programadaHasta: to })}
      />
      <DateRangePicker
        placeholder="Fecha de apertura"
        value={{ from: query.aperturaDesde, to: query.aperturaHasta }}
        onValueChange={({ from, to }) => onChange({ aperturaDesde: from, aperturaHasta: to })}
      />
      <DateRangePicker
        placeholder="Fecha de cierre"
        value={{ from: query.cierreDesde, to: query.cierreHasta }}
        onValueChange={({ from, to }) => onChange({ cierreDesde: from, cierreHasta: to })}
      />
    </div>
  );
}
