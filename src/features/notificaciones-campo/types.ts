import type { EstatusNotificacion } from './schemas';

/** Nivel de prioridad (catálogo del backend; A, B y C, con C por defecto). */
export interface Prioridad {
  readonly id: number;
  readonly clave: string;
  readonly nombre: string;
  readonly porDefecto: boolean;
}

/** Renglón de la bandeja (`BuscarNotificacionResponseDTO`). */
export interface NotificacionFila {
  readonly idRevision: number;
  /** Nulo mientras la notificación nunca se ha editado ni asignado. */
  readonly idNotificacion: number | null;
  readonly numeroOrden: string;
  readonly numeroOficio: string | null;
  /** `YYYY-MM-DD` */
  readonly fechaOficio: string | null;
  readonly metodo: string;
  readonly prioridad: Prioridad | null;
  readonly domicilio: string;
  readonly referencia: string | null;
  readonly corregido: boolean;
  readonly estatus: EstatusNotificacion;
  readonly idPaquete: number | null;
}

/** Datos para el modal de edición (`ConsultarNotificacionResponseDTO`). */
export interface NotificacionDetalle {
  readonly idRevision: number;
  readonly idNotificacion: number | null;
  readonly numeroOrden: string;
  readonly numeroOficio: string | null;
  readonly fechaOficio: string | null;
  readonly metodo: string;
  readonly idInsumo: string | null;
  readonly idBloque: string | null;
  readonly presuntiva: number | null;
  readonly prioridad: Prioridad | null;
  /** Domicilio con el que se emitió el oficio. */
  readonly domicilioOficio: string;
  /** Referencia de ubicación del padrón. */
  readonly referenciaOficio: string | null;
  readonly domicilio: string;
  readonly referencia: string | null;
  readonly estatus: EstatusNotificacion;
  readonly idPaquete: number | null;
  readonly editable: boolean;
  /** Nula si la notificación todavía no tiene registro. */
  readonly version: number | null;
}

/** Contadores de las tabs de estatus con los filtros de texto y fecha (`ContarNotificacionesResponseDTO`). */
export interface ConteoNotificaciones {
  readonly porAsignar: number;
  readonly porNotificar: number;
  readonly notificado: number;
  readonly noEntregado: number;
  readonly total: number;
}

export interface PaginaNotificaciones {
  readonly items: readonly NotificacionFila[];
  readonly total: number;
}
