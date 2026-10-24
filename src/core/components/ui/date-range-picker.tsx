'use client';

import * as React from 'react';
import { CalendarDays, X } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Button } from '@/core/components/ui/button';
import { Calendar } from '@/core/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/core/components/ui/popover';
import { cn } from '@/core/lib/utils/cn';
import { formatDate, parseIsoDate, toIsoDate } from '@/core/lib/utils/format';

export interface IsoDateRange {
  /** `YYYY-MM-DD` */
  readonly from?: string;
  /** `YYYY-MM-DD` */
  readonly to?: string;
}

interface DateRangePickerProps {
  value: IsoDateRange;
  onValueChange: (value: IsoDateRange) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Filtro de rango de fechas para barras de filtros. Gap del DS: no existe DatePicker/DateRangePicker. Es una
 * composición del patrón "date picker" de shadcn con piezas del DS (`Popover` + `Calendar` en modo rango + `Button`),
 * sin estilos propios. Si el DS publica su componente, este archivo se reemplaza por el oficial.
 */
export function DateRangePicker({ value, onValueChange, placeholder = 'Rango de fechas', className }: DateRangePickerProps) {
  const selected: DateRange | undefined = value.from
    ? { from: parseIsoDate(value.from), to: value.to ? parseIsoDate(value.to) : undefined }
    : undefined;
  const hasValue = Boolean(value.from || value.to);
  const label = !hasValue
    ? placeholder
    : value.from && value.to
      ? `${formatDate(value.from)} – ${formatDate(value.to)}`
      : value.from
        ? `Desde ${formatDate(value.from)}`
        : `Hasta ${formatDate(value.to)}`;

  const handleSelect = (range: DateRange | undefined) => {
    onValueChange({
      from: range?.from ? toIsoDate(range.from) : undefined,
      to: range?.to ? toIsoDate(range.to) : undefined,
    });
  };

  return (
    <div className={cn('flex items-center gap-1', className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn(!hasValue && 'text-content-low')}>
            <CalendarDays />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="range" selected={selected} onSelect={handleSelect} numberOfMonths={2} />
        </PopoverContent>
      </Popover>
      {hasValue && (
        <Button size="icon" variant="ghost" aria-label="Quitar filtro de fechas" onClick={() => onValueChange({})}>
          <X />
        </Button>
      )}
    </div>
  );
}
