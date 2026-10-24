---
name: crud-form-modal
description: Genera o revisa el modal de formulario de alta/edición de un CRUD (Agregar usuario, Editar proveedor, Nuevo catálogo, etc.) en gob-design-2026 (Next.js) — estructura del diálogo, campos, Server Action, alineación y variantes de los botones Cancelar/Guardar — usando exclusivamente componentes ya existentes del Design System. Úsalo cuando el usuario pida un "modal de formulario", "modal para crear/agregar/editar <entidad>", o el modal que abre el botón principal de un `domain-list-view`.
---

# Modal de formulario CRUD — Cascarón Next

## Regla de oro

Igual que en `dashboard-view` y `domain-list-view`: se arma **componiendo**
piezas que ya existen en `src/core/components/ui/`. Nunca se crea un
componente nuevo del DS para esto. Si algo no existe ni se puede componer,
para y repórtalo en vez de inventarlo.

Consulta `AGENTS.md` para las reglas generales. Esta skill se usa junto con
`domain-list-view` (el botón principal de la toolbar y "Editar" del menú de
fila abren este modal).

**Referencia viva en el repo** — mismo patrón, ya funcionando:
`src/features/notificaciones-campo/actions.ts` (autorización en la acción),
`src/features/notificaciones-campo/components/notificacion-form-dialog.tsx` (modal con `useActionState` + `Field`
+ errores por campo) y `src/features/auth/` (login).

## Cuándo NO es esta skill

Si el modal es solo una confirmación ("¿Eliminar este registro?") sin campos,
**no** armes un `Dialog` a mano: usa `ConfirmDialog`
(`@/core/components/ui/confirm-dialog`, con `variant="destructive"` para
acciones peligrosas y `loading` mientras corre la acción). Esta skill es solo
para diálogos con campos reales (alta/edición).

## Las 3 piezas

| Pieza | Archivo | Tipo |
|---|---|---|
| Esquema Zod (única fuente de validación) | `features/<f>/schemas.ts` | compartido |
| Server Action | `features/<f>/actions.ts` | `'use server'` |
| Diálogo del formulario | `features/<f>/components/<entidad>-form-dialog.tsx` | `'use client'` |

### 1. Esquema

```ts
// features/usuarios/schemas.ts
import { z } from 'zod';

export const usuarioFormSchema = z.object({
  id: z.string().optional(), // presente = edición
  nombreCompleto: z.string().trim().min(2, 'El nombre es obligatorio'),
  usuario: z.string().trim().min(1, 'El usuario es obligatorio'),
  correo: z.string().trim().email('Correo inválido'),
  institucion: z.string().min(1, 'Selecciona una institución'),
});

export type UsuarioFormInput = z.infer<typeof usuarioFormSchema>;
```

Reutiliza campos ya definidos en `core/lib/schemas/` (p.ej. el RFC de
`core/lib/schemas/auth.ts`) en vez de reescribir el regex.

### 2. Server Action

Es un endpoint público: **autoriza, valida, ejecuta, revalida, responde**.

```ts
// features/usuarios/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { ROLES, hasAnyRole } from '@/core/auth/roles';
import { getSession } from '@/core/auth/session';
import { isApiException } from '@/core/http/api-error';
import type { ActionState } from '@/core/lib/action-state';
import { usuarioFormSchema } from './schemas';
import { createUsuario, updateUsuario } from './services/usuarios.service';

export async function saveUsuarioAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await getSession();
  if (!session || !hasAnyRole(session.user, [ROLES.admin, ROLES.supervisor])) return { error: 'No autorizado' };

  const parsed = usuarioFormSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors = Object.fromEntries(parsed.error.issues.map((i) => [String(i.path[0]), i.message]));
    return { error: 'Revisa los campos marcados', fieldErrors };
  }

  const { id, ...data } = parsed.data;
  try {
    if (id) await updateUsuario(id, data);
    else await createUsuario(data);
  } catch (err) {
    if (isApiException(err)) {
      const fieldErrors = err.error.fieldErrors
        ? Object.fromEntries(err.error.fieldErrors.map((f) => [f.field, f.message]))
        : undefined;
      return { error: err.error.message, fieldErrors };
    }
    return { error: 'No se pudo guardar el usuario' };
  }

  revalidatePath('/usuarios');
  return { success: true };
}
```

Nunca devuelvas la `ApiException` (instancia de clase) — solo su `message` y
`fieldErrors`. Si el mapeo de `fieldErrors` se repite en 2+ features, súbelo a
un helper en `core/lib/utils/`.

### 3. Diálogo — estructura obligatoria

`DialogContent` ya define el contenedor (`max-h-[90vh]`, scroll en el cuerpo,
botón de cerrar). Solo proyecta el contenido en sus piezas:

1. **`DialogHeader`**: `DialogTitle` + `DialogDescription` opcional.
2. **`DialogBody`**: campos del formulario, uno debajo de otro. Ya trae
   `overflow-y-auto` — el scroll con muchos campos es nativo, no lo armes.
3. **`DialogFooter`**: botones de acción.

El `<form>` envuelve header, body y footer (así el botón de submit vive en el
footer), igual que en `admin-create-user-form.tsx`.

```tsx
'use client';

import { useActionState, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/core/components/ui/button';
import { Field } from '@/core/components/ui/field';
import { Input } from '@/core/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/core/components/ui/select';
import {
  Dialog, DialogBody, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/core/components/ui/dialog';
import type { ActionState } from '@/core/lib/action-state';
import { saveUsuarioAction } from '../actions';
import type { Usuario } from '../types';
import { INSTITUCIONES } from '../constants';

interface UsuarioFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Si viene, es edición. */
  usuario?: Usuario;
}

const initialState: ActionState = {};

export function UsuarioFormDialog({ open, onOpenChange, usuario }: UsuarioFormDialogProps) {
  const isEdit = !!usuario;
  const [state, formAction, isPending] = useActionState(saveUsuarioAction, initialState);
  const [institucion, setInstitucion] = useState(usuario?.institucion ?? '');

  useEffect(() => {
    if (state.success) {
      toast.success(isEdit ? 'Usuario actualizado' : 'Usuario creado');
      onOpenChange(false);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, isEdit, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form action={formAction}>
          {usuario && <input type="hidden" name="id" value={usuario.id} />}
          <DialogHeader>
            <DialogTitle>{isEdit ? 'Editar usuario' : 'Agregar usuario'}</DialogTitle>
            <DialogDescription>Los campos con * son obligatorios</DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="flex flex-col gap-4">
              <Field label="Nombre completo*" htmlFor="nombreCompleto" error={state.fieldErrors?.nombreCompleto}>
                <Input id="nombreCompleto" name="nombreCompleto" defaultValue={usuario?.nombreCompleto} required />
              </Field>
              <Field label="Correo*" htmlFor="correo" error={state.fieldErrors?.correo}>
                <Input id="correo" name="correo" type="email" defaultValue={usuario?.correo} required />
              </Field>
              <Field label="Institución*" htmlFor="institucion" error={state.fieldErrors?.institucion}>
                <Select name="institucion" value={institucion} onValueChange={setInstitucion}>
                  <SelectTrigger id="institucion" className="w-full"><SelectValue placeholder="Selecciona" /></SelectTrigger>
                  <SelectContent>
                    {INSTITUCIONES.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </DialogBody>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Guardando…' : isEdit ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

## Alineación de los botones (verificado contra el componente)

**No hace falta CSS propio para alinear el footer** — `DialogFooter` ya es
`flex items-center justify-end gap-2` (`dialog.tsx`), así que los botones
quedan a la derecha y en el orden en que los escribas.

Orden obligatorio, izquierda → derecha, igual que la toolbar de `domain-list-view`:

1. `Button variant="outline" type="button"` — **Cancelar**.
2. `Button` con la variante por defecto, `type="submit"` — **Crear** / **Guardar**
   (siempre el de mayor jerarquía, siempre el último/más a la derecha).

No inviertas el orden ni cambies las variantes: `outline` nunca va después del
primario, y el botón de confirmar nunca es `outline`. Cancelar siempre
`type="button"` para que no envíe el formulario.

## Un componente, dos modos (crear / editar)

No dupliques el diálogo por modo. El mismo componente recibe la entidad
opcional (`usuario?: Usuario`); si viene, es edición: título, texto del botón,
`defaultValue` de cada campo y un `<input type="hidden" name="id">`. Una sola
Server Action decide crear o actualizar según venga `id`.

La página/listado controla el estado de apertura:

```tsx
const [createOpen, setCreateOpen] = useState(false);
const [editing, setEditing] = useState<Usuario | undefined>();

<UsuarioFormDialog open={createOpen} onOpenChange={setCreateOpen} />
<UsuarioFormDialog
  key={editing?.id} // remonta al cambiar de registro: defaultValues frescos y estado de la acción limpio
  open={!!editing}
  onOpenChange={(open) => !open && setEditing(undefined)}
  usuario={editing}
/>
```

`DialogContent` ya tiene ancho `sm:max-w-lg`; amplíalo con `className` solo
si el formulario realmente lo necesita (campos en fila o más de ~6 campos).

## Validación y errores

- **Zod es la única fuente de validación** y vive en `schemas.ts`. Los
  atributos HTML (`required`, `type="email"`, `minLength`) son solo ayuda
  inmediata en el navegador — la validación real siempre ocurre en la Server Action.
- Si el formulario necesita validación en vivo (campos dependientes, errores
  al escribir), usa `react-hook-form` + `zodResolver(usuarioFormSchema)` con
  el **mismo** esquema, y la Server Action sigue validando igual.
- Error por campo → prop `error` de `Field` (ya pinta el borde rojo vía
  `aria-invalid` y muestra `FieldError`). No escribas un `<p>` de error a mano.
- Error general → `toast.error(state.error)`, como en admin.
- Marca los obligatorios con `*` al final del `label`.

## Gaps conocidos

- No hay un componente que envuelva "form dentro de dialog" con los dos modos
  resueltos — el patrón de arriba (entidad opcional + `isEdit`) es la
  convención del proyecto; replícalo igual en cada dominio en vez de variarlo.
- `Field` no tiene variante "select": un catálogo dentro del formulario se
  resuelve con `Select` dentro de `Field`, como en el ejemplo. No es un hack.

## Checklist antes de dar por terminado un modal CRUD

- [ ] Footer con exactamente 2 botones: `outline` (Cancelar, `type="button"`) primero, primario (`type="submit"`) al final.
- [ ] No se agregó CSS de alineación al footer — ya viene de `DialogFooter`.
- [ ] Un solo componente cubre alta y edición (entidad opcional por props).
- [ ] Esquema Zod en `schemas.ts`; la Server Action autoriza y valida con él antes de llamar al service.
- [ ] La acción devuelve `ActionState` (objeto plano), nunca lanza ni devuelve instancias de clase.
- [ ] Errores por campo vía `Field error=`, no markup manual.
- [ ] Al guardar: `revalidatePath` en la acción y el diálogo se cierra en `state.success`.
- [ ] Confirmaciones sin campos usan `ConfirmDialog`, no esta skill.
- [ ] Ningún hex ni valor mágico fuera de tokens y utilidades `ds-*`.
