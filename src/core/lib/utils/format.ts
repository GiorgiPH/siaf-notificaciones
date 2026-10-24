/** Formatos de presentación (es-MX). Las fechas del backend llegan como `YYYY-MM-DD` (`LocalDate`). */

const LOCALE = 'es-MX';
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/;

const dateFormatter = new Intl.DateTimeFormat(LOCALE, { day: '2-digit', month: '2-digit', year: 'numeric' });
const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
const currencyFormatter = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'MXN' });

/**
 * `YYYY-MM-DD` → `Date` local. `new Date('2026-10-15')` la interpreta en UTC y en México mostraría el día anterior.
 */
export function parseIsoDate(value: string): Date | undefined {
  const match = ISO_DATE.exec(value);
  if (!match) return undefined;
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

/** `Date` local → `YYYY-MM-DD`, el formato que esperan el backend y la URL. */
export function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

/** `2026-10-15` → `15/10/2026`; vacío o inválido → `—`. */
export function formatDate(value: string | null | undefined): string {
  const date = value ? parseIsoDate(value) : undefined;
  return date ? dateFormatter.format(date) : '—';
}

/** Fecha y hora del backend (`LocalDateTime` ISO) → `15/10/2026, 09:30`. */
export function formatDateTime(value: string | null | undefined): string {
  const date = value ? new Date(value) : undefined;
  return date && !Number.isNaN(date.getTime()) ? dateTimeFormatter.format(date) : '—';
}

export function formatCurrency(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : currencyFormatter.format(value);
}
