'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { AlertBanner } from '@/core/components/ui/alert-banner';
import { Button } from '@/core/components/ui/button';
import { Card } from '@/core/components/ui/card';
import { Checkbox } from '@/core/components/ui/checkbox';
import { SearchInput } from '@/core/components/ui/search-input';
import { formatDate } from '@/core/lib/utils/format';
import { buscarDisponiblesAction } from '../actions';
import { SEARCH_DEBOUNCE_MS } from '../constants';
import type { NotificacionDisponible } from '../types';

interface AsignacionDualListProps {
  /** Órdenes asignadas al paquete (controlado por el modal, que las manda como `idsRevision`). */
  asignadas: readonly NotificacionDisponible[];
  onAsignadasChange: (asignadas: readonly NotificacionDisponible[]) => void;
  /**
   * Órdenes del paquete al abrir la edición. Si se quitan, vuelven a "Disponibles" aquí mismo: en el backend siguen en
   * el paquete hasta guardar.
   */
  iniciales?: readonly NotificacionDisponible[];
  disabled?: boolean;
}

const coincide = (n: NotificacionDisponible, texto: string) => {
  const buscado = texto.trim().toLowerCase();
  return (
    !buscado ||
    n.numeroOrden.toLowerCase().includes(buscado) ||
    (n.numeroOficio ?? '').toLowerCase().includes(buscado)
  );
};

/**
 * Asignación de órdenes (PRD 7.1): "Num. Orden Disponibles" (Por Asignar, del backend) y "Num. Orden Asignados", cada
 * una con búsqueda por número de orden u oficio, y los botones >> > < <<. Una orden ya asignada a otro paquete nunca
 * aparece como disponible (lo garantiza el backend).
 */
export function AsignacionDualList({ asignadas, onAsignadasChange, iniciales = [], disabled }: AsignacionDualListProps) {
  const [textoDisponibles, setTextoDisponibles] = useState('');
  const [textoAsignadas, setTextoAsignadas] = useState('');
  const [encontradas, setEncontradas] = useState<readonly NotificacionDisponible[]>([]);
  const [totalEncontradas, setTotalEncontradas] = useState(0);
  const [error, setError] = useState<string>();
  const [buscando, startBusqueda] = useTransition();
  const [marcadasDisponibles, setMarcadasDisponibles] = useState<ReadonlySet<number>>(new Set());
  const [marcadasAsignadas, setMarcadasAsignadas] = useState<ReadonlySet<number>>(new Set());

  useEffect(() => {
    const timer = setTimeout(
      () =>
        startBusqueda(async () => {
          const respuesta = await buscarDisponiblesAction(textoDisponibles);
          setError(respuesta.error);
          setEncontradas(respuesta.resultado?.items ?? []);
          setTotalEncontradas(respuesta.resultado?.total ?? 0);
        }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [textoDisponibles]);

  const idsAsignadas = useMemo(() => new Set(asignadas.map((n) => n.idRevision)), [asignadas]);
  const disponibles = useMemo(() => {
    const liberadas = iniciales.filter((n) => !idsAsignadas.has(n.idRevision) && coincide(n, textoDisponibles));
    const idsLiberadas = new Set(liberadas.map((n) => n.idRevision));
    return [
      ...liberadas,
      ...encontradas.filter((n) => !idsAsignadas.has(n.idRevision) && !idsLiberadas.has(n.idRevision)),
    ];
  }, [iniciales, encontradas, idsAsignadas, textoDisponibles]);
  const asignadasVisibles = useMemo(
    () => asignadas.filter((n) => coincide(n, textoAsignadas)),
    [asignadas, textoAsignadas],
  );

  const asignar = (ordenes: readonly NotificacionDisponible[]) => {
    onAsignadasChange([...asignadas, ...ordenes.filter((n) => !idsAsignadas.has(n.idRevision))]);
    setMarcadasDisponibles(new Set());
  };
  const quitar = (ids: ReadonlySet<number>) => {
    onAsignadasChange(asignadas.filter((n) => !ids.has(n.idRevision)));
    setMarcadasAsignadas(new Set());
  };

  return (
    <div className="grid grid-cols-1 items-center gap-4 md:grid-cols-[1fr_auto_1fr]">
      <ListaOrdenes
        titulo="Num. Orden Disponibles"
        conteo={disponibles.length < totalEncontradas ? `${disponibles.length} de ${totalEncontradas}` : undefined}
        texto={textoDisponibles}
        onTextoChange={setTextoDisponibles}
        ordenes={disponibles}
        marcadas={marcadasDisponibles}
        onMarcadasChange={setMarcadasDisponibles}
        vacio={buscando ? 'Buscando…' : 'No hay notificaciones Por Asignar con ese criterio'}
        disabled={disabled}
      />
      <div className="flex flex-row justify-center gap-2 md:flex-col">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Asignar todas las disponibles visibles"
          disabled={disabled || disponibles.length === 0}
          onClick={() => asignar(disponibles)}
        >
          <ChevronsRight />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Asignar las seleccionadas"
          disabled={disabled || marcadasDisponibles.size === 0}
          onClick={() => asignar(disponibles.filter((n) => marcadasDisponibles.has(n.idRevision)))}
        >
          <ChevronRight />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Quitar las seleccionadas"
          disabled={disabled || marcadasAsignadas.size === 0}
          onClick={() => quitar(marcadasAsignadas)}
        >
          <ChevronLeft />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Quitar todas las asignadas visibles"
          disabled={disabled || asignadasVisibles.length === 0}
          onClick={() => quitar(new Set(asignadasVisibles.map((n) => n.idRevision)))}
        >
          <ChevronsLeft />
        </Button>
      </div>
      <ListaOrdenes
        titulo="Num. Orden Asignados"
        conteo={String(asignadas.length)}
        texto={textoAsignadas}
        onTextoChange={setTextoAsignadas}
        ordenes={asignadasVisibles}
        marcadas={marcadasAsignadas}
        onMarcadasChange={setMarcadasAsignadas}
        vacio="Pasa aquí las notificaciones del paquete"
        disabled={disabled}
      />
      {error && (
        <div className="md:col-span-3">
          <AlertBanner variant="error">{error}</AlertBanner>
        </div>
      )}
    </div>
  );
}

interface ListaOrdenesProps {
  titulo: string;
  conteo?: string;
  texto: string;
  onTextoChange: (texto: string) => void;
  ordenes: readonly NotificacionDisponible[];
  marcadas: ReadonlySet<number>;
  onMarcadasChange: (marcadas: ReadonlySet<number>) => void;
  vacio: string;
  disabled?: boolean;
}

function ListaOrdenes({
  titulo,
  conteo,
  texto,
  onTextoChange,
  ordenes,
  marcadas,
  onMarcadasChange,
  vacio,
  disabled,
}: ListaOrdenesProps) {
  const alternar = (idRevision: number, marcada: boolean) => {
    const siguiente = new Set(marcadas);
    if (marcada) siguiente.add(idRevision);
    else siguiente.delete(idRevision);
    onMarcadasChange(siguiente);
  };

  return (
    <Card className="flex min-w-0 flex-col gap-3 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="ds-label-md text-content-high">{titulo}</h3>
        {conteo && <span className="ds-body-sm text-content-low">{conteo}</span>}
      </div>
      <SearchInput placeholder="Número de orden u oficio..." value={texto} onChange={onTextoChange} />
      <ul className="flex h-64 flex-col gap-1 overflow-y-auto" aria-label={titulo}>
        {ordenes.length === 0 ? (
          <li className="ds-body-sm p-2 text-content-low">{vacio}</li>
        ) : (
          ordenes.map((n) => {
            const id = `${titulo}-${n.idRevision}`;
            return (
              <li key={n.idRevision} className="flex items-start gap-2 rounded-lg p-2 hover:bg-bg-surface-low">
                <Checkbox
                  id={id}
                  checked={marcadas.has(n.idRevision)}
                  onCheckedChange={(valor) => alternar(n.idRevision, valor === true)}
                  disabled={disabled}
                />
                <label htmlFor={id} className="flex min-w-0 cursor-pointer flex-col gap-0.5">
                  <span className="ds-label-md text-content-high">{n.numeroOrden}</span>
                  <span className="ds-body-sm truncate text-content-low">
                    Oficio {formatDate(n.fechaOficio)} » {n.domicilio}
                  </span>
                </label>
              </li>
            );
          })
        )}
      </ul>
    </Card>
  );
}
