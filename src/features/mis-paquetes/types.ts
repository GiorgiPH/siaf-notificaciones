import type { EstadoPaquete, EstatusNotificacion } from '@/core/lib/domain/notificaciones';

/** Totales del paquete por resultado (los calcula el backend). */
export interface TotalesMiPaquete {
  readonly total: number;
  readonly notificado: number;
  readonly noEntregado: number;
  readonly porNotificar: number;
}

/** Paquete asignado al notificador (`BuscarPaqueteResponseDTO`). Fechas ISO; nulas mientras no ocurren. */
export interface MiPaquete {
  readonly idPaquete: number;
  readonly fechaProgramada: string;
  readonly fechaApertura: string | null;
  readonly fechaCierre: string | null;
  readonly estado: EstadoPaquete;
  readonly totales: TotalesMiPaquete;
}

export interface PaginaMisPaquetes {
  readonly items: readonly MiPaquete[];
  readonly total: number;
}

/** Contadores de las pestañas (mismo contrato que la bandeja administrativa). */
export interface ConteoMisPaquetes {
  readonly programado: number;
  readonly abierto: number;
  readonly cerrado: number;
  readonly total: number;
}

export interface PrioridadNotificacion {
  readonly id: number;
  readonly clave: string;
  readonly nombre: string;
}

/** Fotografía activa de una notificación; la imagen se pide al route handler propio, nunca a la API. */
export interface SoporteMio {
  readonly idSoporte: number;
  readonly idNotificacion: number;
  readonly nombreOriginal: string;
  readonly fechaAlta: string;
}

/** Notificación del paquete vista por su notificador (`NotificacionDeNotificadorDTO`). */
export interface MiNotificacion {
  readonly idNotificacion: number;
  readonly idRevision: number;
  readonly numeroOrden: string;
  readonly numeroOficio: string | null;
  readonly fechaOficio: string | null;
  readonly prioridad: PrioridadNotificacion | null;
  readonly domicilio: string;
  readonly referencia: string | null;
  readonly estatus: EstatusNotificacion;
  readonly fechaResultado: string | null;
  readonly observaciones: string | null;
  readonly version: number;
  readonly soportes: readonly SoporteMio[];
}

export interface MiPaqueteDetalle {
  readonly paquete: MiPaquete;
  readonly notificaciones: readonly MiNotificacion[];
}

/** Efecto del resultado: `paqueteCerrado` = era el último (cierre automático, RN-09). */
export interface ResultadoRegistrado {
  readonly idNotificacion: number;
  readonly estadoPaquete: EstadoPaquete;
  readonly paqueteCerrado: boolean;
}
