import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { hasAnyRole } from './roles';
import { HOME_PATH, LOGIN_PATH } from './routes';
import { SESSION_COOKIE, sealSession, sessionCookieOptions, unsealSession } from './session-crypto';
import type { SiafSession } from './types';

/**
 * Sesión del request actual (Server Components, Server Actions, route
 * handlers). Memoizada por request con `cache()`. Para cuando llega aquí, el
 * middleware ya renovó el access token si estaba por vencer.
 */
export const getSession = cache(async (): Promise<SiafSession | null> => {
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  return value ? unsealSession(value) : null;
});

/** Para páginas y acciones que exigen sesión. Equivalente a `authGuard`. */
export async function requireSession(): Promise<SiafSession> {
  const session = await getSession();
  if (!session) redirect(LOGIN_PATH);
  return session;
}

/** Equivalente a `roleGuard`: conveniencia de UI, el backend sigue autorizando. */
export async function requireRole(...roles: readonly string[]): Promise<SiafSession> {
  const session = await requireSession();
  if (!hasAnyRole(session.user, roles)) redirect(HOME_PATH);
  return session;
}

/** Solo desde Server Actions o route handlers (los Server Components no pueden escribir cookies). */
export async function setSessionCookie(session: SiafSession): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, await sealSession(session), sessionCookieOptions(session));
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
