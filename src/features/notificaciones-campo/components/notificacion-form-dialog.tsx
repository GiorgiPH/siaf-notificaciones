'use client';

import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertBanner } from '@/core/components/ui/alert-banner';
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
import { Field } from '@/core/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import { Textarea } from '@/core/components/ui/textarea';
import { DatosLista, type DatoLista } from '@/core/components/datos-lista';
import type { ActionState } from '@/core/lib/action-state';
import {
  ESTATUS_NOTIFICACION_LABEL,
  PAQUETE_ESTADO_BADGE,
  PAQUETE_ESTADO_LABEL,
  type EstatusNotificacion,
} from '@/core/lib/domain/notificaciones';
import { formatCurrency, formatDate, formatDateTime } from '@/core/lib/utils/format';
import { editarNotificacionAction } from '../actions';
import { ETIQUETA_FECHA_RESULTADO } from '../constants';
import type { NotificacionDetalle, Prioridad, SeguimientoNotificacion } from '../types';

const SIN_DATO = '—';

/** Paquete (con su estado), notificador, fechas del paquete, resultado y observaciones (PRD 6.3, detalle). */
function datosSeguimiento(seguimiento: SeguimientoNotificacion, estatus: EstatusNotificacion): readonly DatoLista[] {
  const { paquete } = seguimiento;
  const datos: DatoLista[] = [
    {
      label: 'Paquete',
      value: (
        <span className="flex flex-wrap items-center gap-2">
          #{paquete.id}
          <Badge variant={PAQUETE_ESTADO_BADGE[paquete.estado]}>{PAQUETE_ESTADO_LABEL[paquete.estado]}</Badge>
        </span>
      ),
    },
    { label: 'Notificador', value: seguimiento.notificador ?? SIN_DATO },
    { label: 'Fecha programada', value: formatDate(paquete.fechaProgramada) },
    { label: 'Apertura del paquete', value: formatDateTime(paquete.fechaApertura) },
    { label: 'Cierre del paquete', value: formatDateTime(paquete.fechaCierre) },
    { label: ETIQUETA_FECHA_RESULTADO[estatus], value: formatDateTime(seguimiento.fechaResultado) },
  ];
  if (seguimiento.observaciones) datos.push({ label: 'Observaciones', value: seguimiento.observaciones });
  return datos;
}

interface NotificacionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notificacion: NotificacionDetalle;
  prioridades: readonly Prioridad[];
}

const initialState: ActionState = {};

/**
 * Edición de datos de campo (PRD 6.3): los datos de la orden se leen del SIAF y no se editan; domicilio, referencia
 * y prioridad se corrigen solo en la notificación (no actualizan el padrón) y solo mientras está Por Asignar. En
 * cualquier otro estatus el mismo modal es el detalle de solo lectura (`editable` lo decide el backend).
 */
export function NotificacionFormDialog({ open, onOpenChange, notificacion, prioridades }: NotificacionFormDialogProps) {
  const [state, formAction, isPending] = useActionState(editarNotificacionAction, initialState);
  const [idPrioridad, setIdPrioridad] = useState(
    String(notificacion.prioridad?.id ?? prioridades.find((p) => p.porDefecto)?.id ?? ''),
  );
  const soloLectura = !notificacion.editable;

  useEffect(() => {
    if (state.success) {
      toast.success('Notificación actualizada');
      onOpenChange(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  const datosOrden: readonly DatoLista[] = [
    { label: 'Num. Orden', value: notificacion.numeroOrden },
    { label: 'Num. Oficio', value: notificacion.numeroOficio ?? SIN_DATO },
    { label: 'Fecha Oficio', value: formatDate(notificacion.fechaOficio) },
    { label: 'ID Insumo', value: notificacion.idInsumo ?? SIN_DATO },
    { label: 'ID Bloque', value: notificacion.idBloque ?? SIN_DATO },
    { label: 'Monto Presuntiva', value: formatCurrency(notificacion.presuntiva) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <form action={formAction}>
          <input type="hidden" name="idRevision" value={notificacion.idRevision} />
          {notificacion.version !== null && <input type="hidden" name="version" value={notificacion.version} />}
          <DialogHeader>
            <DialogTitle>{soloLectura ? 'Detalle de la notificación' : 'Edición de notificación'}</DialogTitle>
            <DialogDescription>
              Las correcciones quedan solo en la notificación; no modifican el padrón del SIAF.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-col gap-6">
              {soloLectura && (
                <AlertBanner variant="info">
                  La notificación está {ESTATUS_NOTIFICACION_LABEL[notificacion.estatus]}: sus datos ya no se pueden modificar.
                </AlertBanner>
              )}
              <DatosLista titulo="Datos de la orden" datos={datosOrden} />
              {notificacion.seguimiento && (
                <DatosLista
                  titulo="Seguimiento"
                  datos={datosSeguimiento(notificacion.seguimiento, notificacion.estatus)}
                />
              )}
              <div className="flex flex-col gap-4">
                <Field label="Prioridad*" htmlFor="idPrioridad" error={state.fieldErrors?.idPrioridad}>
                  <Select name="idPrioridad" value={idPrioridad} onValueChange={setIdPrioridad} disabled={soloLectura}>
                    <SelectTrigger id="idPrioridad" className="w-full">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {prioridades.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field
                  label="Domicilio*"
                  htmlFor="domicilio"
                  error={state.fieldErrors?.domicilio}
                  description={
                    notificacion.domicilio !== notificacion.domicilioOficio
                      ? `Domicilio del oficio: ${notificacion.domicilioOficio}`
                      : undefined
                  }
                >
                  <Textarea
                    id="domicilio"
                    name="domicilio"
                    rows={3}
                    defaultValue={notificacion.domicilio}
                    disabled={soloLectura}
                    required
                  />
                </Field>
                <Field
                  label="Referencia de ubicación"
                  htmlFor="referencia"
                  error={state.fieldErrors?.referencia}
                  description={
                    notificacion.referenciaOficio && notificacion.referencia !== notificacion.referenciaOficio
                      ? `Referencia del padrón: ${notificacion.referenciaOficio}`
                      : 'Entre qué calles está, características del inmueble u otras señas.'
                  }
                >
                  <Textarea
                    id="referencia"
                    name="referencia"
                    rows={3}
                    defaultValue={notificacion.referencia ?? ''}
                    disabled={soloLectura}
                  />
                </Field>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {soloLectura ? 'Cerrar' : 'Cancelar'}
            </Button>
            {!soloLectura && (
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Guardando…' : 'Guardar'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
