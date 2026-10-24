'use client';

import { useCallback } from 'react';
import { Inbox } from 'lucide-react';
import { AlertBanner } from '@/core/components/ui/alert-banner';
import { EmptyState } from '@/core/components/ui/empty-state';
import { FilterTabs } from '@/core/components/ui/filter-tabs';
import { PaginationControls } from '@/core/components/ui/pagination-controls';
import { useQueryParams } from '@/core/lib/hooks/use-query-params';
import { DETALLE_PARAM, ESTATUS_TABS } from '../constants';
import type { NotificacionesQuery } from '../schemas';
import type { ConteoNotificaciones, NotificacionDetalle, PaginaNotificaciones, Prioridad } from '../types';
import { NotificacionFormDialog } from './notificacion-form-dialog';
import { NotificacionesFilters } from './notificaciones-filters';
import { NotificacionesTable } from './notificaciones-table';

interface NotificacionesListViewProps {
  query: NotificacionesQuery;
  resultado: PaginaNotificaciones;
  /** Contadores de las tabs, del backend con los mismos filtros de texto y fecha. */
  conteos: ConteoNotificaciones;
  prioridades: readonly Prioridad[];
  /** Notificación abierta en el modal (`?notificacion=<idRevision>`), leída en el servidor. */
  abierta?: NotificacionDetalle;
  /** Error al leer la notificación abierta (p. ej. la orden ya salió de la bandeja). */
  errorDetalle?: string;
}

/** Bandeja de notificaciones (PRD 6.2): se alimenta solo del SIAF, sin "Nuevo Registro" ni "Subir Layout" (PRD 6.4). */
export function NotificacionesListView({
  query,
  resultado,
  conteos,
  prioridades,
  abierta,
  errorDetalle,
}: NotificacionesListViewProps) {
  const setParams = useQueryParams();
  const cerrarDetalle = useCallback(
    (open: boolean) => {
      if (!open) setParams({ [DETALLE_PARAM]: undefined }, { resetPage: false });
    },
    [setParams],
  );

  return (
    <div className="flex flex-col gap-6">
      <FilterTabs
        items={ESTATUS_TABS.map(({ value, label, conteo }) => ({ value, label, count: conteos[conteo] }))}
        value={query.estatus}
        onValueChange={(estatus) => setParams({ estatus })}
        sectionLabel="Estatus de la notificación"
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <NotificacionesFilters query={query} onChange={setParams} />
      </div>

      {errorDetalle && (
        <AlertBanner variant="warning" onClose={() => cerrarDetalle(false)}>
          {errorDetalle}
        </AlertBanner>
      )}

      {resultado.total === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Sin notificaciones"
          description="No hay órdenes que coincidan con los filtros. Las órdenes de cartas invitación aparecen aquí en cuanto quedan listas para notificar en el SIAF."
        />
      ) : (
        <>
          <NotificacionesTable
            items={resultado.items}
            onOpen={(fila) => setParams({ [DETALLE_PARAM]: fila.idRevision }, { resetPage: false })}
          />
          <PaginationControls
            page={query.page}
            limit={query.limit}
            total={resultado.total}
            onPageChange={(page) => setParams({ page })}
            onLimitChange={(limit) => setParams({ limit, page: 1 })}
          />
        </>
      )}

      {abierta && (
        <NotificacionFormDialog
          key={abierta.idRevision}
          open
          onOpenChange={cerrarDetalle}
          notificacion={abierta}
          prioridades={prioridades}
        />
      )}
    </div>
  );
}
