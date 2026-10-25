'use client';

import { Eye, FileDown, Images, MoreHorizontal, Pencil, Play } from 'lucide-react';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/core/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table';
import { PAQUETE_ESTADO_BADGE, PAQUETE_ESTADO_LABEL } from '@/core/lib/domain/notificaciones';
import { formatDate, formatDateTime } from '@/core/lib/utils/format';
import { COLUMNAS_BANDEJA, fichaUrl, IMP_FICHA_LABEL } from '../constants';
import { VISTA_SOPORTES } from '../schemas';
import type { PaqueteFila } from '../types';

const SIN_DATO = '—';

interface PaquetesTableProps {
  items: readonly PaqueteFila[];
  /** Detalle de solo lectura; `soportes` abre directo la pestaña de imágenes. */
  onOpen: (paquete: PaqueteFila, vista?: typeof VISTA_SOPORTES) => void;
  onEdit: (paquete: PaqueteFila) => void;
  onIniciar: (paquete: PaqueteFila) => void;
}

/**
 * Bandeja de paquetes (PRD 7.2): ID con su estado, notificador, fechas (programada, apertura, cierre) y totales por
 * resultado. Las acciones respetan la matriz del PRD 7.5: Editar e Iniciar solo en Programado; Imp. Ficha (descarga del
 * PDF) en cualquier estado.
 */
export function PaquetesTable({ items, onOpen, onEdit, onIniciar }: PaquetesTableProps) {
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
          {items.map((fila) => (
            <TableRow key={fila.idPaquete}>
              <TableCell>
                <div className="flex flex-col items-start gap-1">
                  <span className="ds-label-md text-content-high">#{fila.idPaquete}</span>
                  <Badge variant={PAQUETE_ESTADO_BADGE[fila.estado]}>{PAQUETE_ESTADO_LABEL[fila.estado]}</Badge>
                </div>
              </TableCell>
              <TableCell className="ds-body-md text-content-high">{fila.notificador ?? SIN_DATO}</TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <span className="ds-body-md text-content-high">Programada » {formatDate(fila.fechaProgramada)}</span>
                  <span className="ds-body-sm text-content-low">Apertura » {formatDateTime(fila.fechaApertura)}</span>
                  <span className="ds-body-sm text-content-low">Cierre » {formatDateTime(fila.fechaCierre)}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <span className="ds-body-md text-content-high">Total » {fila.totales.total}</span>
                  <span className="ds-body-sm text-content-low">Notificado » {fila.totales.notificado}</span>
                  <span className="ds-body-sm text-content-low">No entregado » {fila.totales.noEntregado}</span>
                </div>
              </TableCell>
              <TableCell className="text-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" aria-label={`Acciones del paquete ${fila.idPaquete}`}>
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onOpen(fila)}>
                      <Eye className="size-4" />
                      Ver detalle
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onOpen(fila, VISTA_SOPORTES)}>
                      <Images className="size-4" />
                      Soportes
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a href={fichaUrl(fila.idPaquete)} download>
                        <FileDown className="size-4" />
                        {IMP_FICHA_LABEL}
                      </a>
                    </DropdownMenuItem>
                    {fila.editable && (
                      <>
                        <DropdownMenuItem onSelect={() => onEdit(fila)}>
                          <Pencil className="size-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onIniciar(fila)}>
                          <Play className="size-4" />
                          Iniciar
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
