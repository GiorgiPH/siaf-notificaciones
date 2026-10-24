import { redirect } from 'next/navigation';
import { getPerfil } from '@/core/auth/perfil.service';
import { ADMIN_NOTIFICACIONES_ROLES, ROLES, hasAnyRole } from '@/core/auth/roles';
import { HOME_PATH, SESSION_EXPIRED_PATH, isPortalMenuUrl } from '@/core/auth/routes';
import { requireSession } from '@/core/auth/session';
import type { ModuloMenu, PerfilResponse } from '@/core/auth/types';
import { AppSidebar } from '@/core/components/app-sidebar';
import { SidebarShell } from '@/core/components/sidebar-shell';
import { isApiException } from '@/core/http/api-error';

/** El tablero siempre existe aunque el backend no lo registre como módulo. */
const HOME_ITEM: ModuloMenu = { nombre: 'Tablero', descripcion: null, url: HOME_PATH };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const perfil = await loadPerfil();
  // Solo las pantallas de este portal: los demás módulos del SIAF (Empleados, Usuarios…) no viven aquí.
  const modulos = perfil.menu.filter((m) => isPortalMenuUrl(m.url) && m.url !== HOME_PATH);
  // El notificador no tiene tablero: su inicio es "Mis paquetes".
  const soloNotificador =
    hasAnyRole(session.user, [ROLES.notificador]) && !hasAnyRole(session.user, ADMIN_NOTIFICACIONES_ROLES);
  const menu = soloNotificador ? modulos : [HOME_ITEM, ...modulos];

  return <SidebarShell sidebar={<AppSidebar menu={menu} user={session.user} />}>{children}</SidebarShell>;
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
