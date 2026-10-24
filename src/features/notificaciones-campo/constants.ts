import type { VariantProps } from 'class-variance-authority';
import type { badgeVariants } from '@/core/components/ui/badge';
import { ESTATUS_TODOS, type EstatusNotificacion } from './schemas';
import type { ConteoNotificaciones } from './types';

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

/** Color por clave de prioridad del catálogo; una clave nueva cae en neutro. */
const PRIORIDAD_BADGE: Readonly<Record<string, BadgeVariant>> = { A: 'rose', B: 'warning', C: 'slate' };

export function prioridadBadge(clave: string | undefined): BadgeVariant {
  return (clave && PRIORIDAD_BADGE[clave]) || 'slate';
}

/** Parámetro de la URL que abre el modal de edición. */
export const EDITAR_PARAM = 'editar';
/** Espera antes de llevar la búsqueda a la URL (una navegación por pausa, no por tecla). */
export const SEARCH_DEBOUNCE_MS = 300;
