'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/core/components/ui/badge';
import { Button } from '@/core/components/ui/button';
import { ConfirmDialog } from '@/core/components/ui/confirm-dialog';
import { Field } from '@/core/components/ui/field';
import { RadioGroup, RadioGroupItem } from '@/core/components/ui/radio-group';
import { Separator } from '@/core/components/ui/separator';
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/core/components/ui/sheet';
import { Textarea } from '@/core/components/ui/textarea';
import { ESTATUS_NOTIFICACION_BADGE, ESTATUS_NOTIFICACION_LABEL } from '@/core/lib/domain/notificaciones';
import { formatDateTime } from '@/core/lib/utils/format';
import { registrarResultadoAction, type ResultadoState } from '../actions';
import { RESULTADO_OPCIONES } from '../constants';
import { MAX_OBSERVACIONES, RESULTADOS, type Resultado } from '../schemas';
import type { MiNotificacion } from '../types';
import { SoportesGaleria } from './soportes-galeria';

interface CapturaSheetProps {
  notificacion: MiNotificacion;
  /** Paquete Abierto: único estado en que se registra y se manejan fotografías. */
  editable: boolean;
  onOpenChange: (open: boolean) => void;
}

function esResultado(valor: string): valor is Resultado {
  return RESULTADOS.some((r) => r === valor);
}

/**
 * Hoja de captura de una notificación (PRD 8), pensada para el celular: domicilio arriba, luego fotografías y al final
 * el resultado. Registrar exige al menos una foto y pide confirmación porque el resultado es final (RN-05); la fecha y
 * hora las pone el servidor. Con resultado o con el paquete no Abierto es solo consulta.
 */
export function CapturaSheet({ notificacion, editable, onOpenChange }: CapturaSheetProps) {
  const [state, formAction, pending] = useActionState<ResultadoState, FormData>(registrarResultadoAction, {});
  const formulario = useRef<HTMLFormElement>(null);
  const [resultado, setResultado] = useState<Resultado>();
  const [observaciones, setObservaciones] = useState('');
  const [confirmando, setConfirmando] = useState(false);

  const porNotificar = notificacion.estatus === 'POR_NOTIFICAR';
  const capturable = editable && porNotificar;
  const sinFotos = notificacion.soportes.length === 0;
  const etiquetaResultado = RESULTADO_OPCIONES.find((o) => o.value === resultado)?.label;

  useEffect(() => {
    if (state.success) {
      toast.success(
        state.paqueteCerrado
          ? 'Resultado registrado. Era la última notificación: el paquete se cerró.'
          : 'Resultado registrado',
      );
      onOpenChange(false);
    } else if (state.error) {
      setConfirmando(false);
      toast.error(state.error);
    }
  }, [state, onOpenChange]);

  return (
    <Sheet open onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="max-h-[92dvh] gap-0 overflow-y-auto rounded-t-2xl border-border-low bg-bg-base md:inset-x-auto md:left-1/2 md:w-full md:max-w-lg md:-translate-x-1/2"
      >
        <SheetHeader className="gap-1 border-b border-border-low pr-12">
          <div className="flex flex-wrap items-center gap-2">
            <SheetTitle className="ds-heading-sm text-content-high">{notificacion.numeroOrden}</SheetTitle>
            <Badge variant={ESTATUS_NOTIFICACION_BADGE[notificacion.estatus]}>
              {ESTATUS_NOTIFICACION_LABEL[notificacion.estatus]}
            </Badge>
          </div>
          <SheetDescription className="ds-body-md text-content-high">{notificacion.domicilio}</SheetDescription>
          {notificacion.referencia && (
            <p className="ds-body-sm text-content-low">Ref. » {notificacion.referencia}</p>
          )}
        </SheetHeader>

        <div className="flex flex-col gap-6 p-4">
          <SoportesGaleria
            idNotificacion={notificacion.idNotificacion}
            soportes={notificacion.soportes}
            editable={editable}
            conservarUna={!porNotificar}
          />

          <Separator />

          {capturable ? (
            <form ref={formulario} action={formAction} className="flex flex-col gap-4">
              <input type="hidden" name="idNotificacion" value={notificacion.idNotificacion} />
              <input type="hidden" name="version" value={notificacion.version} />
              <input type="hidden" name="resultado" value={resultado ?? ''} />
              <fieldset className="flex flex-col gap-2">
                <legend className="ds-label-md mb-2 text-content-high">Resultado *</legend>
                <RadioGroup
                  value={resultado ?? ''}
                  onValueChange={(valor) => esResultado(valor) && setResultado(valor)}
                  className="grid grid-cols-1 gap-2 sm:grid-cols-2"
                >
                  {RESULTADO_OPCIONES.map((opcion) => (
                    <label
                      key={opcion.value}
                      htmlFor={`resultado-${opcion.value}`}
                      className="flex min-h-14 cursor-pointer items-start gap-3 rounded-xl border border-border-low p-3 has-[[data-state=checked]]:border-accent-primary has-[[data-state=checked]]:bg-bg-surface-low"
                    >
                      <RadioGroupItem id={`resultado-${opcion.value}`} value={opcion.value} className="mt-0.5" />
                      <span className="flex flex-col gap-0.5">
                        <span className="ds-label-md text-content-high">{opcion.label}</span>
                        <span className="ds-body-sm text-content-low">{opcion.description}</span>
                      </span>
                    </label>
                  ))}
                </RadioGroup>
                {state.fieldErrors?.resultado && (
                  <p className="ds-body-sm text-support-error">{state.fieldErrors.resultado}</p>
                )}
              </fieldset>
              <Field
                label="Observaciones (opcional)"
                htmlFor={`observaciones-${notificacion.idNotificacion}`}
                error={state.fieldErrors?.observaciones}
                description={`${observaciones.length}/${MAX_OBSERVACIONES}`}
              >
                <Textarea
                  id={`observaciones-${notificacion.idNotificacion}`}
                  name="observaciones"
                  rows={3}
                  maxLength={MAX_OBSERVACIONES}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Por ejemplo: recibió el encargado del establecimiento"
                />
              </Field>
              {sinFotos && (
                <p className="ds-body-sm text-content-low">Agrega al menos una fotografía para registrar el resultado.</p>
              )}
            </form>
          ) : (
            <ResultadoConsulta notificacion={notificacion} editable={editable} />
          )}
        </div>

        <SheetFooter className="sticky bottom-0 flex-row justify-end gap-2 border-t border-border-low bg-bg-base">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {capturable ? 'Cancelar' : 'Cerrar'}
          </Button>
          {capturable && (
            <Button type="button" disabled={sinFotos || !resultado || pending} onClick={() => setConfirmando(true)}>
              Registrar
            </Button>
          )}
        </SheetFooter>

        <ConfirmDialog
          open={confirmando}
          onOpenChange={setConfirmando}
          title={`¿Registrar ${etiquetaResultado ?? 'el resultado'}?`}
          description="Se guardará con la fecha y hora actuales y no podrá cambiarse."
          confirmLabel="Registrar"
          loading={pending}
          onConfirm={() => formulario.current?.requestSubmit()}
        />
      </SheetContent>
    </Sheet>
  );
}

/** Resultado ya registrado (o paquete no Abierto): solo consulta. */
function ResultadoConsulta({ notificacion, editable }: { notificacion: MiNotificacion; editable: boolean }) {
  if (notificacion.estatus === 'POR_NOTIFICAR') {
    return (
      <p className="ds-body-sm text-content-low">
        {editable ? 'Sin resultado todavía.' : 'Podrás registrar el resultado cuando el paquete esté Abierto.'}
      </p>
    );
  }
  const etiquetaFecha = notificacion.estatus === 'NOTIFICADO' ? 'Fecha y hora de notificación' : 'Fecha y hora de visita';
  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="flex flex-col gap-0.5">
        <dt className="ds-label-sm text-content-low">Resultado</dt>
        <dd>
          <Badge variant={ESTATUS_NOTIFICACION_BADGE[notificacion.estatus]}>
            {ESTATUS_NOTIFICACION_LABEL[notificacion.estatus]}
          </Badge>
        </dd>
      </div>
      <div className="flex flex-col gap-0.5">
        <dt className="ds-label-sm text-content-low">{etiquetaFecha}</dt>
        <dd className="ds-body-md text-content-high">{formatDateTime(notificacion.fechaResultado)}</dd>
      </div>
      {notificacion.observaciones && (
        <div className="flex flex-col gap-0.5 sm:col-span-2">
          <dt className="ds-label-sm text-content-low">Observaciones</dt>
          <dd className="ds-body-md whitespace-pre-line text-content-high">{notificacion.observaciones}</dd>
        </div>
      )}
    </dl>
  );
}
