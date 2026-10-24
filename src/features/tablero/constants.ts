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
