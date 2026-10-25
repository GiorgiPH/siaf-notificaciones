'use client';

import { useCallback, useState, useTransition } from 'react';
import { Package, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { AlertBanner } from '@/core/components/ui/alert-banner';
import { Button } from '@/core/components/ui/button';
import { ConfirmDialog } from '@/core/components/ui/confirm-dialog';
import { EmptyState } from '@/core/components/ui/empty-state';
import { FilterTabs } from '@/core/components/ui/filter-tabs';
import { PaginationControls } from '@/core/components/ui/pagination-controls';
import { useQueryParams } from '@/core/lib/hooks/use-query-params';
import { formatDate } from '@/core/lib/utils/format';
import { iniciarPaqueteAction } from '../actions';
import { DETALLE_PARAM, EDITAR_PARAM, ESTADO_TABS, VISTA_PARAM } from '../constants';
import type { PaquetesQuery } from '../schemas';
import type { Notificador, PaginaPaquetes, PaqueteDetalle, PaqueteFila, SoportePaquete } from '../types';
import { PaqueteDetalleDialog } from './paquete-detalle-dialog';
import { PaqueteFormDialog } from './paquete-form-dialog';
import { PaquetesFilters } from './paquetes-filters';
import { PaquetesTable } from './paquetes-table';

interface PaquetesListViewProps {
  query: PaquetesQuery;
  resultado: PaginaPaquetes;
  notificadores: readonly Notificador[];
  /** Paquete abierto en el detalle (`?paquete=<id>`), con sus soportes, leído en el servidor. */
  detalle?: { paquete: PaqueteDetalle; soportes: readonly SoportePaquete[] };
  /** Paquete abierto en la edición (`?editar=<id>`), leído en el servidor. */
  edicion?: PaqueteDetalle;
  /** Error al leer el paquete abierto (p. ej. ya no existe o ya no está Programado). */
  errorAbierto?: string;
}

/**
 * Bandeja de paquetes (PRD 7.2): estado, filtros, alta (PRD 7.1), detalle y soportes (7.3), edición e inicio solo en
 * Programado (7.5). "Inf. Num. Órdenes Gral." e "Imp. Ficha" están fuera de alcance (SOW 3.3).
 */
export function PaquetesListView({
  query,
  resultado,
  notificadores,
  detalle,
  edicion,
  errorAbierto,
}: PaquetesListViewProps) {
  const setParams = useQueryParams();
  const [creando, setCreando] = useState(false);
  const [porIniciar, setPorIniciar] = useState<PaqueteFila>();
  const [iniciando, startInicio] = useTransition();

  const cerrarModal = useCallback(
    (open: boolean) => {
      if (!open) {
        setParams({ [DETALLE_PARAM]: undefined, [EDITAR_PARAM]: undefined, [VISTA_PARAM]: undefined }, {
          resetPage: false,
        });
      }
    },
    [setParams],
  );

  const iniciar = (paquete: PaqueteFila) =>
    startInicio(async () => {
      const datos = new FormData();
      datos.set('idPaquete', String(paquete.idPaquete));
      datos.set('version', String(paquete.version));
      const respuesta = await iniciarPaqueteAction({}, datos);
      if (respuesta.success) {
        toast.success(`Paquete #${paquete.idPaquete} iniciado`);
        setPorIniciar(undefined);
      } else if (respuesta.error) {
        toast.error(respuesta.error);
      }
    });

  return (
    <div className="flex flex-col gap-6">
      <FilterTabs
        items={ESTADO_TABS.map(({ value, label }) => ({ value, label }))}
        value={query.estado}
        onValueChange={(estado) => setParams({ estado })}
        sectionLabel="Estado del paquete"
      />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <PaquetesFilters query={query} notificadores={notificadores} onChange={setParams} />
        <Button onClick={() => setCreando(true)}>
          <Plus />
          Nuevo paquete
        </Button>
      </div>

      {errorAbierto && (
        <AlertBanner variant="warning" onClose={() => cerrarModal(false)}>
          {errorAbierto}
        </AlertBanner>
      )}

      {resultado.total === 0 ? (
        <EmptyState
          icon={Package}
          title="Sin paquetes"
          description="No hay paquetes que coincidan con los filtros. Arma uno nuevo con las notificaciones Por Asignar."
          actionLabel="Nuevo paquete"
          onAction={() => setCreando(true)}
        />
      ) : (
        <>
          <PaquetesTable
            items={resultado.items}
            onOpen={(paquete, vista) =>
              setParams({ [DETALLE_PARAM]: paquete.idPaquete, [VISTA_PARAM]: vista }, { resetPage: false })
            }
            onEdit={(paquete) => setParams({ [EDITAR_PARAM]: paquete.idPaquete }, { resetPage: false })}
            onIniciar={setPorIniciar}
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

      {creando && <PaqueteFormDialog open onOpenChange={setCreando} notificadores={notificadores} />}

      {edicion && (
        <PaqueteFormDialog
          key={`${edicion.paquete.idPaquete}-${edicion.paquete.version}`}
          open
          onOpenChange={cerrarModal}
          notificadores={notificadores}
          paquete={edicion}
        />
      )}

      {detalle && (
        <PaqueteDetalleDialog
          key={detalle.paquete.paquete.idPaquete}
          onOpenChange={cerrarModal}
          detalle={detalle.paquete}
          soportes={detalle.soportes}
          vistaInicial={query.vista}
        />
      )}

      <ConfirmDialog
        open={!!porIniciar}
        onOpenChange={(open) => !open && setPorIniciar(undefined)}
        title={`¿Iniciar el paquete #${porIniciar?.idPaquete ?? ''}?`}
        description={
          porIniciar &&
          `Se registra la fecha y hora de apertura y el paquete pasa a Abierto: ya no se podrá editar. Fecha programada: ${formatDate(porIniciar.fechaProgramada)}.`
        }
        confirmLabel="Iniciar"
        loading={iniciando}
        onConfirm={() => porIniciar && iniciar(porIniciar)}
      />
    </div>
  );
}
