'use client';

import { Eye, MoreHorizontal, Pencil } from 'lucide-react';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table';
import { ESTATUS_NOTIFICACION_BADGE, ESTATUS_NOTIFICACION_LABEL } from '@/core/lib/domain/notificaciones';
import { formatDate, formatDateTime } from '@/core/lib/utils/format';
import { COLUMNAS_BANDEJA, ESTATUS_EDITABLE, prioridadBadge } from '../constants';
import type { NotificacionFila } from '../types';

interface NotificacionesTableProps {
  items: readonly NotificacionFila[];
  /** Abre el modal de la notificación: edición si está Por Asignar, si no, solo lectura. */
  onOpen: (notificacion: NotificacionFila) => void;
}

/**
 * Columnas de la bandeja del PRD 6.2: orden, fecha del oficio con prioridad, domicilio con referencia, estatus (con su
 * paquete) y acciones. El contenedor es el de la tabla completa del catálogo (`/showcase/tables`).
 */
export function NotificacionesTable({ items, onOpen }: NotificacionesTableProps) {
  const acciones = COLUMNAS_BANDEJA.length - 1;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border-low bg-bg-base shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            {COLUMNAS_BANDEJA.map((columna, i) => (
              <TableHead key={columna} className={i === acciones ? 'text-center' : undefined}>
                {columna}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((fila) => {
            const editable = fila.estatus === ESTATUS_EDITABLE;
            return (
              <TableRow key={fila.idRevision}>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="ds-label-md text-content-high">{fila.numeroOrden}</span>
                    <span className="ds-body-sm text-content-low">{fila.metodo}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <span className="ds-body-md text-content-high">{formatDate(fila.fechaOficio)}</span>
                    {fila.prioridad && (
                      <Badge variant={prioridadBadge(fila.prioridad.clave)}>Prioridad » {fila.prioridad.nombre}</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-md whitespace-normal">
                  <div className="flex flex-col gap-0.5">
                    <span className="ds-body-md text-content-high">
                      {fila.domicilio}
                      {fila.corregido && <span className="ds-body-sm text-content-low"> (corregido)</span>}
                    </span>
                    {fila.referencia && <span className="ds-body-sm text-content-low">Ref. » {fila.referencia}</span>}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <Badge variant={ESTATUS_NOTIFICACION_BADGE[fila.estatus]}>
                      {ESTATUS_NOTIFICACION_LABEL[fila.estatus]}
                    </Badge>
                    {fila.fechaResultado && (
                      <span className="ds-body-sm text-content-low">{formatDateTime(fila.fechaResultado)}</span>
                    )}
                    {fila.idPaquete && <span className="ds-body-sm text-content-low">Paquete {fila.idPaquete}</span>}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" aria-label={`Acciones de la orden ${fila.numeroOrden}`}>
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onOpen(fila)}>
                        {editable ? <Pencil className="size-4" /> : <Eye className="size-4" />}
                        {editable ? 'Editar' : 'Ver detalle'}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
