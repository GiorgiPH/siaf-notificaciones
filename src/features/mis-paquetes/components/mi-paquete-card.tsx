import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/core/components/ui/badge';
import { Card } from '@/core/components/ui/card';
import { PAQUETE_ESTADO_BADGE, PAQUETE_ESTADO_LABEL } from '@/core/lib/domain/notificaciones';
import { formatDate, formatDateTime } from '@/core/lib/utils/format';
import { miPaqueteUrl } from '../constants';
import type { MiPaquete } from '../types';
import { AvancePaquete } from './avance-paquete';

interface MiPaqueteCardProps {
  paquete: MiPaquete;
}

/**
 * Tarjeta de un paquete en "Mis paquetes": en el celular una tabla no cabe, así que cada paquete es una tarjeta que se
 * toca completa para entrar al detalle.
 */
export function MiPaqueteCard({ paquete }: MiPaqueteCardProps) {
  return (
    <Link
      href={miPaqueteUrl(paquete.idPaquete)}
      className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-support-focus focus-visible:ring-offset-2"
    >
      <Card className="flex h-full flex-col gap-4 p-4 transition-colors group-hover:bg-reactive-surface-hover">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <span className="ds-heading-sm text-content-high">Paquete #{paquete.idPaquete}</span>
            <span className="ds-body-sm text-content-low">Programado para el {formatDate(paquete.fechaProgramada)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge variant={PAQUETE_ESTADO_BADGE[paquete.estado]}>{PAQUETE_ESTADO_LABEL[paquete.estado]}</Badge>
            <ChevronRight className="size-5 text-content-low" aria-hidden />
          </div>
        </div>
        <AvancePaquete totales={paquete.totales} />
        {(paquete.fechaApertura || paquete.fechaCierre) && (
          <dl className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-0.5">
              <dt className="ds-label-sm text-content-low">Apertura</dt>
              <dd className="ds-body-sm text-content-high">{formatDateTime(paquete.fechaApertura)}</dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="ds-label-sm text-content-low">Cierre</dt>
              <dd className="ds-body-sm text-content-high">{formatDateTime(paquete.fechaCierre)}</dd>
            </div>
          </dl>
        )}
      </Card>
    </Link>
  );
}
