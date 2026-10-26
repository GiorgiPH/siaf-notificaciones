import { AppPageHeader } from '@/core/components/app-page-header';
import { Skeleton } from '@/core/components/ui/skeleton';
import { ESTADO_TABS, MIS_PAQUETES_SUBTITLE, MIS_PAQUETES_TITLE } from '@/features/mis-paquetes/constants';

const TARJETAS = 3;

/** Misma estructura que "Mis paquetes" (header, pestañas y tarjetas) para que la pantalla no brinque al cargar. */
export default function MisPaquetesLoading() {
  return (
    <div className="flex min-h-full flex-col">
      <AppPageHeader title={MIS_PAQUETES_TITLE} subtitle={MIS_PAQUETES_SUBTITLE} />
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-wrap gap-1">
          {ESTADO_TABS.map(({ value }) => (
            <Skeleton key={value} className="h-9 w-28 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: TARJETAS }, (_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
