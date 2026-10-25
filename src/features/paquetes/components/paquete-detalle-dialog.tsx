'use client';

import Image from 'next/image';
import { ImageOff } from 'lucide-react';
import { DatosLista, type DatoLista } from '@/core/components/datos-lista';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/core/components/ui/dialog';
import { EmptyState } from '@/core/components/ui/empty-state';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/core/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/components/ui/tabs';
import {
  ESTATUS_NOTIFICACION_BADGE,
  ESTATUS_NOTIFICACION_LABEL,
  PAQUETE_ESTADO_BADGE,
  PAQUETE_ESTADO_LABEL,
} from '@/core/lib/domain/notificaciones';
import { formatDate, formatDateTime } from '@/core/lib/utils/format';
import { COLUMNAS_DETALLE, soporteUrl } from '../constants';
import { VISTA_NOTIFICACIONES, VISTA_SOPORTES } from '../schemas';
import type { PaqueteDetalle, SoportePaquete } from '../types';

const SIN_DATO = '—';
const MINIATURA_PX = 160;

interface PaqueteDetalleDialogProps {
  onOpenChange: (open: boolean) => void;
  detalle: PaqueteDetalle;
  soportes: readonly SoportePaquete[];
  /** Pestaña con la que abre (la acción "Soportes" de la bandeja abre las imágenes). */
  vistaInicial?: typeof VISTA_SOPORTES;
}

/**
 * Detalle del paquete (PRD 7.3, solo lectura en cualquier estado): fechas, notificador, totales, sus notificaciones con
 * domicilio y estatus, y las imágenes de soporte de todo el paquete. La carpeta de ubicación en mapa queda en espera
 * (ADR-004): el domicilio se muestra como texto.
 */
export function PaqueteDetalleDialog({ onOpenChange, detalle, soportes, vistaInicial }: PaqueteDetalleDialogProps) {
  const { paquete, notificaciones } = detalle;
  const soportesPorOrden = new Map<number, SoportePaquete[]>();
  for (const soporte of soportes) {
    soportesPorOrden.set(soporte.idRevision, [...(soportesPorOrden.get(soporte.idRevision) ?? []), soporte]);
  }
  const ordenPorRevision = new Map(notificaciones.map((n) => [n.idRevision, n.numeroOrden]));

  const datosPaquete: readonly DatoLista[] = [
    {
      label: 'Estado',
      value: <Badge variant={PAQUETE_ESTADO_BADGE[paquete.estado]}>{PAQUETE_ESTADO_LABEL[paquete.estado]}</Badge>,
    },
    { label: 'Notificador', value: paquete.notificador ?? SIN_DATO },
    { label: 'Fecha programada', value: formatDate(paquete.fechaProgramada) },
    { label: 'Apertura', value: formatDateTime(paquete.fechaApertura) },
    { label: 'Cierre', value: formatDateTime(paquete.fechaCierre) },
    {
      label: 'Num. Órdenes',
      value: `${paquete.totales.total} (notificado ${paquete.totales.notificado}, no entregado ${paquete.totales.noEntregado})`,
    },
  ];

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Paquete #{paquete.idPaquete}</DialogTitle>
          <DialogDescription>Detalle del paquete, sus notificaciones y sus soportes.</DialogDescription>
        </DialogHeader>
        <DialogBody>
          <div className="flex flex-col gap-6">
            <DatosLista datos={datosPaquete} />
            <Tabs defaultValue={vistaInicial ?? VISTA_NOTIFICACIONES}>
              <TabsList>
                <TabsTrigger value={VISTA_NOTIFICACIONES}>Notificaciones ({notificaciones.length})</TabsTrigger>
                <TabsTrigger value={VISTA_SOPORTES}>Soportes ({soportes.length})</TabsTrigger>
              </TabsList>
              <TabsContent value={VISTA_NOTIFICACIONES}>
                <div className="w-full overflow-hidden rounded-2xl border border-border-low bg-bg-base shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {COLUMNAS_DETALLE.map((columna) => (
                          <TableHead key={columna}>{columna}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notificaciones.map((n) => (
                        <TableRow key={n.idRevision}>
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="ds-label-md text-content-high">{n.numeroOrden}</span>
                              {n.numeroOficio && n.numeroOficio !== n.numeroOrden && (
                                <span className="ds-body-sm text-content-low">Oficio » {n.numeroOficio}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="ds-body-md text-content-high">{formatDate(n.fechaOficio)}</TableCell>
                          <TableCell className="max-w-sm whitespace-normal">
                            <div className="flex flex-col gap-0.5">
                              <span className="ds-body-md text-content-high">{n.domicilio}</span>
                              {n.referencia && (
                                <span className="ds-body-sm text-content-low">Ref. » {n.referencia}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col items-start gap-1">
                              <Badge variant={ESTATUS_NOTIFICACION_BADGE[n.estatus]}>
                                {ESTATUS_NOTIFICACION_LABEL[n.estatus]}
                              </Badge>
                              {n.fechaResultado && (
                                <span className="ds-body-sm text-content-low">{formatDateTime(n.fechaResultado)}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="ds-body-md text-content-high">
                            {soportesPorOrden.get(n.idRevision)?.length ?? 0}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value={VISTA_SOPORTES}>
                {soportes.length === 0 ? (
                  <EmptyState
                    icon={ImageOff}
                    title="Sin soportes"
                    description="El notificador todavía no ha cargado imágenes de este paquete."
                  />
                ) : (
                  <div className="flex flex-col gap-6">
                    {[...soportesPorOrden.entries()].map(([idRevision, imagenes]) => (
                      <section key={idRevision} className="flex flex-col gap-2">
                        <h3 className="ds-label-md text-content-high">
                          {ordenPorRevision.get(idRevision) ?? `Orden ${idRevision}`}
                        </h3>
                        <ul className="flex flex-wrap gap-3">
                          {imagenes.map((soporte) => (
                            <li key={soporte.idSoporte}>
                              <a
                                href={soporteUrl(soporte.idSoporte)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex flex-col gap-1"
                              >
                                <Image
                                  src={soporteUrl(soporte.idSoporte)}
                                  alt={soporte.nombreOriginal}
                                  width={MINIATURA_PX}
                                  height={MINIATURA_PX}
                                  unoptimized
                                  className="size-40 rounded-xl border border-border-low object-cover"
                                />
                                <span className="ds-body-sm max-w-40 truncate text-content-low">
                                  {formatDateTime(soporte.fechaAlta)}
                                </span>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
