import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_NOTIFICACIONES_ROLES, hasAnyRole, NOTIFICADOR_ROLES } from '@/core/auth/roles';
import {
  HOME_PATH,
  LOGIN_PATH,
  MIS_PAQUETES_PATH,
  NOTIFICACIONES_PATH,
  PAQUETES_PATH,
  SESSION_EXPIRED_PATH,
} from '@/core/auth/routes';
import { SESSION_COOKIE, sealSession, sessionCookieOptions, unsealSession } from '@/core/auth/session-crypto';
import { needsRefresh, refreshSiaf } from '@/core/auth/siaf-auth.service';
import { isApiException } from '@/core/http/api-error';
import { getClientIp } from '@/core/http/client-ip';
import type { SiafSession } from '@/core/auth/types';

/** Rutas que exigen un rol además de sesión. Conveniencia de UI: el backend autoriza cada endpoint. */
const ROLE_ROUTES: ReadonlyArray<{ readonly prefix: string; readonly roles: readonly string[] }> = [
  { prefix: NOTIFICACIONES_PATH, roles: ADMIN_NOTIFICACIONES_ROLES },
  { prefix: PAQUETES_PATH, roles: ADMIN_NOTIFICACIONES_ROLES },
  { prefix: MIS_PAQUETES_PATH, roles: NOTIFICADOR_ROLES },
];

/**
 * Guardia de sesión de toda la app (equivale a `authGuard` + `roleGuard` +
 * `authInterceptor` de Angular). Corre en Node (no Edge) porque descifra la
 * sesión y llama al backend.
 *
 * Es el ÚNICO lugar que renueva el access token: aquí sí se pueden escribir
 * cookies (en un Server Component no). Además reescribe el header `Cookie`
 * del request en curso para que la página vea la sesión renovada sin esperar
 * al siguiente request — así nunca se reusa un refresh token ya rotado.
 */
export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const sealed = req.cookies.get(SESSION_COOKIE)?.value;
  let session = sealed ? await unsealSession(sealed) : null;

  if (pathname === SESSION_EXPIRED_PATH) return NextResponse.next();

  if (pathname === LOGIN_PATH) {
    return session ? NextResponse.redirect(new URL(HOME_PATH, req.url)) : NextResponse.next();
  }

  if (!session) return redirectToLogin(req, Boolean(sealed));

  let renewedCookie: string | undefined;
  if (needsRefresh(session)) {
    const renewed = await tryRefresh(session, req);
    if (renewed === 'expired') return redirectToLogin(req, true);
    if (renewed) {
      session = renewed;
      renewedCookie = await sealSession(renewed);
      req.cookies.set(SESSION_COOKIE, renewedCookie);
    }
  }

  const rule = ROLE_ROUTES.find(({ prefix }) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const response =
    rule && !hasAnyRole(session.user, rule.roles)
      ? NextResponse.redirect(new URL(HOME_PATH, req.url))
      : NextResponse.next({ request: { headers: req.headers } });

  if (renewedCookie) response.cookies.set(SESSION_COOKIE, renewedCookie, sessionCookieOptions(session));
  return response;
}

/**
 * `'expired'` si el backend ya no acepta el refresh (401): la sesión se termina.
 * `null` si el backend no respondió (red, 5xx): se sigue con el access actual en
 * vez de sacar al usuario por una caída momentánea.
 */
async function tryRefresh(session: SiafSession, req: NextRequest): Promise<SiafSession | 'expired' | null> {
  try {
    return await refreshSiaf(session, getClientIp(req.headers));
  } catch (err) {
    if (isApiException(err) && (err.error.kind === 'unauthorized' || err.error.kind === 'forbidden')) {
      return 'expired';
    }
    console.error('[auth] No se pudo renovar la sesión', isApiException(err) ? err.error : err);
    return null;
  }
}

function redirectToLogin(req: NextRequest, clearCookie: boolean): NextResponse {
  const url = new URL(LOGIN_PATH, req.url);
  url.searchParams.set('callbackUrl', `${req.nextUrl.pathname}${req.nextUrl.search}`);
  const response = NextResponse.redirect(url);
  if (clearCookie) response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const config = {
  runtime: 'nodejs',
  // Fuera del guardia: estáticos.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|fonts/|.*\.(?:svg|png|jpg|jpeg|webp|ico|otf|woff2?)$).*)',
  ],
};
