import 'server-only';
import { z } from 'zod';

/**
 * Variables de entorno del servidor, validadas con Zod. Nada de aquí llega al
 * bundle del cliente (`server-only`). Lo que sí deba ser público va con
 * prefijo `NEXT_PUBLIC_` y nunca lleva secretos.
 *
 * Se valida en la primera lectura (no al importar) para que `next build` no
 * falle en entornos que todavía no definen las variables.
 */
const serverEnvSchema = z.object({
  /** Llave con la que se cifra la cookie de sesión. Distinta por entorno. */
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET debe tener al menos 32 caracteres'),
  /** Vigencia máxima de la sesión; espejo de `app.seguridad.sesion.maximo` del backend (12 h). */
  SESSION_MAX_AGE_SECONDS: z.coerce.number().int().positive().default(43200),
  /** Base del backend SIAF, incluye el context path (`/siaf`). */
  API_INSTITUTIONAL_URL: z.string().url('API_INSTITUTIONAL_URL debe ser una URL válida'),
  API_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),
  /** Nombre de la cookie del refresh token que pone el backend (`app.seguridad.sesion.cookie.nombre`). */
  SIAF_REFRESH_COOKIE: z.string().min(1).default('__Secure-rt'),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `- ${i.path.join('.')}: ${i.message}`).join('\n');
    throw new Error(`Variables de entorno inválidas (revisa .env.local, ver .env.example):\n${issues}`);
  }

  cached = parsed.data;
  return cached;
}
