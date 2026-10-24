import type { VariantProps } from 'class-variance-authority';
import type { badgeVariants } from '@/core/components/ui/badge';
import { ESTATUS_TODOS, type EstatusNotificacion } from './schemas';
import type { ConteoNotificaciones, EstadoPaquete } from './types';

type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

export const ESTATUS_LABEL: Record<EstatusNotificacion, string> = {
  POR_ASIGNAR: 'Por Asignar',
  POR_NOTIFICAR: 'Por Notificar',
  NOTIFICADO: 'Notificado',
  NO_ENTREGADO: 'No entregado',
};

export const ESTATUS_BADGE: Record<EstatusNotificacion, BadgeVariant> = {
  POR_ASIGNAR: 'info',
  POR_NOTIFICAR: 'warning',
  NOTIFICADO: 'success',
  NO_ENTREGADO: 'rose',
};

/** La fecha del resultado es la de la notificación si se entregó y la de la visita si no (PRD 6.3, detalle). */
export const ETIQUETA_FECHA_RESULTADO: Record<EstatusNotificacion, string> = {
  POR_ASIGNAR: 'Fecha y hora de notificación',
  POR_NOTIFICAR: 'Fecha y hora de notificación',
  NOTIFICADO: 'Fecha y hora de notificación',
  NO_ENTREGADO: 'Fecha y hora de visita',
};

export const PAQUETE_ESTADO_LABEL: Record<EstadoPaquete, string> = {
  PROGRAMADO: 'Programado',
  ABIERTO: 'Abierto',
  CERRADO: 'Cerrado',
};

export const PAQUETE_ESTADO_BADGE: Record<EstadoPaquete, BadgeVariant> = {
  PROGRAMADO: 'slate',
  ABIERTO: 'warning',
  CERRADO: 'success',
};

/** Tabs del filtro de estatus, en el orden del flujo (PRD 12.3), con el campo de `ConteoNotificaciones` de su contador. */
export const ESTATUS_TABS: ReadonlyArray<{
  value: EstatusNotificacion | typeof ESTATUS_TODOS;
  label: string;
  conteo: keyof ConteoNotificaciones;
}> = [
  { value: 'POR_ASIGNAR', label: ESTATUS_LABEL.POR_ASIGNAR, conteo: 'porAsignar' },
  { value: 'POR_NOTIFICAR', label: ESTATUS_LABEL.POR_NOTIFICAR, conteo: 'porNotificar' },
  { value: 'NOTIFICADO', label: ESTATUS_LABEL.NOTIFICADO, conteo: 'notificado' },
  { value: 'NO_ENTREGADO', label: ESTATUS_LABEL.NO_ENTREGADO, conteo: 'noEntregado' },
  { value: ESTATUS_TODOS, label: 'Todas', conteo: 'total' },
];

/** Único estatus en que se corrigen domicilio, referencia y prioridad (PRD 6.3); el backend lo vuelve a validar. */
export const ESTATUS_EDITABLE: EstatusNotificacion = 'POR_ASIGNAR';

/** Color por clave de prioridad del catálogo; una clave nueva cae en neutro. */
const PRIORIDAD_BADGE: Readonly<Record<string, BadgeVariant>> = { A: 'rose', B: 'warning', C: 'slate' };

export function prioridadBadge(clave: string | undefined): BadgeVariant {
  return (clave && PRIORIDAD_BADGE[clave]) || 'slate';
}

/** Título de la pantalla: lo comparten la página, su `loading.tsx` y la metadata. */
export const NOTIFICACIONES_TITLE = 'Notificaciones';
/** Encabezados de la bandeja: la tabla y su skeleton de carga usan los mismos. */
export const COLUMNAS_BANDEJA = ['Num. Orden', 'Fecha Oficio', 'Domicilio', 'Estatus', 'Acciones'] as const;

/** Parámetro de la URL que abre el modal de la notificación (debe coincidir con `notificacionesQuerySchema`). */
export const DETALLE_PARAM = 'notificacion';
/** Espera antes de llevar la búsqueda a la URL (una navegación por pausa, no por tecla). */
export const SEARCH_DEBOUNCE_MS = 300;
