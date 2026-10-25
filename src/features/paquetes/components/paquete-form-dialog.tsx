'use client';

import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import { Input } from '@/core/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import type { ActionState } from '@/core/lib/action-state';
import { toIsoDate } from '@/core/lib/utils/format';
import { guardarPaqueteAction } from '../actions';
import type { NotificacionDisponible, Notificador, PaqueteDetalle } from '../types';
import { AsignacionDualList } from './asignacion-dual-list';

interface PaqueteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notificadores: readonly Notificador[];
  /** Paquete Programado a editar, leído en el servidor; sin él, el modal es el alta. */
  paquete?: PaqueteDetalle;
}

const initialState: ActionState = {};

/** El aplicativo actual sugiere el día siguiente como fecha programada (PRD 7.1); se puede cambiar libremente. */
function manana(): string {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + 1);
  return toIsoDate(fecha);
}

/**
 * Registro y edición de paquete (PRD 7.1): fecha programada, notificador y asignación con lista dual. Un mismo
 * componente para los dos modos; la edición solo existe mientras el paquete está Programado (el backend lo valida).
 */
export function PaqueteFormDialog({ open, onOpenChange, notificadores, paquete }: PaqueteFormDialogProps) {
  const [state, formAction, isPending] = useActionState(guardarPaqueteAction, initialState);
  const isEdit = !!paquete;
  const iniciales: readonly NotificacionDisponible[] = paquete?.notificaciones ?? [];
  const [asignadas, setAsignadas] = useState<readonly NotificacionDisponible[]>(iniciales);
  const [idNotificador, setIdNotificador] = useState(paquete ? String(paquete.paquete.idNotificador) : '');

  useEffect(() => {
    if (state.success) {
      toast.success(isEdit ? 'Paquete actualizado' : 'Paquete registrado');
      onOpenChange(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, isEdit, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <form action={formAction}>
          {paquete && (
            <>
              <input type="hidden" name="id" value={paquete.paquete.idPaquete} />
              <input type="hidden" name="version" value={paquete.paquete.version} />
            </>
          )}
          {asignadas.map((n) => (
            <input key={n.idRevision} type="hidden" name="idsRevision" value={n.idRevision} />
          ))}
          <DialogHeader>
            <DialogTitle>{isEdit ? `Edición del paquete #${paquete.paquete.idPaquete}` : 'Nuevo paquete'}</DialogTitle>
            <DialogDescription>Los campos con * son obligatorios.</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Fecha programada*" htmlFor="fechaProgramada" error={state.fieldErrors?.fechaProgramada}>
                  <Input
                    id="fechaProgramada"
                    name="fechaProgramada"
                    type="date"
                    defaultValue={paquete?.paquete.fechaProgramada ?? manana()}
                    required
                  />
                </Field>
                <Field
                  label="Notificador*"
                  htmlFor="idNotificador"
                  error={state.fieldErrors?.idNotificador}
                  description="Solo aparecen los notificadores con correo registrado: ahí reciben el aviso del paquete."
                >
                  <Select name="idNotificador" value={idNotificador} onValueChange={setIdNotificador}>
                    <SelectTrigger id="idNotificador" className="w-full">
                      <SelectValue placeholder="Selecciona" />
                    </SelectTrigger>
                    <SelectContent>
                      {notificadores.map((n) => (
                        <SelectItem key={n.idUsuario} value={String(n.idUsuario)}>
                          {n.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <Field
                label="Notificaciones*"
                htmlFor="asignacion"
                error={state.fieldErrors?.idsRevision}
                description="Al quitar una notificación del paquete, regresa a Por Asignar."
              >
                <div id="asignacion">
                  <AsignacionDualList
                    asignadas={asignadas}
                    onAsignadasChange={setAsignadas}
                    iniciales={iniciales}
                    disabled={isPending}
                  />
                </div>
              </Field>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando…' : isEdit ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
