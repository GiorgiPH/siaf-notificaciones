'use client';

import { MoreHorizontal, Pencil } from 'lucide-react';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table';
import { formatDate } from '@/core/lib/utils/format';
import { ESTATUS_BADGE, ESTATUS_LABEL, prioridadBadge } from '../constants';
import type { NotificacionFila } from '../types';

interface NotificacionesTableProps {
  items: readonly NotificacionFila[];
  onEdit: (notificacion: NotificacionFila) => void;
}

/** Columnas de la bandeja del PRD 6.2: orden, fecha del oficio con prioridad, domicilio con referencia, estatus. */
export function NotificacionesTable({ items, onEdit }: NotificacionesTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Num. Orden</TableHead>
          <TableHead>Fecha Oficio</TableHead>
          <TableHead>Domicilio</TableHead>
          <TableHead>Estatus</TableHead>
          <TableHead className="text-center">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((fila) => (
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
              <Badge variant={ESTATUS_BADGE[fila.estatus]}>{ESTATUS_LABEL[fila.estatus]}</Badge>
            </TableCell>
            <TableCell className="text-center">
              {fila.estatus === 'POR_ASIGNAR' ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" aria-label={`Acciones de la orden ${fila.numeroOrden}`}>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onEdit(fila)}>
                      <Pencil className="size-4" /> Editar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <span className="ds-body-sm text-content-low">{fila.idPaquete ? `Paquete ${fila.idPaquete}` : '—'}</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
