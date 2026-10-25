import 'server-only';
import { getApiClientConfig, type ApiClientKey } from './api-client.config';
import { ApiException, apiErrorFromResponse, apiErrorFromThrown } from './api-error';
import type { ApiResponse } from './types';

export type ApiQueryParams = Record<string, string | number | boolean | undefined>;
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestOptions {
  readonly query?: ApiQueryParams;
  readonly headers?: Record<string, string>;
  /** Caché de Next para lecturas (`{ revalidate, tags }`). Por defecto no se cachea. */
  readonly next?: NextFetchRequestConfig;
}

export interface ApiFetchOptions extends ApiRequestOptions {
  readonly body?: unknown;
  readonly accessToken?: string;
  readonly clientIp?: string;
}

export interface ApiFetchResult<T> {
  readonly data: ApiResponse<T>;
  readonly headers: Headers;
}

/**
 * Nivel bajo de `apiClient`: no lee la sesión ni la request (por eso sirve
 * también en `middleware.ts`) y devuelve los headers de la respuesta. Uso
 * exclusivo de `core/` (`core/auth` necesita el `Set-Cookie` del refresh
 * token); las features usan `apiClient`.
 */
export async function apiFetch<T>(
  clientKey: ApiClientKey,
  method: HttpMethod,
  path: string,
  opts: ApiFetchOptions = {},
): Promise<ApiFetchResult<T>> {
  const config = getApiClientConfig(clientKey);
  const hasBody = opts.body !== undefined;

  let res: Response;
  try {
    res = await fetch(buildUrl(config.baseUrl, path, opts.query), {
      method,
      headers: {
        Accept: 'application/json',
        ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
        ...(opts.accessToken ? { Authorization: `Bearer ${opts.accessToken}` } : {}),
        ...(opts.clientIp ? { 'X-Forwarded-For': opts.clientIp } : {}),
        ...opts.headers,
      },
      body: hasBody ? JSON.stringify(opts.body) : undefined,
      signal: AbortSignal.timeout(config.timeoutMs),
      ...(opts.next ? { next: opts.next } : { cache: 'no-store' }),
    });
  } catch (err) {
    throw new ApiException(apiErrorFromThrown(err));
  }

  if (!res.ok) {
    throw new ApiException(await apiErrorFromResponse(res));
  }

  // TODO(backend): validar el shape con Zod si algún endpoint no respeta ApiResponseDTO.
  return { data: (await res.json()) as ApiResponse<T>, headers: res.headers };
}

export interface ApiBinaryResult {
  readonly body: ReadableStream<Uint8Array>;
  readonly headers: Headers;
}

/**
 * Como `apiFetch`, pero para respuestas binarias (p. ej. imágenes de soporte): devuelve el cuerpo en streaming sin
 * leerlo a memoria. Los errores siguen llegando como `ApiResponseDTO` y se normalizan igual.
 */
export async function apiFetchBinary(
  clientKey: ApiClientKey,
  path: string,
  opts: ApiFetchOptions = {},
): Promise<ApiBinaryResult> {
  const config = getApiClientConfig(clientKey);

  let res: Response;
  try {
    res = await fetch(buildUrl(config.baseUrl, path, opts.query), {
      method: 'GET',
      headers: {
        ...(opts.accessToken ? { Authorization: `Bearer ${opts.accessToken}` } : {}),
        ...(opts.clientIp ? { 'X-Forwarded-For': opts.clientIp } : {}),
        ...opts.headers,
      },
      signal: AbortSignal.timeout(config.timeoutMs),
      cache: 'no-store',
    });
  } catch (err) {
    throw new ApiException(apiErrorFromThrown(err));
  }

  if (!res.ok || !res.body) {
    throw new ApiException(await apiErrorFromResponse(res));
  }
  return { body: res.body, headers: res.headers };
}

function buildUrl(baseUrl: string, path: string, query?: ApiQueryParams): string {
  const url = new URL(`${baseUrl.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) url.searchParams.set(key, String(value));
  }
  return url.toString();
}
