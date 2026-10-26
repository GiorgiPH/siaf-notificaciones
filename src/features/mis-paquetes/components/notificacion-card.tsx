import { Camera } from 'lucide-react';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import { Card } from '@/core/components/ui/card';
import { ESTATUS_NOTIFICACION_BADGE, ESTATUS_NOTIFICACION_LABEL } from '@/core/lib/domain/notificaciones';
import { formatDateTime } from '@/core/lib/utils/format';
import type { MiNotificacion } from '../types';

interface NotificacionCardProps {
  notificacion: MiNotificacion;
  /** Paquete Abierto: la acción principal es registrar. */
  editable: boolean;
  onAbrir: (notificacion: MiNotificacion) => void;
}

/**
 * Notificación en el detalle del paquete: el domicilio es lo más visible porque es lo que el notificador busca en campo.
 */
export function NotificacionCard({ notificacion, editable, onAbrir }: NotificacionCardProps) {
  const registrar = editable && notificacion.estatus === 'POR_NOTIFICAR';
  const fotos = notificacion.soportes.length;

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="ds-label-md break-all text-content-high">{notificacion.numeroOrden}</span>
          {notificacion.numeroOficio && notificacion.numeroOficio !== notificacion.numeroOrden && (
            <span className="ds-body-sm text-content-low">Oficio » {notificacion.numeroOficio}</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          {notificacion.prioridad && <Badge variant="info">{notificacion.prioridad.nombre}</Badge>}
          <Badge variant={ESTATUS_NOTIFICACION_BADGE[notificacion.estatus]}>
            {ESTATUS_NOTIFICACION_LABEL[notificacion.estatus]}
          </Badge>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p className="ds-body-md text-content-high">{notificacion.domicilio}</p>
        {notificacion.referencia && <p className="ds-body-sm text-content-low">Ref. » {notificacion.referencia}</p>}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="ds-body-sm inline-flex items-center gap-1.5 text-content-low">
            <Camera className="size-4" aria-hidden />
            {fotos === 1 ? '1 foto' : `${fotos} fotos`}
          </span>
          {notificacion.fechaResultado && (
            <span className="ds-body-sm text-content-low">{formatDateTime(notificacion.fechaResultado)}</span>
          )}
        </div>
        <Button
          type="button"
          variant={registrar ? 'default' : 'outline'}
          className="w-full sm:w-auto"
          onClick={() => onAbrir(notificacion)}
        >
          {registrar ? 'Registrar resultado' : 'Ver'}
        </Button>
      </div>
    </Card>
  );
}
