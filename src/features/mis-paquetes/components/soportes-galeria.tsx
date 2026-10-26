'use client';

import { useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Camera, ImageOff, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/core/components/ui/button';
import { ConfirmDialog } from '@/core/components/ui/confirm-dialog';
import { formatDateTime } from '@/core/lib/utils/format';
import { quitarSoporteAction } from '../actions';
import {
  MAX_SOPORTES,
  MAX_TAMANO_SOPORTE_BYTES,
  MAX_TAMANO_SOPORTE_MB,
  SUBIR_SOPORTE_URL,
  TIPOS_SOPORTE,
  soporteUrl,
} from '../constants';
import type { SoporteMio } from '../types';

const MINIATURA_PX = 112;

interface SoportesGaleriaProps {
  idNotificacion: number;
  soportes: readonly SoporteMio[];
  /** Paquete Abierto: se pueden agregar y quitar fotografías. */
  editable: boolean;
  /** Con resultado registrado la notificación conserva al menos una fotografía. */
  conservarUna: boolean;
}

interface Subida {
  readonly clave: string;
  readonly nombre: string;
}

function esTipoValido(tipo: string): tipo is (typeof TIPOS_SOPORTE)[number] {
  return TIPOS_SOPORTE.some((permitido) => permitido === tipo);
}

/**
 * Fotografías de la notificación (RN-08): miniaturas, carga desde la cámara o la galería del celular y baja lógica. Se
 * suben una por una al route handler propio (el navegador nunca llama a la API) mostrando cuáles faltan; el backend
 * vuelve a validar tipo por contenido, tamaño, máximo y que el paquete siga Abierto.
 */
export function SoportesGaleria({ idNotificacion, soportes, editable, conservarUna }: SoportesGaleriaProps) {
  const router = useRouter();
  const entrada = useRef<HTMLInputElement>(null);
  const [subidas, setSubidas] = useState<readonly Subida[]>([]);
  const [porQuitar, setPorQuitar] = useState<SoporteMio>();
  const [quitando, startQuitar] = useTransition();

  const disponibles = MAX_SOPORTES - soportes.length - subidas.length;
  const bloqueadaUltima = conservarUna && soportes.length <= 1;

  async function subir(archivos: FileList | null) {
    if (!archivos || archivos.length === 0) return;
    const seleccion = Array.from(archivos);
    if (seleccion.length > disponibles) {
      toast.warning(`Solo puedes agregar ${disponibles} fotografía(s) más (máximo ${MAX_SOPORTES}).`);
    }
    for (const archivo of seleccion.slice(0, Math.max(disponibles, 0))) {
      if (!esTipoValido(archivo.type)) {
        toast.error(`${archivo.name}: solo se aceptan fotografías JPEG o PNG.`);
        continue;
      }
      if (archivo.size > MAX_TAMANO_SOPORTE_BYTES) {
        toast.error(`${archivo.name}: excede ${MAX_TAMANO_SOPORTE_MB} MB.`);
        continue;
      }
      const clave = `${archivo.name}-${archivo.lastModified}-${archivo.size}`;
      setSubidas((actuales) => [...actuales, { clave, nombre: archivo.name }]);
      const form = new FormData();
      form.set('idNotificacion', String(idNotificacion));
      form.set('archivo', archivo);
      try {
        const respuesta = await fetch(SUBIR_SOPORTE_URL, { method: 'POST', body: form });
        if (!respuesta.ok) {
          const cuerpo: unknown = await respuesta.json().catch(() => null);
          toast.error(mensajeDeError(cuerpo) ?? `No se pudo subir ${archivo.name}.`);
        }
      } catch {
        toast.error(`No se pudo subir ${archivo.name}: revisa tu conexión.`);
      } finally {
        setSubidas((actuales) => actuales.filter((s) => s.clave !== clave));
        router.refresh();
      }
    }
    if (entrada.current) entrada.current.value = '';
  }

  const quitar = (soporte: SoporteMio) =>
    startQuitar(async () => {
      const datos = new FormData();
      datos.set('idSoporte', String(soporte.idSoporte));
      const respuesta = await quitarSoporteAction({}, datos);
      if (respuesta.success) {
        toast.success('Fotografía quitada');
        setPorQuitar(undefined);
      } else if (respuesta.error) {
        toast.error(respuesta.error);
      }
    });

  return (
    <section className="flex flex-col gap-3" aria-labelledby={`fotos-${idNotificacion}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 id={`fotos-${idNotificacion}`} className="ds-label-md text-content-high">
          Fotografías ({soportes.length}/{MAX_SOPORTES})
        </h3>
        {editable && (
          <>
            {/* STOPGAP: falta carga de archivos en el DS — input nativo oculto disparado por un Button del DS. */}
            <input
              ref={entrada}
              type="file"
              accept={TIPOS_SOPORTE.join(',')}
              capture="environment"
              multiple
              hidden
              onChange={(e) => void subir(e.target.files)}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disponibles <= 0}
              onClick={() => entrada.current?.click()}
            >
              <Camera />
              Tomar o elegir foto
            </Button>
          </>
        )}
      </div>

      {soportes.length === 0 && subidas.length === 0 ? (
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-border-low p-4">
          <ImageOff className="size-5 flex-shrink-0 text-content-low" aria-hidden />
          <p className="ds-body-sm text-content-low">
            {editable ? 'Agrega al menos una fotografía para registrar el resultado.' : 'Sin fotografías.'}
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {soportes.map((soporte) => (
            <li key={soporte.idSoporte} className="relative">
              <a href={soporteUrl(soporte.idSoporte)} target="_blank" rel="noopener noreferrer" className="block">
                <Image
                  src={soporteUrl(soporte.idSoporte)}
                  alt={`Fotografía del ${formatDateTime(soporte.fechaAlta)}`}
                  width={MINIATURA_PX}
                  height={MINIATURA_PX}
                  unoptimized
                  className="aspect-square w-full rounded-xl border border-border-low object-cover"
                />
              </a>
              {editable && !bloqueadaUltima && (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  aria-label="Quitar fotografía"
                  className="absolute top-1 right-1 size-8"
                  onClick={() => setPorQuitar(soporte)}
                >
                  <Trash2 />
                </Button>
              )}
            </li>
          ))}
          {subidas.map((subida) => (
            <li
              key={subida.clave}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-border-low bg-bg-surface-low p-2"
            >
              <Loader2 className="size-5 animate-spin text-content-low" aria-hidden />
              <span className="ds-label-sm w-full truncate text-center text-content-low">Subiendo…</span>
            </li>
          ))}
        </ul>
      )}
      {editable && bloqueadaUltima && (
        <p className="ds-body-sm text-content-low">Con resultado registrado se conserva al menos una fotografía.</p>
      )}

      <ConfirmDialog
        open={!!porQuitar}
        onOpenChange={(open) => !open && setPorQuitar(undefined)}
        title="¿Quitar esta fotografía?"
        description="Dejará de mostrarse como soporte de la notificación."
        confirmLabel="Quitar"
        variant="destructive"
        loading={quitando}
        onConfirm={() => porQuitar && quitar(porQuitar)}
      />
    </section>
  );
}

/** `{ error }` del route handler de carga, si viene. */
function mensajeDeError(cuerpo: unknown): string | undefined {
  if (typeof cuerpo === 'object' && cuerpo !== null && 'error' in cuerpo && typeof cuerpo.error === 'string') {
    return cuerpo.error;
  }
  return undefined;
}
