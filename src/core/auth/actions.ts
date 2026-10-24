'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getClientIp } from '@/core/http/client-ip';
import { LOGIN_PATH } from './routes';
import { clearSessionCookie, getSession } from './session';
import { logoutSiaf } from './siaf-auth.service';

/** Cierra la sesión en SIAF (revoca el refresh) y borra la cookie local. */
export async function logoutAction(): Promise<void> {
  const session = await getSession();
  if (session) {
    await logoutSiaf(session.refreshToken, getClientIp(await headers()));
  }
  await clearSessionCookie();
  redirect(LOGIN_PATH);
}
