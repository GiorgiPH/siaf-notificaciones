import type { TotalesMiPaquete } from '../types';

interface AvancePaqueteProps {
  totales: TotalesMiPaquete;
}

/**
 * Avance del paquete: cuántas notificaciones ya tienen resultado. Es lo primero que necesita ver el notificador.
 */
export function AvancePaquete({ totales }: AvancePaqueteProps) {
  const conResultado = totales.notificado + totales.noEntregado;
  const porcentaje = totales.total === 0 ? 0 : Math.round((conResultado / totales.total) * 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="ds-label-md text-content-high">
          {conResultado} de {totales.total} con resultado
        </span>
        <span className="ds-label-sm text-content-low">{porcentaje}%</span>
      </div>
      {/* STOPGAP: falta Progress en el DS — barra con tokens del DS mientras se agrega el componente. */}
      <div
        role="progressbar"
        aria-label="Avance del paquete"
        aria-valuemin={0}
        aria-valuemax={totales.total}
        aria-valuenow={conResultado}
        className="h-2 w-full overflow-hidden rounded-full bg-bg-surface-high"
      >
        <div className="h-full rounded-full bg-accent-primary transition-all" style={{ width: `${porcentaje}%` }} />
      </div>
      <span className="ds-body-sm text-content-low">
        Notificado {totales.notificado} · No entregado {totales.noEntregado} · Por notificar {totales.porNotificar}
      </span>
    </div>
  );
}
