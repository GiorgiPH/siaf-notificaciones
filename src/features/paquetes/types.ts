import type { EstadoPaquete, EstatusNotificacion } from '@/core/lib/domain/notificaciones';

/** Notificaciones del paquete por resultado (`TotalesPaqueteDTO`, PRD 7.2 "Num. Órdenes"). */
export interface TotalesPaquete {
  readonly total: number;
  readonly notificado: number;
  readonly noEntregado: number;
  readonly porNotificar: number;
}

/** Renglón de la bandeja y respuesta del alta, edición e inicio (`BuscarPaqueteResponseDTO`). */
export interface PaqueteFila {
  /** Consecutivo del paquete (PRD 10). */
  readonly idPaquete: number;
  readonly idNotificador: number;
  /** Nombre para mostrar; nulo si el usuario ya no existe. */
  readonly notificador: string | null;
  /** `YYYY-MM-DD` */
  readonly fechaProgramada: string;
  /** `LocalDateTime` ISO */
  readonly fechaApertura: string | null;
  readonly fechaCierre: string | null;
  readonly estado: EstadoPaquete;
  /** Editar e iniciar solo aplican a un paquete Programado (PRD 7.5); lo decide el backend. */
  readonly editable: boolean;
  readonly version: number;
  readonly totales: TotalesPaquete;
}

/** Prioridad de la notificación (catálogo del backend). */
export interface PrioridadPaquete {
  readonly id: number;
  readonly clave: string;
  readonly nombre: string;
}

/** Notificación del paquete en su detalle (`NotificacionPaqueteDTO`, PRD 7.3). */
export interface NotificacionPaquete {
  readonly idRevision: number;
  readonly idNotificacion: number;
  readonly numeroOrden: string;
  readonly numeroOficio: string | null;
  /** `YYYY-MM-DD` */
  readonly fechaOficio: string | null;
  readonly prioridad: PrioridadPaquete | null;
  readonly domicilio: string;
  readonly referencia: string | null;
  readonly estatus: EstatusNotificacion;
  /** Fecha y hora de la notificación o de la visita; nula sin resultado. */
  readonly fechaResultado: string | null;
}

/** Detalle del paquete (`ConsultarPaqueteResponseDTO`). La ubicación en mapa queda en espera (ADR-004). */
export interface PaqueteDetalle {
  readonly paquete: PaqueteFila;
  readonly notificaciones: readonly NotificacionPaquete[];
}

/** Notificación Por Asignar de la lista "Num. Orden Disponibles" (`NotificacionDisponibleDTO`, PRD 7.1). */
export interface NotificacionDisponible {
  readonly idRevision: number;
  readonly numeroOrden: string;
  readonly numeroOficio: string | null;
  readonly fechaOficio: string | null;
  readonly prioridad: PrioridadPaquete | null;
  readonly domicilio: string;
}

/** Notificador habilitado del catálogo (`NotificadorDTO`). */
export interface Notificador {
  readonly idUsuario: number;
  readonly nombre: string;
}

/** Imagen de soporte activa (`SoporteNotificacionDTO`). El archivo lo sirve el route handler del portal. */
export interface SoportePaquete {
  readonly idSoporte: number;
  readonly idNotificacion: number;
  readonly idRevision: number;
  readonly nombreOriginal: string;
  readonly tipoMime: string;
  readonly tamano: number;
  readonly fechaAlta: string;
}

export interface PaginaPaquetes {
  readonly items: readonly PaqueteFila[];
  readonly total: number;
}

export interface PaginaDisponibles {
  readonly items: readonly NotificacionDisponible[];
  readonly total: number;
}
