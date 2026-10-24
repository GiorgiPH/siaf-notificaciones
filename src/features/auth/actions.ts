'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { safeCallbackUrl } from '@/core/auth/routes';
import { setSessionCookie } from '@/core/auth/session';
import { loginSiaf } from '@/core/auth/siaf-auth.service';
import { fieldErrorsToRecord, isApiException } from '@/core/http/api-error';
import { getClientIp } from '@/core/http/client-ip';
import type { ActionState } from '@/core/lib/action-state';
import { loginSchema } from './schemas';

export interface LoginState extends ActionState {
  /** Se devuelve para no vaciar el campo cuando el login falla. */
  usuario?: string;
}

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  const usuario = typeof formData.get('usuario') === 'string' ? String(formData.get('usuario')) : '';

  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return { error: 'Revisa los campos marcados', fieldErrors, usuario };
  }

  const { callbackUrl, ...credentials } = parsed.data;
  try {
    const session = await loginSiaf(credentials, getClientIp(await headers()));
    await setSessionCookie(session);
  } catch (err) {
    if (isApiException(err)) {
      return { error: err.error.message, fieldErrors: fieldErrorsToRecord(err.error.fieldErrors), usuario };
    }
    console.error('[auth] Error inesperado en login', err);
    return { error: 'No se pudo iniciar sesión. Intenta de nuevo.', usuario };
  }

  redirect(safeCallbackUrl(callbackUrl));
}
