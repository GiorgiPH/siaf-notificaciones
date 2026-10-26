import type { AuthUser } from './types';

/**
 * Roles del catálogo `DBA_C_ROLES` que el front usa para mostrar opciones y
 * proteger rutas. Conveniencia de UI: el backend autoriza cada endpoint por su cuenta.
 */
export const ROLES = {
  admin: 'ROLE_ADMIN_SIAF',
  supervisor: 'ROLE_SUPERVISOR_SIAF',
  adminNotificaciones: 'ROLE_ADMIN_NOTIFICACIONES',
  notificador: 'ROLE_NOTIFICADOR',
} as const;

/** Quién opera el portal administrativo. `ROLE_ADMIN_SIAF` tiene todos los módulos en el backend. */
export const ADMIN_NOTIFICACIONES_ROLES: readonly Role[] = [ROLES.adminNotificaciones, ROLES.admin];

/** Quién usa el portal del notificador (`/mis-paquetes`): solo sus paquetes, el backend valida al dueño. */
export const NOTIFICADOR_ROLES: readonly Role[] = [ROLES.notificador];

export type Role = (typeof ROLES)[keyof typeof ROLES];

export function hasAnyRole(user: AuthUser, roles: readonly string[]): boolean {
  return roles.some((role) => user.roles.includes(role));
}
