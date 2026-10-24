/** Título de la pantalla: lo comparten la página, su `loading.tsx` y la metadata. */
export const TABLERO_TITLE = 'Tablero';

/**
 * Rejillas del tablero (skill `dashboard-view`). Las usan la página y su skeleton para que la carga tenga la misma
 * forma; clases completas para que Tailwind las detecte.
 */
export const TABLERO_GRID = {
  kpis: 'grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6',
  graficas: 'grid grid-cols-1 gap-6 lg:grid-cols-[minmax(280px,1fr)_2fr]',
  graficasPorAsignar: 'grid grid-cols-1 gap-6 lg:grid-cols-[2fr_minmax(280px,1fr)]',
} as const;
/** KPIs de la primera fila (el skeleton pinta los mismos). */
export const TOTAL_KPIS = 5;

/** Etiquetas del eje de "Notificadas por mes" (enero a diciembre, mismo índice que `notificadasPorMes`). */
export const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'] as const;

/** Rebanadas de la dona de estatus, en el orden del flujo (PRD 12.3). */
export const ESTATUS_TABLERO = [
  { key: 'porAsignar', label: 'Por asignar' },
  { key: 'porNotificar', label: 'Por notificar' },
  { key: 'notificado', label: 'Notificadas' },
  { key: 'noEntregado', label: 'No entregadas' },
] as const;

/** Parámetro de la URL con el año de la serie mensual. */
export const ANIO_PARAM = 'anio';
