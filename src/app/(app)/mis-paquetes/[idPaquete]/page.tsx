import type { Metadata } from 'next';
import Link from 'next/link';
import { NOTIFICADOR_ROLES } from '@/core/auth/roles';
import { MIS_PAQUETES_PATH } from '@/core/auth/routes';
import { requireRole } from '@/core/auth/session';
import { AppPageHeader } from '@/core/components/app-page-header';
import { AlertBanner } from '@/core/components/ui/alert-banner';
import { Button } from '@/core/components/ui/button';
import { isApiException } from '@/core/http/api-error';
import { MiPaqueteDetalleView } from '@/features/mis-paquetes/components/mi-paquete-detalle-view';
import { MIS_PAQUETES_TITLE } from '@/features/mis-paquetes/constants';
import { idPaqueteSchema } from '@/features/mis-paquetes/schemas';
import { getMiPaquete } from '@/features/mis-paquetes/services/mis-paquetes.service';

export const metadata: Metadata = { title: MIS_PAQUETES_TITLE };

/** Mensaje cuando el paquete no existe o es de otro notificador (el backend responde 404 en ambos casos). */
const NO_DISPONIBLE = 'El paquete no existe o no está asignado a ti.';

interface MiPaquetePageProps {
  params: Promise<{ idPaquete: string }>;
}

/** Detalle de un paquete propio (PRD 8): notificaciones, resultados y fotografías. */
export default async function MiPaquetePage({ params }: MiPaquetePageProps) {
  await requireRole(...NOTIFICADOR_ROLES);
  const id = idPaqueteSchema.safeParse((await params).idPaquete);

  let titulo = MIS_PAQUETES_TITLE;
  let contenido: React.ReactNode;
  if (!id.success) {
    contenido = <NoDisponible mensaje={NO_DISPONIBLE} />;
  } else {
    titulo = `Paquete #${id.data}`;
    try {
      contenido = <MiPaqueteDetalleView detalle={await getMiPaquete(id.data)} />;
    } catch (err) {
      if (!isApiException(err)) throw err;
      contenido = <NoDisponible mensaje={err.error.kind === 'not-found' ? NO_DISPONIBLE : err.error.message} />;
    }
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppPageHeader title={titulo} />
      <div className="flex flex-col gap-6 p-4 md:p-8">{contenido}</div>
    </div>
  );
}

function NoDisponible({ mensaje }: { mensaje: string }) {
  return (
    <>
      <AlertBanner variant="warning">{mensaje}</AlertBanner>
      <div>
        <Button asChild variant="outline">
          <Link href={MIS_PAQUETES_PATH}>Volver a mis paquetes</Link>
        </Button>
      </div>
    </>
  );
}
