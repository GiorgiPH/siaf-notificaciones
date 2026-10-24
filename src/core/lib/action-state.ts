/**
 * Resultado estándar de toda Server Action que el cliente consume con
 * `useActionState`. Objeto plano y serializable: nunca devuelvas instancias
 * de clase (p.ej. `ApiException`) — devuelve su `message`/`fieldErrors`.
 */
export interface ActionState {
  error?: string;
  /** Errores por campo (de Zod o de `ApiError.fieldErrors`), indexados por `name` del input. */
  fieldErrors?: Record<string, string>;
  success?: boolean;
}
