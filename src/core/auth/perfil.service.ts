import 'server-only';
import { cache } from 'react';
import { apiClient } from '@/core/http/api-client';
import { AUTH_PATHS } from './siaf-auth.service';
import type { PerfilResponse } from './types';

/** Perfil del usuario y su menú filtrado por permisos (`DBA_E_ROLES_MODULOS`). Una llamada por request. */
export const getPerfil = cache(async (): Promise<PerfilResponse> => {
  const { data } = await apiClient('institutional').get<PerfilResponse>(AUTH_PATHS.perfil);
  return data;
});
