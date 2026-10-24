/** Rutas que el flujo de sesión necesita conocer (middleware, guards, login). */
export const LOGIN_PATH = '/login';
export const HOME_PATH = '/inicio';
/** Route handler que borra la cookie local cuando el backend ya no acepta la sesión. */
export const SESSION_EXPIRED_PATH = '/sesion-expirada';

/** Módulos del portal. Deben coincidir con `DBA_C_MODULOS.URL` (ruta base de la API del módulo). */
export const NOTIFICACIONES_PATH = '/notificaciones-campo';
export const PAQUETES_PATH = '/paquetes';
export const MIS_PAQUETES_PATH = '/mis-paquetes';

/**
 * Pantallas que existen en este portal. `/auth/perfil` devuelve todos los módulos permitidos del SIAF
 * (`ROLE_ADMIN_SIAF` los tiene todos: Empleados, Usuarios…); el backend decide QUÉ puede ver el usuario y esta
 * lista decide QUÉ existe aquí. Un módulo nuevo del portal se registra también aquí.
 */
const PORTAL_MENU_URLS: ReadonlySet<string> = new Set([HOME_PATH, NOTIFICACIONES_PATH, PAQUETES_PATH, MIS_PAQUETES_PATH]);

export function isPortalMenuUrl(url: string): boolean {
  return PORTAL_MENU_URLS.has(url);
}

/** Solo rutas internas: evita open redirect con `callbackUrl=https://...` o `//dominio`. */
export function safeCallbackUrl(value: unknown): string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : HOME_PATH;
}
