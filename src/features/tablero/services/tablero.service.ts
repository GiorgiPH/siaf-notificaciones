import 'server-only';
import { NOTIFICACIONES_PATH } from '@/core/auth/routes';
import { apiClient } from '@/core/http/api-client';
import type { ResumenTablero } from '../types';

/** El resumen cuelga del módulo de notificaciones del backend: lo autoriza el mismo `DBA_C_MODULOS.URL`. */
const RESUMEN_PATH = `${NOTIFICACIONES_PATH}/consultarResumen`;

/** Estadísticas del tablero; sin año, el backend usa el año actual. */
export async function getResumenTablero(anio?: number): Promise<ResumenTablero> {
  const { data } = await apiClient('institutional').get<ResumenTablero>(RESUMEN_PATH, { query: { anio } });
  return data;
}
