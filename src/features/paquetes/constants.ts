import type { EstadoPaquete } from '@/core/lib/domain/notificaciones';
import { ESTADO_TODOS, type FormatoInforme, type PaquetesQuery } from './schemas';
import type { ConteoPaquetes } from './types';

/** Título de la pantalla: lo comparten la página, su `loading.tsx` y la metadata. */
export const PAQUETES_TITLE = 'Paquetes';

/** Encabezados de la bandeja (PRD 7.2): la tabla y su skeleton de carga usan los mismos. */
export const COLUMNAS_BANDEJA = ['Paquete', 'Notificador', 'Fechas', 'Num. Órdenes', 'Acciones'] as const;

/**
 * Encabezados de las notificaciones en el detalle (PRD 7.3). La columna de ubicación en mapa se agrega aquí cuando se
 * libere ADR-004 (en espera); el domicilio se muestra como texto.
 */
export const COLUMNAS_DETALLE = ['Num. Orden', 'Fecha Oficio', 'Domicilio', 'Estatus', 'Soportes'] as const;

/**
 * Filtro "Tipo de operación" de la bandeja (PRD 7.2), confirmado por el área: el estado del paquete (PRD 12.2), con el
 * campo de `ConteoPaquetes` de su contador.
 */
export const ESTADO_TABS: ReadonlyArray<{
  value: EstadoPaquete | typeof ESTADO_TODOS;
  label: string;
  conteo: keyof ConteoPaquetes;
}> = [
  { value: ESTADO_TODOS, label: 'Todos', conteo: 'total' },
  { value: 'PROGRAMADO', label: 'Programados', conteo: 'programado' },
  { value: 'ABIERTO', label: 'Abiertos', conteo: 'abierto' },
  { value: 'CERRADO', label: 'Cerrados', conteo: 'cerrado' },
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

/** Ruta del route handler que descarga la ficha del paquete en PDF (PRD 7.3 "Imp. Ficha"). */
export const fichaUrl = (idPaquete: number) => `/paquetes/fichas/${idPaquete}`;
/** Texto de la acción, igual que en el aplicativo legado (PRD 7.3). */
export const IMP_FICHA_LABEL = 'Imp. Ficha';

/** Informe general de notificaciones (PRD 7.2, antes "Inf. Num. Órdenes Gral."): botón y opciones de formato. */
export const INFORME_LABEL = 'Informe de notificaciones';
export const INFORME_FORMATOS: ReadonlyArray<{ value: FormatoInforme; label: string }> = [
  { value: 'PDF', label: 'PDF' },
  { value: 'XLSX', label: 'Excel' },
];
/** Parámetros de la URL de la bandeja que son filtros (el informe ignora página, detalle y edición). */
const FILTROS_INFORME = [
  'q',
  'programadaDesde',
  'programadaHasta',
  'aperturaDesde',
  'aperturaHasta',
  'cierreDesde',
  'cierreHasta',
  'notificador',
  'estado',
] as const satisfies ReadonlyArray<keyof PaquetesQuery>;

/** Ruta del route handler que descarga el informe con los filtros vigentes de la bandeja. */
export function informeUrl(query: PaquetesQuery, formato: FormatoInforme): string {
  const params = new URLSearchParams({ formato });
  for (const clave of FILTROS_INFORME) {
    const valor = query[clave];
    if (valor !== undefined && valor !== '') params.set(clave, String(valor));
  }
  return `/paquetes/informe?${params.toString()}`;
}
