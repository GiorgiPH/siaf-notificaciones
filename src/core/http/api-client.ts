import 'server-only';
import { headers as requestHeaders } from 'next/headers';
import { getSession } from '@/core/auth/session';
import { getApiClientConfig, type ApiAuthStrategy, type ApiClientKey } from './api-client.config';
import { ApiException, apiErrorFromKind } from './api-error';
import { apiFetch, apiFetchBinary, type ApiBinaryResult, type ApiRequestOptions, type HttpMethod } from './api-fetch';
import { getClientIp } from './client-ip';
import type { ApiResponse } from './types';

export type { ApiBinaryResult, ApiQueryParams, ApiRequestOptions } from './api-fetch';

/**
 * Punto único de acceso HTTP a las APIs de negocio. Ninguna feature llama
 * `fetch` directo al backend — todo pasa por aquí, así se centralizan base
 * URL, access token de la sesión, IP del cliente, timeout, normalización de
 * errores (`ApiException` con `ApiError`) y el contrato `ApiResponse<T>`.
 *
 * Solo servidor: Server Components, Server Actions y route handlers. No
 * renueva el access token: eso lo hace `middleware.ts` antes de que caduque.
 */
export function apiClient(clientKey: ApiClientKey) {
  const send = async <T>(method: HttpMethod, path: string, body: unknown, opts?: ApiRequestOptions) => {
    const { authStrategy } = getApiClientConfig(clientKey);
    const [accessToken, clientIp] = await Promise.all([resolveAccessToken(authStrategy), resolveClientIp()]);
    const { data } = await apiFetch<T>(clientKey, method, path, { ...opts, body, accessToken, clientIp });
    return data;
  };

  return {
    get: <T>(path: string, opts?: ApiRequestOptions): Promise<ApiResponse<T>> => send<T>('GET', path, undefined, opts),
    post: <T>(path: string, body?: unknown, opts?: ApiRequestOptions): Promise<ApiResponse<T>> =>
      send<T>('POST', path, body, opts),
    put: <T>(path: string, body?: unknown, opts?: ApiRequestOptions): Promise<ApiResponse<T>> =>
      send<T>('PUT', path, body, opts),
    patch: <T>(path: string, body?: unknown, opts?: ApiRequestOptions): Promise<ApiResponse<T>> =>
      send<T>('PATCH', path, body, opts),
    delete: <T>(path: string, opts?: ApiRequestOptions): Promise<ApiResponse<T>> =>
      send<T>('DELETE', path, undefined, opts),
    /** Archivo binario en streaming (p. ej. imagen de soporte); solo para route handlers que lo reenvían. */
    getBinary: (path: string, opts?: ApiRequestOptions): Promise<ApiBinaryResult> =>
      sendBinary(clientKey, path, undefined, opts),
    /** Archivo binario generado con un cuerpo JSON (p. ej. reporte con filtros); solo para route handlers. */
    postBinary: (path: string, body: unknown, opts?: ApiRequestOptions): Promise<ApiBinaryResult> =>
      sendBinary(clientKey, path, body, opts),
  };
}

async function sendBinary(
  clientKey: ApiClientKey,
  path: string,
  body: unknown,
  opts?: ApiRequestOptions,
): Promise<ApiBinaryResult> {
  const { authStrategy } = getApiClientConfig(clientKey);
  const [accessToken, clientIp] = await Promise.all([resolveAccessToken(authStrategy), resolveClientIp()]);
  return apiFetchBinary(clientKey, path, { ...opts, body, accessToken, clientIp });
}

async function resolveAccessToken(strategy: ApiAuthStrategy): Promise<string | undefined> {
  if (strategy === 'none') return undefined;
  const session = await getSession();
  if (!session) {
    throw new ApiException(apiErrorFromKind('unauthorized', 401));
  }
  return session.accessToken;
}

async function resolveClientIp(): Promise<string | undefined> {
  return getClientIp(await requestHeaders());
}
