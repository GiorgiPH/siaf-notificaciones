import { ESTADOS_PAQUETE, PAQUETE_ESTADO_LABEL, type EstadoPaquete } from '@/core/lib/domain/notificaciones';
import { ESTADO_TODOS } from './schemas';

/** Título de la pantalla: lo comparten la página, su `loading.tsx` y la metadata. */
export const PAQUETES_TITLE = 'Paquetes';

/** Encabezados de la bandeja (PRD 7.2): la tabla y su skeleton de carga usan los mismos. */
export const COLUMNAS_BANDEJA = ['Paquete', 'Notificador', 'Fechas', 'Num. Órdenes', 'Acciones'] as const;

/**
 * Encabezados de las notificaciones en el detalle (PRD 7.3). La columna de ubicación en mapa se agrega aquí cuando se
 * libere ADR-004 (en espera); el domicilio se muestra como texto.
 */
export const COLUMNAS_DETALLE = ['Num. Orden', 'Fecha Oficio', 'Domicilio', 'Estatus', 'Soportes'] as const;

/** Tabs de estado del paquete (PRD 12.2). */
export const ESTADO_TABS: ReadonlyArray<{ value: EstadoPaquete | typeof ESTADO_TODOS; label: string }> = [
  { value: ESTADO_TODOS, label: 'Todos' },
  ...ESTADOS_PAQUETE.map((estado) => ({ value: estado, label: PAQUETE_ESTADO_LABEL[estado] })),
];

/** Parámetros de la URL que abren el detalle y la edición (deben coincidir con `paquetesQuerySchema`). */
export const DETALLE_PARAM = 'paquete';
export const EDITAR_PARAM = 'editar';
export const VISTA_PARAM = 'vista';

/** Valor del filtro de notificador que no filtra. */
export const NOTIFICADOR_TODOS = 'todos';

/** Espera antes de llevar la búsqueda a la URL o al backend (una petición por pausa, no por tecla). */
export const SEARCH_DEBOUNCE_MS = 300;
/** Notificaciones disponibles que trae cada búsqueda de la lista dual (el backend acepta hasta 100). */
export const DISPONIBLES_POR_BUSQUEDA = 100;

/** Ruta del route handler que sirve las imágenes de soporte (el navegador nunca las pide a la API). */
export const soporteUrl = (idSoporte: number) => `/paquetes/soportes/${idSoporte}`;
