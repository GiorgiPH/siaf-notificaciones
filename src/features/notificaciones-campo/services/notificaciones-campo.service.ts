import 'server-only';
import { NOTIFICACIONES_PATH } from '@/core/auth/routes';
import { apiClient } from '@/core/http/api-client';
import { toPaginaRequest } from '@/core/lib/schemas/query';
import { ESTATUS_TODOS, type EditarNotificacionInput, type NotificacionesQuery } from '../schemas';
import type {
  ConteoNotificaciones,
  NotificacionDetalle,
  NotificacionFila,
  PaginaNotificaciones,
  Prioridad,
} from '../types';

/** Endpoints del módulo en SIAF-Backend: cuelgan de su URL base (`DBA_C_MODULOS.URL`). */
const API = {
  buscar: `${NOTIFICACIONES_PATH}/buscarNotificaciones`,
  contar: `${NOTIFICACIONES_PATH}/contarNotificaciones`,
  consultar: (idRevision: number) => `${NOTIFICACIONES_PATH}/consultarNotificacion/${idRevision}`,
  editar: `${NOTIFICACIONES_PATH}/editarNotificacion`,
  prioridades: `${NOTIFICACIONES_PATH}/listarPrioridades`,
} as const;

/** Bandeja paginada con los filtros de la URL (PRD 6.2). */
export async function listNotificaciones(query: NotificacionesQuery): Promise<PaginaNotificaciones> {
  const { data, count } = await apiClient('institutional').post<NotificacionFila[]>(API.buscar, {
    texto: query.q,
    fechaOficioDesde: query.desde,
    fechaOficioHasta: query.hasta,
    estatus: query.estatus === ESTATUS_TODOS ? undefined : query.estatus,
    pagina: toPaginaRequest(query),
  });
  return { items: data, total: count ?? data.length };
}

/** Contadores de las tabs de estatus: mismos filtros de texto y fecha que la bandeja, sin el estatus. */
export async function countNotificaciones(query: NotificacionesQuery): Promise<ConteoNotificaciones> {
  const { data } = await apiClient('institutional').post<ConteoNotificaciones>(API.contar, {
    texto: query.q,
    fechaOficioDesde: query.desde,
    fechaOficioHasta: query.hasta,
  });
  return data;
}

export async function getNotificacion(idRevision: number): Promise<NotificacionDetalle> {
  const { data } = await apiClient('institutional').get<NotificacionDetalle>(API.consultar(idRevision));
  return data;
}

export async function listPrioridades(): Promise<readonly Prioridad[]> {
  const { data } = await apiClient('institutional').get<Prioridad[]>(API.prioridades);
  return data;
}

/** Corrige domicilio, referencia y prioridad (solo Por Asignar). No actualiza el padrón del SIAF. */
export async function updateNotificacion(input: EditarNotificacionInput): Promise<NotificacionDetalle> {
  const { data } = await apiClient('institutional').post<NotificacionDetalle>(API.editar, input);
  return data;
}
