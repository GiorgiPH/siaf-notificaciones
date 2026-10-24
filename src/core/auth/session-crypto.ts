import 'server-only';
import { createHash } from 'node:crypto';
import { EncryptJWT, jwtDecrypt } from 'jose';
import { getServerEnv } from '@/core/config/env';
import { siafSessionSchema, type SiafSession } from './types';

/**
 * Cifrado de la cookie de sesión (JWE `dir` + `A256GCM`): el navegador la
 * guarda pero no puede leer ni alterar su contenido (access token, refresh
 * token, usuario). Sin dependencias de `next/headers`, para que el middleware
 * también la use.
 */
export const SESSION_COOKIE = 'siaf_session';

let cachedKey: Uint8Array | undefined;

function getKey(): Uint8Array {
  cachedKey ??= new Uint8Array(createHash('sha256').update(getServerEnv().SESSION_SECRET).digest());
  return cachedKey;
}

export async function sealSession(session: SiafSession): Promise<string> {
  return new EncryptJWT({ session })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(session.expiresAt / 1000))
    .encrypt(getKey());
}

/** Devuelve `null` si la cookie no descifra, venció o no tiene la forma esperada. */
export async function unsealSession(value: string): Promise<SiafSession | null> {
  try {
    const { payload } = await jwtDecrypt(value, getKey());
    const parsed = siafSessionSchema.safeParse(payload['session']);
    if (!parsed.success || parsed.data.expiresAt <= Date.now()) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export interface SessionCookieOptions {
  httpOnly: true;
  secure: boolean;
  sameSite: 'lax';
  path: '/';
  expires: Date;
}

export function sessionCookieOptions(session: SiafSession): SessionCookieOptions {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(session.expiresAt),
  };
}
