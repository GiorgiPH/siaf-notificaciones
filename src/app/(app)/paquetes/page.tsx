import type { Metadata } from 'next';
import { ADMIN_NOTIFICACIONES_ROLES } from '@/core/auth/roles';
import { requireRole } from '@/core/auth/session';
import { AppPageHeader } from '@/core/components/app-page-header';
import { AlertBanner } from '@/core/components/ui/alert-banner';
import { isApiException } from '@/core/http/api-error';
import { PaquetesListView } from '@/features/paquetes/components/paquetes-list-view';
import { PAQUETES_TITLE } from '@/features/paquetes/constants';
import { paquetesQuerySchema } from '@/features/paquetes/schemas';
import {
  countPaquetes,
  getPaqueteById,
  listNotificadores,
  listPaquetes,
  listSoportes,
} from '@/features/paquetes/services/paquetes.service';

export const metadata: Metadata = { title: PAQUETES_TITLE };

interface PaquetesListPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Paquetes de notificaciones del portal administrativo (PRD 7): bandeja, alta, edición, inicio, detalle y soportes. */
export default async function PaquetesListPage({ searchParams }: PaquetesListPageProps) {
  await requireRole(...ADMIN_NOTIFICACIONES_ROLES);
  const query = paquetesQuerySchema.parse(await searchParams);
  const { paquete: idDetalle, editar: idEdicion } = query;

  let contenido: React.ReactNode;
  try {
    const [resultado, conteos, notificadores, detalle, edicion] = await Promise.all([
      listPaquetes(query),
      countPaquetes(query),
      listNotificadores(),
      idDetalle ? leer(() => leerDetalle(idDetalle)) : Promise.resolve(undefined),
      idEdicion ? leer(() => getPaqueteById(idEdicion)) : Promise.resolve(undefined),
    ]);
    const editable = edicion?.valor?.paquete.editable;
    contenido = (
      <PaquetesListView
        query={query}
        resultado={resultado}
        conteos={conteos}
        notificadores={notificadores}
        detalle={detalle?.valor}
        edicion={editable ? edicion?.valor : undefined}
        errorAbierto={
          detalle?.error ??
          edicion?.error ??
          (edicion?.valor && !editable ? 'El paquete ya se inició: solo se puede editar mientras está Programado' : undefined)
        }
      />
    );
  } catch (err) {
    if (!isApiException(err)) throw err;
    contenido = <AlertBanner variant="error">{err.error.message}</AlertBanner>;
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppPageHeader title={PAQUETES_TITLE} />
      <div className="flex flex-col gap-6 p-8">{contenido}</div>
    </div>
  );
}

async function leerDetalle(idPaquete: number) {
  const [paquete, soportes] = await Promise.all([getPaqueteById(idPaquete), listSoportes(idPaquete)]);
  return { paquete, soportes };
}

/** El paquete de la URL pudo dejar de existir: se avisa sin tumbar la bandeja. */
async function leer<T>(lectura: () => Promise<T>): Promise<{ valor?: T; error?: string }> {
  try {
    return { valor: await lectura() };
  } catch (err) {
    if (isApiException(err) && err.error.kind === 'not-found') return { error: err.error.message };
    throw err;
  }
}
