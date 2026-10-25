import 'server-only';
import { PAQUETES_PATH } from '@/core/auth/routes';
import { apiClient, type ApiBinaryResult } from '@/core/http/api-client';
import { toPaginaRequest } from '@/core/lib/schemas/query';
import { DISPONIBLES_POR_BUSQUEDA } from '../constants';
import {
  ESTADO_TODOS,
  type FormatoInforme,
  type GuardarPaqueteInput,
  type IniciarPaqueteInput,
  type PaquetesQuery,
} from '../schemas';
import type {
  ConteoPaquetes,
  NotificacionDisponible,
  Notificador,
  PaginaDisponibles,
  PaginaPaquetes,
  PaqueteDetalle,
  PaqueteFila,
  SoportePaquete,
} from '../types';

/** Endpoints del módulo en SIAF-Backend: cuelgan de su URL base (`DBA_C_MODULOS.URL`). */
const API = {
  buscar: `${PAQUETES_PATH}/buscarPaquetes`,
  contar: `${PAQUETES_PATH}/contarPaquetes`,
  consultar: (idPaquete: number) => `${PAQUETES_PATH}/consultarPaquete/${idPaquete}`,
  notificadores: `${PAQUETES_PATH}/listarNotificadores`,
  disponibles: `${PAQUETES_PATH}/buscarDisponibles`,
  registrar: `${PAQUETES_PATH}/registrarPaquete`,
  editar: `${PAQUETES_PATH}/editarPaquete`,
  iniciar: `${PAQUETES_PATH}/iniciarPaquete`,
  soportes: (idPaquete: number) => `${PAQUETES_PATH}/listarSoportes/${idPaquete}`,
  soporte: (idSoporte: number) => `${PAQUETES_PATH}/descargarSoporte/${idSoporte}`,
  ficha: (idPaquete: number) => `${PAQUETES_PATH}/generarFichaPaquete/${idPaquete}`,
  informe: `${PAQUETES_PATH}/generarReporteNotificaciones`,
} as const;

/** Filtros de la URL comunes a la búsqueda y a los contadores (todo menos el estado y la página). */
function filtros(query: PaquetesQuery) {
  return {
    texto: query.q,
    fechaProgramadaDesde: query.programadaDesde,
    fechaProgramadaHasta: query.programadaHasta,
    fechaAperturaDesde: query.aperturaDesde,
    fechaAperturaHasta: query.aperturaHasta,
    fechaCierreDesde: query.cierreDesde,
    fechaCierreHasta: query.cierreHasta,
    idNotificador: query.notificador,
  };
}

/** Bandeja paginada con los filtros de la URL (PRD 7.2). */
export async function listPaquetes(query: PaquetesQuery): Promise<PaginaPaquetes> {
  const { data, count } = await apiClient('institutional').post<PaqueteFila[]>(API.buscar, {
    ...filtros(query),
    estado: query.estado === ESTADO_TODOS ? undefined : query.estado,
    pagina: toPaginaRequest(query),
  });
  return { items: data, total: count ?? data.length };
}

/** Contadores de las pestañas "Tipo de operación": mismos filtros que la bandeja, sin el estado. */
export async function countPaquetes(query: PaquetesQuery): Promise<ConteoPaquetes> {
  const { data } = await apiClient('institutional').post<ConteoPaquetes>(API.contar, filtros(query));
  return data;
}

/** Detalle con sus notificaciones (PRD 7.3). */
export async function getPaqueteById(idPaquete: number): Promise<PaqueteDetalle> {
  const { data } = await apiClient('institutional').get<PaqueteDetalle>(API.consultar(idPaquete));
  return data;
}

export async function listNotificadores(): Promise<readonly Notificador[]> {
  const { data } = await apiClient('institutional').get<Notificador[]>(API.notificadores);
  return data;
}

/** Notificaciones Por Asignar para la lista dual (PRD 7.1); las ya asignadas nunca aparecen. */
export async function listDisponibles(texto: string | undefined): Promise<PaginaDisponibles> {
  const { data, count } = await apiClient('institutional').post<NotificacionDisponible[]>(API.disponibles, {
    texto,
    pagina: { start: 0, limit: DISPONIBLES_POR_BUSQUEDA },
  });
  return { items: data, total: count ?? data.length };
}

export async function createPaquete(input: Omit<GuardarPaqueteInput, 'id' | 'version'>): Promise<PaqueteFila> {
  const { data } = await apiClient('institutional').post<PaqueteFila>(API.registrar, {
    fechaProgramada: input.fechaProgramada,
    idNotificador: input.idNotificador,
    idsRevision: input.idsRevision,
  });
  return data;
}

export async function updatePaquete(
  input: Omit<GuardarPaqueteInput, 'id' | 'version'> & { idPaquete: number; version: number },
): Promise<PaqueteFila> {
  const { data } = await apiClient('institutional').post<PaqueteFila>(API.editar, input);
  return data;
}

export async function iniciarPaquete(input: IniciarPaqueteInput): Promise<PaqueteFila> {
  const { data } = await apiClient('institutional').post<PaqueteFila>(API.iniciar, input);
  return data;
}

export async function listSoportes(idPaquete: number): Promise<readonly SoportePaquete[]> {
  const { data } = await apiClient('institutional').get<SoportePaquete[]>(API.soportes(idPaquete));
  return data;
}

/** Imagen de un soporte en streaming; solo la usa el route handler `paquetes/soportes/[idSoporte]`. */
export async function getSoporteStream(idSoporte: number): Promise<ApiBinaryResult> {
  return apiClient('institutional').getBinary(API.soporte(idSoporte));
}

/**
 * Informe general de notificaciones (PDF o Excel, adjunto) con los filtros vigentes de la bandeja, sin paginación;
 * solo lo usa el route handler `paquetes/informe`.
 */
export async function getInformeStream(query: PaquetesQuery, formato: FormatoInforme): Promise<ApiBinaryResult> {
  return apiClient('institutional').postBinary(API.informe, {
    ...filtros(query),
    estado: query.estado === ESTADO_TODOS ? undefined : query.estado,
    formato,
  });
}

/** PDF de la ficha del paquete (adjunto); solo lo usa el route handler `paquetes/fichas/[idPaquete]`. */
export async function getFichaStream(idPaquete: number): Promise<ApiBinaryResult> {
  return apiClient('institutional').getBinary(API.ficha(idPaquete));
}
