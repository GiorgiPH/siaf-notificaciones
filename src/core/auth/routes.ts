/** Rutas que el flujo de sesión necesita conocer (middleware, guards, login). */
export const LOGIN_PATH = '/login';
export const HOME_PATH = '/inicio';
/** Route handler que borra la cookie local cuando el backend ya no acepta la sesión. */
export const SESSION_EXPIRED_PATH = '/sesion-expirada';

/**
 * Módulos del portal. Deben coincidir con `DBA_C_MODULOS.URL` (ruta base de la API del módulo). Qué módulos aparecen
 * en el menú lo decide el backend (`DBA_E_SISTEMA_MODULO` + roles); estas constantes solo son las rutas de la API y de
 * las páginas.
 */
export const NOTIFICACIONES_PATH = '/notificaciones-campo';
export const PAQUETES_PATH = '/paquetes';
export const MIS_PAQUETES_PATH = '/mis-paquetes';

/** Solo rutas internas: evita open redirect con `callbackUrl=https://...` o `//dominio`. */
export function safeCallbackUrl(value: unknown): string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : HOME_PATH;
}
