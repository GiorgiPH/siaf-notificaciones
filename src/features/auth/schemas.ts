import { z } from 'zod';

/** Espejo de `LoginRequestDTO` del backend (mismos límites). */
export const loginSchema = z.object({
  usuario: z.string().trim().min(1, 'El usuario es obligatorio').max(24, 'El usuario no puede exceder 24 caracteres'),
  password: z.string().min(1, 'La contraseña es obligatoria').max(128, 'La contraseña no puede exceder 128 caracteres'),
  callbackUrl: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
