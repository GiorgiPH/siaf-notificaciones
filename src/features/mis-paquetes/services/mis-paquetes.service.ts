import 'server-only';
import { MIS_PAQUETES_PATH } from '@/core/auth/routes';
import { apiClient, type ApiBinaryResult } from '@/core/http/api-client';
import { toPaginaRequest } from '@/core/lib/schemas/query';
import type { MisPaquetesQuery, RegistrarResultadoInput } from '../schemas';
import type {
  ConteoMisPaquetes,
  MiPaquete,
  MiPaqueteDetalle,
  PaginaMisPaquetes,
  ResultadoRegistrado,
  SoporteMio,
} from '../types';

/**
 * Endpoints del portal del notificador en SIAF-Backend (`DBA_C_MODULOS.URL = /mis-paquetes`). El dueño de los paquetes
 * sale del token: nunca se manda el id del notificador.
 */
const API = {
  buscar: `${MIS_PAQUETES_PATH}/buscarMisPaquetes`,
  contar: `${MIS_PAQUETES_PATH}/contarMisPaquetes`,
  consultar: (idPaquete: number) => `${MIS_PAQUETES_PATH}/consultarMiPaquete/${idPaquete}`,
  registrarResultado: `${MIS_PAQUETES_PATH}/registrarResultado`,
  subirSoporte: `${MIS_PAQUETES_PATH}/subirSoporte`,
  quitarSoporte: `${MIS_PAQUETES_PATH}/quitarSoporte`,
  soporte: (idSoporte: number) => `${MIS_PAQUETES_PATH}/descargarSoporte/${idSoporte}`,
} as const;

/** Paquetes propios de la pestaña, paginados (PRD 8). */
export async function listMisPaquetes(query: MisPaquetesQuery): Promise<PaginaMisPaquetes> {
  const { data, count } = await apiClient('institutional').post<MiPaquete[]>(API.buscar, {
    estado: query.estado,
    pagina: toPaginaRequest(query),
  });
  return { items: data, total: count ?? data.length };
}

export async function countMisPaquetes(): Promise<ConteoMisPaquetes> {
  const { data } = await apiClient('institutional').get<ConteoMisPaquetes>(API.contar);
  return data;
}

/** Paquete propio con sus notificaciones y fotografías; ajeno o inexistente = 404. */
export async function getMiPaquete(idPaquete: number): Promise<MiPaqueteDetalle> {
  const { data } = await apiClient('institutional').get<MiPaqueteDetalle>(API.consultar(idPaquete));
  return data;
}

export async function registrarResultado(input: RegistrarResultadoInput): Promise<ResultadoRegistrado> {
  const { data } = await apiClient('institutional').post<ResultadoRegistrado>(API.registrarResultado, input);
  return data;
}

/** Fotografía en multipart (`idNotificacion` + `archivo`); solo la usa el route handler de carga. */
export async function subirSoporte(form: FormData): Promise<SoporteMio> {
  const { data } = await apiClient('institutional').postForm<SoporteMio>(API.subirSoporte, form);
  return data;
}

export async function quitarSoporte(idSoporte: number): Promise<void> {
  await apiClient('institutional').post<null>(API.quitarSoporte, { idSoporte });
}

/** Imagen en streaming; solo la usa el route handler `mis-paquetes/soportes/[idSoporte]`. */
export async function getSoporteStream(idSoporte: number): Promise<ApiBinaryResult> {
  return apiClient('institutional').getBinary(API.soporte(idSoporte));
}
