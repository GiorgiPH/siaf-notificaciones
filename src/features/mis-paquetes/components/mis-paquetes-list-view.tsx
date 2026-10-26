'use client';

import { Package } from 'lucide-react';
import { EmptyState } from '@/core/components/ui/empty-state';
import { FilterTabs } from '@/core/components/ui/filter-tabs';
import { PaginationControls } from '@/core/components/ui/pagination-controls';
import { useQueryParams } from '@/core/lib/hooks/use-query-params';
import { ESTADO_TABS, VACIO_POR_ESTADO } from '../constants';
import type { MisPaquetesQuery } from '../schemas';
import type { ConteoMisPaquetes, PaginaMisPaquetes } from '../types';
import { MiPaqueteCard } from './mi-paquete-card';

interface MisPaquetesListViewProps {
  query: MisPaquetesQuery;
  resultado: PaginaMisPaquetes;
  conteos: ConteoMisPaquetes;
}

/**
 * "Mis paquetes" (PRD 8, SOW N-01): pestañas por estado en la URL y tarjetas en lugar de tabla porque se usa desde el
 * celular en campo. Solo aparecen los paquetes del usuario de la sesión (lo garantiza el backend).
 */
export function MisPaquetesListView({ query, resultado, conteos }: MisPaquetesListViewProps) {
  const setParams = useQueryParams();
  const vacio = VACIO_POR_ESTADO[query.estado];

  return (
    <div className="flex flex-col gap-6">
      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <FilterTabs
          items={ESTADO_TABS.map(({ value, label, conteo }) => ({ value, label, count: conteos[conteo] }))}
          value={query.estado}
          onValueChange={(estado) => setParams({ estado })}
          sectionLabel="Estado del paquete"
        />
      </div>

      {resultado.total === 0 ? (
        <EmptyState icon={Package} title={vacio.title} description={vacio.description} />
      ) : (
        <>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {resultado.items.map((paquete) => (
              <li key={paquete.idPaquete} className="flex">
                <div className="flex w-full flex-col [&>a]:flex-1">
                  <MiPaqueteCard paquete={paquete} />
                </div>
              </li>
            ))}
          </ul>
          <PaginationControls
            page={query.page}
            limit={query.limit}
            total={resultado.total}
            onPageChange={(page) => setParams({ page })}
            onLimitChange={(limit) => setParams({ limit, page: 1 })}
          />
        </>
      )}
    </div>
  );
}
