import { MIS_PAQUETES_PATH } from '@/core/auth/routes';
import type { EstadoPaquete } from '@/core/lib/domain/notificaciones';
import type { Resultado } from './schemas';
import type { ConteoMisPaquetes } from './types';

/** Título de la pantalla: lo comparten la página, su `loading.tsx` y la metadata. */
export const MIS_PAQUETES_TITLE = 'Mis paquetes';
export const MIS_PAQUETES_SUBTITLE = 'Paquetes asignados a ti';

/** Pestañas por estado (Abiertos primero: es lo que se trabaja en campo), con su contador. */
export const ESTADO_TABS: ReadonlyArray<{ value: EstadoPaquete; label: string; conteo: keyof ConteoMisPaquetes }> = [
  { value: 'ABIERTO', label: 'Abiertos', conteo: 'abierto' },
  { value: 'PROGRAMADO', label: 'Programados', conteo: 'programado' },
  { value: 'CERRADO', label: 'Cerrados', conteo: 'cerrado' },
];

/** Mensaje vacío de cada pestaña. */
export const VACIO_POR_ESTADO: Record<EstadoPaquete, { title: string; description: string }> = {
  ABIERTO: {
    title: 'No tienes paquetes abiertos',
    description: 'Cuando el administrador inicie uno de tus paquetes aparecerá aquí para registrar resultados.',
  },
  PROGRAMADO: {
    title: 'No tienes paquetes programados',
    description: 'Aquí verás los paquetes que te asignen antes de que inicien.',
  },
  CERRADO: {
    title: 'Aún no tienes paquetes cerrados',
    description: 'Un paquete se cierra solo cuando todas sus notificaciones tienen resultado.',
  },
};

/** Aviso del detalle según el estado (solo en Abierto se registra). */
export const AVISO_POR_ESTADO: Partial<Record<EstadoPaquete, string>> = {
  PROGRAMADO: 'Este paquete aún no inicia: podrás registrar resultados cuando el administrador lo inicie.',
  CERRADO: 'Paquete cerrado: todas sus notificaciones tienen resultado. Solo consulta.',
};

/** Pestañas locales del detalle. */
export const VISTA_POR_NOTIFICAR = 'por-notificar';
export const VISTA_CON_RESULTADO = 'con-resultado';

/** Opciones del resultado, con su explicación para el notificador. */
export const RESULTADO_OPCIONES: ReadonlyArray<{ value: Resultado; label: string; description: string }> = [
  { value: 'NOTIFICADO', label: 'Notificado', description: 'Se entregó la carta invitación.' },
  { value: 'NO_ENTREGADO', label: 'No entregado', description: 'Se visitó el domicilio y no fue posible entregarla.' },
];

/** Fotografías (RN-08): el backend valida de nuevo por contenido, tamaño y máximo. */
export const MAX_SOPORTES = 20;
export const MAX_TAMANO_SOPORTE_MB = 10;
export const TIPOS_SOPORTE = ['image/jpeg', 'image/png'] as const;
const BYTES_POR_MB = 1024 * 1024;
export const MAX_TAMANO_SOPORTE_BYTES = MAX_TAMANO_SOPORTE_MB * BYTES_POR_MB;

/** Rutas del portal y de sus route handlers (el navegador nunca llama a la API de negocio). */
export const miPaqueteUrl = (idPaquete: number) => `${MIS_PAQUETES_PATH}/${idPaquete}`;
export const soporteUrl = (idSoporte: number) => `${MIS_PAQUETES_PATH}/soportes/${idSoporte}`;
export const SUBIR_SOPORTE_URL = `${MIS_PAQUETES_PATH}/soportes`;
