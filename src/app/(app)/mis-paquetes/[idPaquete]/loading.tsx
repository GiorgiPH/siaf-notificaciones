import { AppPageHeader } from '@/core/components/app-page-header';
import { Skeleton } from '@/core/components/ui/skeleton';
import { MIS_PAQUETES_TITLE } from '@/features/mis-paquetes/constants';

const NOTIFICACIONES = 3;

/** Misma estructura que el detalle (datos, avance, pestañas y notificaciones). */
export default function MiPaqueteLoading() {
  return (
    <div className="flex min-h-full flex-col">
      <AppPageHeader title={MIS_PAQUETES_TITLE} />
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <Skeleton className="h-8 w-36 rounded-xl" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-9 w-64 rounded-2xl" />
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {Array.from({ length: NOTIFICACIONES }, (_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
