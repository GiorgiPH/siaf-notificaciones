'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Inbox } from 'lucide-react';
import { MIS_PAQUETES_PATH } from '@/core/auth/routes';
import { DatosLista, type DatoLista } from '@/core/components/datos-lista';
import { AlertBanner } from '@/core/components/ui/alert-banner';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import { EmptyState } from '@/core/components/ui/empty-state';
import { FilterTabs } from '@/core/components/ui/filter-tabs';
import { PAQUETE_ESTADO_BADGE, PAQUETE_ESTADO_LABEL } from '@/core/lib/domain/notificaciones';
import { formatDate, formatDateTime } from '@/core/lib/utils/format';
import { AVISO_POR_ESTADO, VISTA_CON_RESULTADO, VISTA_POR_NOTIFICAR } from '../constants';
import type { MiNotificacion, MiPaqueteDetalle } from '../types';
import { AvancePaquete } from './avance-paquete';
import { CapturaSheet } from './captura-sheet';
import { NotificacionCard } from './notificacion-card';

interface MiPaqueteDetalleViewProps {
  detalle: MiPaqueteDetalle;
}

/**
 * Detalle de un paquete del notificador (PRD 8): datos y avance, aviso según el estado y sus notificaciones separadas
 * en "Por notificar" y "Con resultado". Tocar una abre la hoja de captura; solo en Abierto se registra.
 */
export function MiPaqueteDetalleView({ detalle }: MiPaqueteDetalleViewProps) {
  const { paquete, notificaciones } = detalle;
  const editable = paquete.estado === 'ABIERTO';
  const pendientes = notificaciones.filter((n) => n.estatus === 'POR_NOTIFICAR');
  const conResultado = notificaciones.filter((n) => n.estatus !== 'POR_NOTIFICAR');
  const [vista, setVista] = useState(pendientes.length > 0 ? VISTA_POR_NOTIFICAR : VISTA_CON_RESULTADO);
  const [idAbierta, setIdAbierta] = useState<number>();
  // La hoja usa los datos frescos del servidor (tras cada foto o resultado la página se refresca).
  const abierta = notificaciones.find((n) => n.idNotificacion === idAbierta);
  const cerrar = useCallback((open: boolean) => !open && setIdAbierta(undefined), []);
  const lista = vista === VISTA_POR_NOTIFICAR ? pendientes : conResultado;
  const aviso = AVISO_POR_ESTADO[paquete.estado];

  const datos: readonly DatoLista[] = [
    {
      label: 'Estado',
      value: <Badge variant={PAQUETE_ESTADO_BADGE[paquete.estado]}>{PAQUETE_ESTADO_LABEL[paquete.estado]}</Badge>,
    },
    { label: 'Fecha programada', value: formatDate(paquete.fechaProgramada) },
    { label: 'Apertura', value: formatDateTime(paquete.fechaApertura) },
    { label: 'Cierre', value: formatDateTime(paquete.fechaCierre) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <Link href={MIS_PAQUETES_PATH}>
            <ArrowLeft />
            Mis paquetes
          </Link>
        </Button>
      </div>

      {aviso && <AlertBanner variant={paquete.estado === 'CERRADO' ? 'success' : 'info'}>{aviso}</AlertBanner>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[2fr_1fr]">
        <DatosLista datos={datos} />
        <div className="rounded-2xl border border-border-low bg-bg-base p-4 shadow-sm">
          <AvancePaquete totales={paquete.totales} />
        </div>
      </div>

      <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <FilterTabs
          items={[
            { value: VISTA_POR_NOTIFICAR, label: 'Por notificar', count: pendientes.length },
            { value: VISTA_CON_RESULTADO, label: 'Con resultado', count: conResultado.length },
          ]}
          value={vista}
          onValueChange={setVista}
          sectionLabel="Notificaciones"
        />
      </div>

      {lista.length === 0 ? (
        vista === VISTA_POR_NOTIFICAR ? (
          <EmptyState
            icon={CheckCircle2}
            title="Todo registrado"
            description="Todas las notificaciones de este paquete ya tienen resultado."
          />
        ) : (
          <EmptyState icon={Inbox} title="Sin resultados" description="Aún no registras resultados en este paquete." />
        )
      ) : (
        <ul className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {lista.map((notificacion) => (
            <li key={notificacion.idNotificacion}>
              <NotificacionCard
                notificacion={notificacion}
                editable={editable}
                onAbrir={(n: MiNotificacion) => setIdAbierta(n.idNotificacion)}
              />
            </li>
          ))}
        </ul>
      )}

      {abierta && (
        <CapturaSheet
          key={abierta.idNotificacion}
          notificacion={abierta}
          editable={editable}
          onOpenChange={cerrar}
        />
      )}
    </div>
  );
}
