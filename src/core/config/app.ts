/** Identidad de la aplicación (pública, sin secretos). */
export const APP_NAME = 'SIAF Notificaciones';
export const APP_DESCRIPTION = 'Secretaría de Administración y Finanzas — Gobierno del Estado de Morelos';
/**
 * Clave del sistema en `DBA_C_SISTEMA`. Se manda en el login y el backend filtra con ella el menú y los permisos de la
 * sesión: solo reduce lo que el usuario ve y puede llamar, nunca da más de lo que sus roles permiten.
 */
export const APP_SISTEMA = 'SIAF_NOTIFICACIONES';
