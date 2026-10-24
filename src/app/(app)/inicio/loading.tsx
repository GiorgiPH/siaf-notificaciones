import { Skeleton } from '@/core/components/ui/skeleton';

const KPIS = 5;

export default function InicioLoading() {
  return (
    <div className="flex flex-col gap-8 p-8">
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-6">
        {Array.from({ length: KPIS }, (_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(280px,1fr)_2fr]">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  );
}
