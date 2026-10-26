import { AppPageHeader } from '@/core/components/app-page-header';
import { Skeleton } from '@/core/components/ui/skeleton';
import { TABLERO_GRID, TABLERO_TITLE, TOTAL_KPIS } from '@/features/tablero/constants';

/** Misma estructura que el tablero (header, KPIs y dos filas de gráficas) para que la pantalla no brinque al cargar. */
export default function InicioLoading() {
  return (
    <div className="flex min-h-full flex-col">
      <AppPageHeader title={TABLERO_TITLE} />
      <div className="flex flex-col gap-8 p-4 md:p-8">
        <div className={TABLERO_GRID.kpis}>
          {Array.from({ length: TOTAL_KPIS }, (_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className={TABLERO_GRID.graficas}>
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
        <div className={TABLERO_GRID.graficasPorAsignar}>
          <Skeleton className="h-80 rounded-2xl" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
