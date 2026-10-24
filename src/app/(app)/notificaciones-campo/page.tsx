import type { Metadata } from 'next';
import { ADMIN_NOTIFICACIONES_ROLES } from '@/core/auth/roles';
import { requireRole } from '@/core/auth/session';
import { AppPageHeader } from '@/core/components/app-page-header';
import { AlertBanner } from '@/core/components/ui/alert-banner';
import { isApiException } from '@/core/http/api-error';
import { NotificacionesListView } from '@/features/notificaciones-campo/components/notificaciones-list-view';
import { notificacionesQuerySchema } from '@/features/notificaciones-campo/schemas';
import {
  countNotificaciones,
  getNotificacion,
  listNotificaciones,
  listPrioridades,
} from '@/features/notificaciones-campo/services/notificaciones-campo.service';
import type { NotificacionDetalle } from '@/features/notificaciones-campo/types';

export const metadata: Metadata = { title: 'Notificaciones' };

interface NotificacionesListPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function NotificacionesListPage({ searchParams }: NotificacionesListPageProps) {
  await requireRole(...ADMIN_NOTIFICACIONES_ROLES);
  const query = notificacionesQuerySchema.parse(await searchParams);

  let contenido: React.ReactNode;
  try {
    const [resultado, conteos, prioridades, edicion] = await Promise.all([
      listNotificaciones(query),
      countNotificaciones(query),
      listPrioridades(),
      query.editar ? leerEdicion(query.editar) : Promise.resolve(undefined),
    ]);
    contenido = (
      <NotificacionesListView
        query={query}
        resultado={resultado}
        conteos={conteos}
        prioridades={prioridades}
        enEdicion={edicion?.detalle}
        errorEdicion={edicion?.error}
      />
    );
  } catch (err) {
    if (!isApiException(err)) throw err;
    contenido = <AlertBanner variant="error">{err.error.message}</AlertBanner>;
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppPageHeader title="Notificaciones" />
      <div className="flex flex-col gap-6 p-8">{contenido}</div>
    </div>
  );
}

/** La orden pudo salir de la bandeja entre que se listó y se abrió: se avisa sin tumbar el listado. */
async function leerEdicion(idRevision: number): Promise<{ detalle?: NotificacionDetalle; error?: string }> {
  try {
    return { detalle: await getNotificacion(idRevision) };
  } catch (err) {
    if (isApiException(err) && err.error.kind === 'not-found') return { error: err.error.message };
    throw err;
  }
}
