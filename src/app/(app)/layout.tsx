import { redirect } from 'next/navigation';
import { getPerfil } from '@/core/auth/perfil.service';
import { SESSION_EXPIRED_PATH } from '@/core/auth/routes';
import { requireSession } from '@/core/auth/session';
import type { PerfilResponse } from '@/core/auth/types';
import { AppSidebar } from '@/core/components/app-sidebar';
import { SidebarShell } from '@/core/components/sidebar-shell';
import { isApiException } from '@/core/http/api-error';

/**
 * El menú es exactamente el que devuelve `/auth/perfil`: el backend ya lo filtra por el sistema de la sesión
 * (`DBA_E_SISTEMA_MODULO`) y por los roles del usuario, y lo entrega en el orden del sistema.
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const perfil = await loadPerfil();

  return <SidebarShell sidebar={<AppSidebar menu={perfil.menu} user={session.user} />}>{children}</SidebarShell>;
}

async function loadPerfil(): Promise<PerfilResponse> {
  try {
    return await getPerfil();
  } catch (err) {
    // El backend ya no acepta la sesión (revocada, usuario inhabilitado): se limpia la cookie local.
    if (isApiException(err) && err.error.kind === 'unauthorized') redirect(SESSION_EXPIRED_PATH);
    throw err;
  }
}
