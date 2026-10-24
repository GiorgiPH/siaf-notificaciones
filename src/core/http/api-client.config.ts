import 'server-only';
import { getServerEnv } from '@/core/config/env';

/**
 * `bearer`: adjunta el access token de la sesión (`Authorization: Bearer`).
 * `none`: endpoint público (login, refresh — este último autentica con la cookie del refresh).
 */
export type ApiAuthStrategy = 'bearer' | 'none';

export interface ApiClientConfig {
  readonly baseUrl: string;
  readonly authStrategy: ApiAuthStrategy;
  readonly timeoutMs: number;
}

/** Una clave por API consumida. Un typo en la clave es error de compilación. */
export type ApiClientKey = 'institutional';

export function getApiClientConfig(key: ApiClientKey): ApiClientConfig {
  const env = getServerEnv();

  const configs: Record<ApiClientKey, ApiClientConfig> = {
    institutional: { baseUrl: env.API_INSTITUTIONAL_URL, authStrategy: 'bearer', timeoutMs: env.API_TIMEOUT_MS },
  };

  return configs[key];
}
