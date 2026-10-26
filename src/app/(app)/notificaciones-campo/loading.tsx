import { AppPageHeader } from '@/core/components/app-page-header';
import { Skeleton } from '@/core/components/ui/skeleton';
import { TableSkeleton } from '@/core/components/ui/table-skeleton';
import { COLUMNAS_BANDEJA, ESTATUS_TABS, NOTIFICACIONES_TITLE } from '@/features/notificaciones-campo/constants';

/** Misma estructura que la bandeja (header, tabs, filtros y tabla) para que la pantalla no brinque al cargar. */
export default function NotificacionesLoading() {
  return (
    <div className="flex min-h-full flex-col">
      <AppPageHeader title={NOTIFICACIONES_TITLE} />
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex flex-wrap gap-1">
          {ESTATUS_TABS.map(({ value }) => (
            <Skeleton key={value} className="h-9 w-32 rounded-2xl" />
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-full rounded-xl sm:w-72" />
          <Skeleton className="h-9 w-44 rounded-xl" />
        </div>
        <TableSkeleton columns={COLUMNAS_BANDEJA.length} headers={[...COLUMNAS_BANDEJA]} />
      </div>
    </div>
  );
}
