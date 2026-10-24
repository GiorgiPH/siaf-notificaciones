import { NextResponse, type NextRequest } from 'next/server';
import { LOGIN_PATH } from '@/core/auth/routes';
import { SESSION_COOKIE } from '@/core/auth/session-crypto';

/**
 * Destino cuando el backend rechaza una sesión que localmente aún parece
 * válida (revocada desde otro lado, usuario inhabilitado). Un Server
 * Component no puede borrar cookies, así que redirige aquí.
 */
export function GET(req: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL(LOGIN_PATH, req.url));
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
