import type { ReactNode } from 'react';
import { Card } from '@/core/components/ui/card';

export interface DatoLista {
  readonly label: string;
  readonly value: ReactNode;
}

interface DatosListaProps {
  /** Encabezado del bloque (p. ej. "Seguimiento"); sin él, solo la lista. */
  titulo?: string;
  datos: readonly DatoLista[];
}

/** Datos de solo lectura en pares etiqueta/valor dentro de un `Card` del DS (detalle de la notificación). */
export function DatosLista({ titulo, datos }: DatosListaProps) {
  return (
    <section className="flex flex-col gap-2">
      {titulo && <h3 className="ds-label-md text-content-high">{titulo}</h3>}
      <Card className="p-4">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          {datos.map(({ label, value }) => (
            <div key={label} className="flex flex-col gap-0.5">
              <dt className="ds-label-sm text-content-low">{label}</dt>
              <dd className="ds-body-md text-content-high">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </section>
  );
}
