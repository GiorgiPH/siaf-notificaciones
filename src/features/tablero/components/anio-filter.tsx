'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import { useQueryParams } from '@/core/lib/hooks/use-query-params';
import { ANIO_PARAM } from '../constants';

interface AnioFilterProps {
  value: number;
  options: readonly number[];
}

/**
 * Año de "Notificadas por mes". Las gráficas del DS no tienen slot de acciones (gap documentado en la skill
 * `dashboard-view`): se compone encima de la gráfica y el año viaja en la URL para que la página lo vuelva a pedir.
 */
export function AnioFilter({ value, options }: AnioFilterProps) {
  const setParams = useQueryParams();

  return (
    <Select value={String(value)} onValueChange={(anio) => setParams({ [ANIO_PARAM]: anio }, { resetPage: false })}>
      <SelectTrigger size="sm" className="w-28" aria-label="Año">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((anio) => (
          <SelectItem key={anio} value={String(anio)}>
            {anio}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
