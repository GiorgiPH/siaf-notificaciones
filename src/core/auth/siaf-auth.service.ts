import 'server-only';
import { APP_SISTEMA } from '@/core/config/app';
import { getServerEnv } from '@/core/config/env';
import { ApiException } from '@/core/http/api-error';
import { apiFetch } from '@/core/http/api-fetch';
import { toAuthUser, type SesionResponse, type SiafSession } from './types';

/** Endpoints `/auth/*` del backend SIAF (relativos a `API_INSTITUTIONAL_URL`). */
export const AUTH_PATHS = {
  login: '/auth/login',
  refresh: '/auth/refresh',
  logout: '/auth/logout',
  perfil: '/auth/perfil',
} as const;

const CLIENT = 'institutional';

/** Se renueva el access token cuando le queda menos que esto (el backend lo emite por 15 min). */
const REFRESH_MARGIN_MS = 60_000;

/**
 * Cuánto se recuerda "refresh viejo → sesión renovada", en múltiplos de la
 * vigencia del access nuevo. Cubre el caso en que la cookie renovada no llegó
 * al navegador (peticiones en paralelo, el render interno tras un `redirect()`
 * de una Server Action): cuando vuelve con la cookie vieja recibe la sesión
 * vigente en vez de reusar un refresh ya rotado, porque el backend revoca
 * toda la sesión si detecta reuso.
 */
const RENEWED_MEMORY_FACTOR = 2;
const MAX_CHAIN = 50;

export interface LoginCredentials {
  readonly usuario: string;
  readonly password: string;
}

/**
 * Inicia sesión en el sistema de este portal (`APP_SISTEMA`). Lanza `ApiException`: 401 credenciales o sin acceso a
 * este sistema (el mensaje del backend lo dice), 429 demasiados intentos, 400 datos.
 */
export async function loginSiaf(credentials: LoginCredentials, clientIp?: string): Promise<SiafSession> {
  const { data, headers } = await apiFetch<SesionResponse>(CLIENT, 'POST', AUTH_PATHS.login, {
    body: { ...credentials, sistema: APP_SISTEMA },
    clientIp,
  });
  const expiresAt = Date.now() + getServerEnv().SESSION_MAX_AGE_SECONDS * 1000;
  return toSiafSession(data.data, extractRefreshToken(headers), expiresAt);
}

export function needsRefresh(session: SiafSession): boolean {
  return session.accessExpiresAt - REFRESH_MARGIN_MS <= Date.now();
}

// TODO(infra): este estado vive en memoria del proceso. Con varias réplicas de
// Next hace falta afinidad de sesión o moverlo a un store compartido (Redis).
const inFlight = new Map<string, Promise<SiafSession>>();
const renewedBy = new Map<string, { readonly session: SiafSession; readonly until: number }>();

/**
 * Único punto de entrada para renovar el access token (equivale a
 * `refreshAccessToken()` + `shareReplay(1)` en Angular).
 * - Si esa sesión ya se renovó antes, devuelve la más reciente de la cadena
 *   (y solo la renueva si también está por vencer).
 * - Si hay un refresh en curso para ese refresh token, todas las llamadas
 *   comparten la misma promesa: N peticiones simultáneas, una sola llamada al backend.
 */
export function refreshSiaf(session: SiafSession, clientIp?: string): Promise<SiafSession> {
  const latest = latestKnown(session);
  if (latest !== session && !needsRefresh(latest)) return Promise.resolve(latest);

  const key = latest.refreshToken;
  const pending = inFlight.get(key);
  if (pending) return pending;

  const promise = requestRefresh(latest, clientIp)
    .then((renewed) => {
      pruneRenewed();
      const memoryMs = (renewed.accessExpiresAt - Date.now()) * RENEWED_MEMORY_FACTOR;
      renewedBy.set(key, { session: renewed, until: Date.now() + memoryMs });
      return renewed;
    })
    .finally(() => inFlight.delete(key));

  inFlight.set(key, promise);
  return promise;
}

/** Sigue la cadena refresh viejo → sesión renovada hasta la sesión más reciente conocida. */
function latestKnown(session: SiafSession): SiafSession {
  let current = session;
  for (let i = 0; i < MAX_CHAIN; i++) {
    const entry = renewedBy.get(current.refreshToken);
    if (!entry || entry.until <= Date.now()) break;
    current = entry.session;
  }
  return current;
}

/** Revoca la sesión en el backend. Best-effort: si falla, la sesión local se borra igual. */
export async function logoutSiaf(refreshToken: string, clientIp?: string): Promise<void> {
  try {
    await apiFetch<null>(CLIENT, 'POST', AUTH_PATHS.logout, {
      headers: { Cookie: refreshCookie(refreshToken) },
      clientIp,
    });
  } catch {
    // El usuario queda fuera en este navegador aunque el backend no responda.
  }
}

async function requestRefresh(session: SiafSession, clientIp?: string): Promise<SiafSession> {
  // Sin header Origin (petición servidor-a-servidor): el OrigenConfiableFilter del backend la permite.
  const { data, headers } = await apiFetch<SesionResponse>(CLIENT, 'POST', AUTH_PATHS.refresh, {
    headers: { Cookie: refreshCookie(session.refreshToken) },
    clientIp,
  });
  return toSiafSession(data.data, extractRefreshToken(headers), session.expiresAt);
}

function toSiafSession(sesion: SesionResponse, refreshToken: string, expiresAt: number): SiafSession {
  return {
    accessToken: sesion.accessToken,
    accessExpiresAt: Date.now() + sesion.expiraEnSegundos * 1000,
    refreshToken,
    expiresAt,
    user: toAuthUser(sesion.usuario),
  };
}

function refreshCookie(refreshToken: string): string {
  return `${getServerEnv().SIAF_REFRESH_COOKIE}=${refreshToken}`;
}

/** El backend manda el refresh token (rotado) en `Set-Cookie`; sin él la sesión no es renovable. */
function extractRefreshToken(headers: Headers): string {
  const prefix = `${getServerEnv().SIAF_REFRESH_COOKIE}=`;
  const value = headers
    .getSetCookie()
    .find((cookie) => cookie.startsWith(prefix))
    ?.slice(prefix.length)
    .split(';')[0];

  if (!value) {
    throw new ApiException({
      kind: 'server',
      status: null,
      message: 'El servidor no devolvió una sesión renovable. Revisa SIAF_REFRESH_COOKIE.',
    });
  }
  return value;
}

function pruneRenewed(): void {
  const now = Date.now();
  for (const [key, entry] of renewedBy) {
    if (entry.until <= now) renewedBy.delete(key);
  }
}
