import { z } from 'zod';

/**
 * Espejo de `LoginResponseDTO` del backend (login y refresh responden lo mismo).
 * El refresh token NUNCA aparece aquí: llega en la cookie `Set-Cookie` y solo
 * lo maneja el servidor de Next (`siaf-auth.service.ts`).
 */
export interface SesionResponse {
  readonly accessToken: string;
  readonly tipoToken: string;
  readonly expiraEnSegundos: number;
  readonly usuario: UsuarioSesion;
}

/** Espejo de `UsuarioSesionDTO` del backend. */
export interface UsuarioSesion {
  readonly idUsuario: number;
  readonly usuario: string;
  readonly nombre: string;
  readonly roles: readonly string[];
}

/** Espejo de `ModuloMenuDTO`: un módulo de `DBA_C_MODULOS` al que el usuario tiene acceso. */
export interface ModuloMenu {
  readonly nombre: string;
  readonly descripcion: string | null;
  readonly url: string;
}

/** Espejo de `SistemaSesionDTO`: el sistema (`DBA_C_SISTEMA`) que declaró el login. */
export interface SistemaSesion {
  readonly clave: string;
  readonly nombre: string;
}

/** Espejo de `ConsultarPerfilResponseDTO` (`GET /auth/perfil`). */
export interface PerfilResponse {
  readonly idUsuario: number;
  readonly usuario: string;
  readonly nombre: string;
  readonly roles: readonly string[];
  readonly sistema: SistemaSesion;
  /** Módulos del sistema de la sesión permitidos al usuario, en el orden del menú del sistema. */
  readonly menu: readonly ModuloMenu[];
}

/**
 * Usuario de la sesión tal como lo consume la app (guards, UI de sesión).
 * Se desacopla del DTO del backend para que un cambio de nombres allá solo
 * toque `toAuthUser`.
 */
export const authUserSchema = z.object({
  id: z.number(),
  username: z.string(),
  displayName: z.string(),
  roles: z.array(z.string()),
});

export type AuthUser = z.infer<typeof authUserSchema>;

export function toAuthUser(usuario: UsuarioSesion): AuthUser {
  return {
    id: usuario.idUsuario,
    username: usuario.usuario,
    displayName: usuario.nombre,
    roles: [...usuario.roles],
  };
}

/**
 * Contenido de la cookie de sesión cifrada. Tiempos en epoch ms.
 * Validado con Zod al descifrar: si cambia la forma (deploy nuevo), la sesión
 * vieja se descarta en vez de romper.
 */
export const siafSessionSchema = z.object({
  accessToken: z.string().min(1),
  accessExpiresAt: z.number(),
  refreshToken: z.string().min(1),
  /** Vencimiento absoluto de la sesión; el refresh no lo extiende. */
  expiresAt: z.number(),
  user: authUserSchema,
});

export type SiafSession = z.infer<typeof siafSessionSchema>;
