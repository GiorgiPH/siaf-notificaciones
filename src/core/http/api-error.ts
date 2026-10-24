import type { ApiError, ApiErrorKind, ApiFieldError } from './types';

const STATUS_KIND_MAP: Record<number, ApiErrorKind> = {
  400: 'validation',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not-found',
  409: 'conflict',
  422: 'validation',
  429: 'rate-limit',
  500: 'server',
  502: 'server',
  503: 'server',
};

const DEFAULT_MESSAGES: Record<ApiErrorKind, string> = {
  validation: 'Los datos enviados no son válidos.',
  unauthorized: 'Tu sesión expiró. Inicia sesión nuevamente.',
  forbidden: 'No tienes permisos para realizar esta acción.',
  'not-found': 'El recurso solicitado no existe.',
  conflict: 'La operación no se pudo completar por un conflicto con el estado actual.',
  'rate-limit': 'Demasiadas solicitudes. Espera un momento e intenta de nuevo.',
  server: 'Ocurrió un error en el servidor. Intenta más tarde.',
  timeout: 'La solicitud tardó demasiado. Intenta de nuevo.',
  network: 'No se pudo conectar con el servidor. Verifica tu conexión.',
  unknown: 'Ocurrió un error inesperado.',
};

/**
 * Lo que lanza `apiClient`. Envuelve el `ApiError` normalizado para que se
 * pueda usar con `try/catch` y con los `error.tsx` de Next. Para devolverlo
 * desde una Server Action, regresa `err.error` (objeto plano), no la instancia.
 */
export class ApiException extends Error {
  constructor(readonly error: ApiError) {
    super(error.message);
    this.name = 'ApiException';
  }
}

export function isApiException(err: unknown): err is ApiException {
  return err instanceof ApiException;
}

export function apiErrorFromKind(kind: ApiErrorKind, status: number | null = null): ApiError {
  return { kind, status, message: DEFAULT_MESSAGES[kind] };
}

/**
 * Convierte una respuesta HTTP no-ok en `ApiError`. Shape esperado: `ErrorResponse`
 * del backend SIAF (`message`, `errorCode`, `requestId`, `validationErrors`).
 * Parseo deliberadamente tolerante: si el shape no calza, cae a un mensaje genérico.
 */
export async function apiErrorFromResponse(res: Response): Promise<ApiError> {
  const kind = STATUS_KIND_MAP[res.status] ?? 'unknown';
  const body = await readJsonSafely(res);
  const backendMessage = body && typeof body['message'] === 'string' ? body['message'] : undefined;
  const fieldErrors = extractFieldErrors(body);
  const requestId = body && typeof body['requestId'] === 'string' ? body['requestId'] : undefined;
  const errorCode = body && typeof body['errorCode'] === 'string' ? body['errorCode'] : undefined;

  return {
    kind,
    status: res.status,
    message: backendMessage ?? DEFAULT_MESSAGES[kind],
    ...(fieldErrors ? { fieldErrors } : {}),
    ...(requestId ? { requestId } : {}),
    ...(errorCode ? { errorCode } : {}),
  };
}

/** Aplana `fieldErrors` a `{ campo: primerMensaje }`, la forma que usan `ActionState` y `Field`. */
export function fieldErrorsToRecord(fieldErrors: readonly ApiFieldError[] | undefined): Record<string, string> | undefined {
  if (!fieldErrors?.length) return undefined;
  const record: Record<string, string> = {};
  for (const { field, message } of fieldErrors) {
    record[field] ??= message;
  }
  return record;
}

/** Errores lanzados por `fetch` (no hubo respuesta): timeout o red. */
export function apiErrorFromThrown(err: unknown): ApiError {
  if (isApiException(err)) return err.error;
  if (isRecord(err) && (err['name'] === 'TimeoutError' || err['name'] === 'AbortError')) {
    return apiErrorFromKind('timeout');
  }
  if (err instanceof TypeError) return apiErrorFromKind('network');
  return apiErrorFromKind('unknown');
}

async function readJsonSafely(res: Response): Promise<Record<string, unknown> | undefined> {
  try {
    const json: unknown = await res.json();
    return isRecord(json) ? json : undefined;
  } catch {
    return undefined;
  }
}

/**
 * El backend envía `validationErrors` como objeto campo → mensajes
 * (`{ "usuario": ["El usuario es obligatorio"] }`); se aplana a un
 * `ApiFieldError` por mensaje.
 */
function extractFieldErrors(body: Record<string, unknown> | undefined): readonly ApiFieldError[] | undefined {
  const raw = body ? body['validationErrors'] : undefined;
  if (!isRecord(raw) || Array.isArray(raw)) return undefined;
  const parsed: ApiFieldError[] = Object.entries(raw).flatMap(([field, messages]) =>
    Array.isArray(messages)
      ? messages
          .filter((message): message is string => typeof message === 'string')
          .map((message) => ({ field, message }))
      : [],
  );
  return parsed.length ? parsed : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
