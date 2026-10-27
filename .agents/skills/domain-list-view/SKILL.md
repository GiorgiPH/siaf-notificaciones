---
name: domain-list-view
description: Genera o revisa una pantalla de listado de un dominio de negocio (Usuarios, Proveedores, Catálogos, etc.) en siaf-notificaciones (Next.js) — título, tabs de estado opcionales, filtros, botones de acción, tabla y paginador — siguiendo la estructura visual estándar del proyecto y usando exclusivamente componentes ya existentes del Design System. Úsalo cuando el usuario pida crear o ajustar un "listado", "catálogo", "tabla de <entidad>", o cualquier vista de tipo "administrar/gestionar <entidad>".
---

# Vista de listado de dominio — Cascarón Next

## Regla de oro

Igual que en `dashboard-view`: la vista se arma **componiendo** piezas que ya
existen en `src/core/components/ui/`. Nunca se crea un componente nuevo del
DS para esto. Si algo no existe ni se puede componer, para y repórtalo (ver
"Gaps conocidos") en vez de inventarlo.

Consulta primero `AGENTS.md` para las reglas generales — esta skill solo
cubre la estructura del listado.

## Estructura obligatoria (de arriba hacia abajo)

1. **Header de página**: título + acciones rápidas a la derecha.
2. **Tabs de estado** (opcional — solo si el dominio los necesita).
3. **Barra de filtros y acciones**: filtros a la izquierda, botones a la derecha.
4. **Tabla** (o `EmptyState` si no hay resultados).
5. **Paginador**.

La mayoría de los listados abren un **modal de alta/edición** desde el botón
principal — ver skill `crud-form-modal`.

La lista de bloques es un máximo: no agregues tabs de estado si la entidad no
tiene estados.

## Estado en la URL, datos en el servidor

Búsqueda, filtros, tab y página viven en `searchParams` — **no** en
`useState`. Así el listado es compartible, sobrevive al refresh y la página
(Server Component) pide al backend exactamente lo que se ve.

```tsx
// src/app/(app)/usuarios/page.tsx — Server Component
import { listUsuarios } from '@/features/usuarios/services/usuarios.service';
import { usuariosQuerySchema } from '@/features/usuarios/schemas';
import { UsuariosListView } from '@/features/usuarios/components/usuarios-list-view';

export default async function UsuariosListPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = usuariosQuerySchema.parse(await searchParams); // Zod: defaults + coerción, nunca confiar en la URL
  const { data } = await listUsuarios(query);
  return <UsuariosListView query={query} result={data} />;
}
```

El componente client que cambia filtros actualiza la URL con un hook propio
de la feature (o de `core/lib/hooks/` cuando lo usen 2+ features):

```tsx
'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export function useQueryParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  return (patch: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined || value === '') next.delete(key);
      else next.set(key, String(value));
    }
    if (!('page' in patch)) next.delete('page'); // cambiar un filtro regresa a la página 1
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };
}
```

Para la búsqueda de texto libre aplica debounce (~300 ms) antes de escribir
en la URL; no hagas una navegación por tecla.

### 1. Header de página

`AppPageHeader` (mismo que `dashboard-view`) con el dominio en plural
(`title="Usuarios"`) y sin subtítulo. Si el listado tiene acciones globales
que no son de la toolbar, van en su prop `actions`.

### 2. Tabs de estado (solo si el dominio los tiene)

`FilterTabs` — ya soporta contador por tab (`count`), exactamente el
"Activos 5 / Inhabilitados 1" de la referencia. No uses `Tabs` aquí: ese
componente es para tabs con panel asociado (contenido que cambia de raíz),
no para filtrar una misma tabla.

```tsx
import { FilterTabs, type FilterTabItem } from '@/core/components/ui/filter-tabs';

const estadoTabs: FilterTabItem[] = [
  { value: 'activos', label: 'Activos', count: result.totales.activos },
  { value: 'inhabilitados', label: 'Inhabilitados', count: result.totales.inhabilitados },
];

<FilterTabs items={estadoTabs} value={query.estado} onValueChange={(estado) => setParams({ estado })} />
```

Los contadores vienen del backend (en la misma respuesta), no se calculan
filtrando en el cliente.

### 3. Barra de filtros y acciones

```tsx
<div className="flex flex-wrap items-center justify-between gap-4">
  <div className="flex flex-wrap items-center gap-2">{/* filtros */}</div>
  <div className="flex items-center gap-2">{/* botones */}</div>
</div>
```

**Izquierda — filtros** (la cantidad depende del dominio):
- Búsqueda de texto libre → `SearchInput` (input compacto con lupa). **No uses
  `SearchBar`** — ese es el buscador tipo píldora grande para portadas.
- Cada filtro de catálogo (institución, rol, tipo…) → un `Select` por filtro
  (`Select` + `SelectTrigger` + `SelectValue` + `SelectContent` + `SelectItem`).
  Las opciones vienen de constantes nombradas o del backend, nunca literales
  repetidos en el JSX.

**Derecha — botones de acción**, siempre en este orden de izquierda a derecha
(menor → mayor jerarquía, el más importante queda al extremo derecho):
- Acciones secundarias (exportar, importar…) → `Button variant="outline"`.
- Acción principal del dominio (crear/agregar) → `Button` con la variante por
  defecto (`variant="default"`, el primario del DS), siempre la última.

```tsx
<SearchInput placeholder="Buscar por nombre o usuario..." value={search} onChange={setSearch} />
<Select value={query.institucion ?? ''} onValueChange={(institucion) => setParams({ institucion })}>
  <SelectTrigger className="w-56"><SelectValue placeholder="Institución" /></SelectTrigger>
  <SelectContent>
    {instituciones.map((i) => <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>)}
  </SelectContent>
</Select>

<Button variant="outline" onClick={onExport}>Exportar</Button>
<Button onClick={() => setCreateOpen(true)}>Agregar usuario</Button>
```

### 4. Tabla

`Table` + `TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell`. Estados
de fila → `Badge` con variante semántica (`success`, `warning`, `info`,
`rose`, `slate`), mapeada desde una constante `Record<Estado, BadgeVariant>`
— nunca un color a mano. Acciones por fila ("…") → `DropdownMenu` con
`DropdownMenuItem` (`variant="destructive"` para la acción peligrosa).

Referencia real y completa en el repo, cópiala como base:
`src/features/notificaciones-campo/components/notificaciones-table.tsx` (el catálogo con todas las variantes está en
`/showcase/tables` de `siaf`).

**Excepción: vistas que se usan desde el celular en campo** (portal del notificador). Una tabla no cabe en 375 px:
cada registro es un `Card` que se toca completo (`Link` o botón de acción ancho completo), en una columna en celular y
2–3 desde `md`/`xl`. El resto de la estructura (tabs en la URL, `EmptyState`, `PaginationControls`) no cambia.
Referencia: `src/features/mis-paquetes/components/mis-paquetes-list-view.tsx`.

La `Table` del DS no trae marco: va dentro del contenedor de la "Tabla completa"
del catálogo, siempre con estas mismas clases (tokens del DS):

```tsx
<div className="w-full overflow-hidden rounded-2xl border border-border-low bg-bg-base shadow-sm">
  <Table>…</Table>
</div>
```

Todas las filas tienen su menú "…" con al menos una acción: si el registro ya no
se puede editar por su estado, la acción es "Ver detalle" (ícono `Eye`) y abre
el **mismo** modal en solo lectura — la columna de acciones nunca queda con
texto suelto. El dato secundario de una celda (p. ej. el paquete de una
notificación) va debajo del principal con `ds-body-sm text-content-low`.

```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Nombre completo</TableHead>
      <TableHead>Usuario</TableHead>
      <TableHead>Estado</TableHead>
      <TableHead className="text-center">Acciones</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {result.items.map((row) => (
      <TableRow key={row.id}>
        <TableCell>{row.nombreCompleto}</TableCell>
        <TableCell>{row.usuario}</TableCell>
        <TableCell><Badge variant={ESTADO_BADGE[row.estado]}>{ESTADO_LABEL[row.estado]}</Badge></TableCell>
        <TableCell className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" variant="ghost" aria-label="Más acciones"><MoreHorizontal /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditing(row)}><Pencil className="size-4" /> Editar</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onSelect={() => setDisabling(row)}>
                <Trash2 className="size-4" /> Inhabilitar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

- La acción destructiva confirma con `ConfirmDialog` (`variant="destructive"`)
  antes de llamar a su Server Action — ver `crud-form-modal` § "Cuándo NO es esta skill".
- **Carga** → `loading.tsx` del segmento con la misma forma de la pantalla:
  `AppPageHeader` (el título en una constante compartida con la página), un
  `Skeleton` por tab, los filtros y `TableSkeleton` (`columns`, `headers` desde
  la misma constante de columnas que usa la tabla). No un spinner suelto: si el
  header desaparece mientras carga, la pantalla brinca.
- **Sin resultados** → `EmptyState` (`icon`, `title`, `description`, y
  `actionLabel`/`onAction` si tiene sentido crear el primero), nunca una tabla
  vacía ni un `<p>` suelto. Con `total === 0` tampoco se pinta el paginador.
  `EmptyState` es Client Component y su `icon` es una función: úsalo desde la
  vista client; en un Server Component, un aviso va en `AlertBanner`.
- **Error de la API** → `AlertBanner variant="error"` con `error.message`
  (el `ApiError` ya trae un mensaje seguro para UI), o deja que lo tome `error.tsx`.

### 5. Paginador

`PaginationControls` ya se auto-centra (su contenedor interno es
`flex flex-col items-center`) — no le agregues un wrapper de centrado extra,
solo evita meterlo en un `flex` con `items-*` distinto que lo empuje a un lado.
`page` y `limit` vienen de la URL, `total` del backend.

```tsx
<PaginationControls
  page={query.page}
  limit={query.limit}
  total={result.total}
  onPageChange={(page) => setParams({ page })}
  onLimitChange={(limit) => setParams({ limit, page: 1 })}
/>
```

## Modal de alta/edición (desde el botón principal)

El botón primario de la toolbar y la acción "Editar" del menú de fila abren el
**mismo** componente de diálogo de la feature. Patrón completo en la skill
`crud-form-modal`. Al guardar, la Server Action hace `revalidatePath` y el
listado (server) se refresca solo — no recargues la tabla a mano.

## Gaps conocidos

- El hook de URL state ya vive en `core/lib/hooks/use-query-params.ts`
  (`useQueryParams`, con `{ resetPage: false }` para parámetros que no filtran,
  como el que abre un modal). Úsalo; no lo copies a la feature.
- Rango de fechas en filtros → `DateRangePicker` (`core/components/ui/date-range-picker.tsx`),
  composición de `Popover` + `Calendar` mientras el DS no publique el suyo.

## Dónde va el archivo

- Ruta: `src/app/(app)/<feature>/page.tsx` (Server Component), función
  `<Feature>ListPage`. `loading.tsx` en la misma carpeta.
- Vista client (toolbar, tabla con menú, estado de modales):
  `src/features/<feature>/components/<feature>-list-view.tsx`.
- Esquema de query params + tipos: `src/features/<feature>/schemas.ts`.
- Lectura: `src/features/<feature>/services/<feature>.service.ts` vía `apiClient`.

Ver `AGENTS.md` § "Dónde va cada cosa nueva".

## Checklist antes de dar por terminado un listado

- [ ] Filtros, tab y página viven en la URL y se validan con Zod en la página.
- [ ] La página es Server Component y obtiene datos vía service + `apiClient`.
- [ ] Botones de la toolbar en orden secundario → primario, primario al final.
- [ ] Secundarios en `variant="outline"`, principal con la variante por defecto.
- [ ] Tabs de estado solo si el dominio realmente tiene estados (`FilterTabs`, no `Tabs`).
- [ ] Buscador es `SearchInput`, no `SearchBar`, y con debounce.
- [ ] Estados de fila son `Badge` con variante semántica desde una constante.
- [ ] `loading.tsx` con `TableSkeleton`; `EmptyState` sin resultados.
- [ ] Paginador sin wrapper de centrado redundante.
- [ ] Ningún hex ni valor mágico fuera de tokens y utilidades `ds-*`.
