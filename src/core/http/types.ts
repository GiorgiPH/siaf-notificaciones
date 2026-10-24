/**
 * Contrato estándar de respuesta exitosa del backend SIAF (`ApiResponseDTO`).
 * Genérico por diseño — nunca duplicar esta interfaz por entidad. Los errores
 * no llegan con esta forma: el backend responde `ErrorResponse` con el código
 * HTTP real y `apiClient` lo normaliza a `ApiError`.
 */
export interface ApiResponse<T> {
  readonly data: T;
  readonly mensaje: string;
  readonly success: boolean;
  /** Total de registros (solo en consultas paginadas). */
  readonly count?: number;
  /** Desplazamiento de la página (solo en consultas paginadas). */
  readonly start?: number;
  /** Tamaño de página (solo en consultas paginadas). */
  readonly limit?: number;
}

export type ApiErrorKind =
  | 'validation' // 400, 422
  | 'unauthorized' // 401
  | 'forbidden' // 403
  | 'not-found' // 404
  | 'conflict' // 409
  | 'rate-limit' // 429
  | 'server' // 500, 502, 503
  | 'timeout'
  | 'network' // sin respuesta (DNS, conexión rechazada)
  | 'unknown';

export interface ApiFieldError {
  readonly field: string;
  readonly message: string;
}

/**
 * Error normalizado — todo lo que consume la app trabaja con esto, nunca con
 * un `Response` o un `TypeError` crudo de `fetch`. Es un objeto plano
 * (serializable), así que puede viajar de una Server Action al cliente.
 */
export interface ApiError {
  readonly kind: ApiErrorKind;
  readonly status: number | null; // null en timeout/network
  readonly message: string; // mensaje normalizado, seguro para mostrar en UI
  readonly fieldErrors?: readonly ApiFieldError[];
  /** Código estable del backend (`ErrorResponse.errorCode`), p. ej. `CREDENCIALES_INVALIDAS`. */
  readonly errorCode?: string;
  readonly requestId?: string;
}
