import type { Metadata } from 'next';
import { NOTIFICADOR_ROLES } from '@/core/auth/roles';
import { requireRole } from '@/core/auth/session';
import { AppPageHeader } from '@/core/components/app-page-header';
import { AlertBanner } from '@/core/components/ui/alert-banner';
import { isApiException } from '@/core/http/api-error';
import { MisPaquetesListView } from '@/features/mis-paquetes/components/mis-paquetes-list-view';
import { MIS_PAQUETES_SUBTITLE, MIS_PAQUETES_TITLE } from '@/features/mis-paquetes/constants';
import { misPaquetesQuerySchema } from '@/features/mis-paquetes/schemas';
import { countMisPaquetes, listMisPaquetes } from '@/features/mis-paquetes/services/mis-paquetes.service';

export const metadata: Metadata = { title: MIS_PAQUETES_TITLE };

interface MisPaquetesListPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Portal del notificador (PRD 8): sus paquetes por estado, con su avance. */
export default async function MisPaquetesListPage({ searchParams }: MisPaquetesListPageProps) {
  await requireRole(...NOTIFICADOR_ROLES);
  const query = misPaquetesQuerySchema.parse(await searchParams);

  let contenido: React.ReactNode;
  try {
    const [resultado, conteos] = await Promise.all([listMisPaquetes(query), countMisPaquetes()]);
    contenido = <MisPaquetesListView query={query} resultado={resultado} conteos={conteos} />;
  } catch (err) {
    if (!isApiException(err)) throw err;
    contenido = <AlertBanner variant="error">{err.error.message}</AlertBanner>;
  }

  return (
    <div className="flex min-h-full flex-col">
      <AppPageHeader title={MIS_PAQUETES_TITLE} subtitle={MIS_PAQUETES_SUBTITLE} />
      <div className="flex flex-col gap-6 p-4 md:p-8">{contenido}</div>
    </div>
  );
}
