import type { VariantProps } from 'class-variance-authority';
import type { badgeVariants } from '@/core/components/ui/badge';

/**
 * Vocabulario de negocio que comparten las features de notificaciones en campo y de paquetes (una feature no importa de
 * otra): estatus de la notificación y estado del paquete, con su etiqueta y color de `Badge`.
 */
export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;

/** Únicos estados de una notificación (PRD 12.1). */
export const ESTATUS_NOTIFICACION = ['POR_ASIGNAR', 'POR_NOTIFICAR', 'NOTIFICADO', 'NO_ENTREGADO'] as const;
export type EstatusNotificacion = (typeof ESTATUS_NOTIFICACION)[number];

export const ESTATUS_NOTIFICACION_LABEL: Record<EstatusNotificacion, string> = {
  POR_ASIGNAR: 'Por Asignar',
  POR_NOTIFICAR: 'Por Notificar',
  NOTIFICADO: 'Notificado',
  NO_ENTREGADO: 'No entregado',
};

export const ESTATUS_NOTIFICACION_BADGE: Record<EstatusNotificacion, BadgeVariant> = {
  POR_ASIGNAR: 'info',
  POR_NOTIFICAR: 'warning',
  NOTIFICADO: 'success',
  NO_ENTREGADO: 'rose',
};

/** Estados del paquete (`DBA_M_PAQUETE_NOTIF.ESTADO`, PRD 12.2). */
export const ESTADOS_PAQUETE = ['PROGRAMADO', 'ABIERTO', 'CERRADO'] as const;
export type EstadoPaquete = (typeof ESTADOS_PAQUETE)[number];

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
