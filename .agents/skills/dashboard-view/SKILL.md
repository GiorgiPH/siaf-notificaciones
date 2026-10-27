---
name: dashboard-view
description: Genera o revisa una pantalla de dashboard/resumen (KPIs + gráficas) en siaf-notificaciones (Next.js) siguiendo la estructura visual estándar del proyecto y usando exclusivamente componentes ya existentes del Design System. Úsalo cuando el usuario pida crear un "dashboard", "resumen", "panel principal", "home" de un módulo, o cualquier vista con tarjetas de métricas + gráficas.
---

# Dashboard view — Cascarón Next

## Regla de oro

Un dashboard se arma **componiendo** piezas que ya existen en
`src/core/components/ui/`. Nunca se crea un componente nuevo del DS para esto
y nunca se escribe JSX/Tailwind que imite un componente que ya existe. Si algo
que necesitas no existe ni se puede componer con lo que hay, para y repórtalo
(ver "Gaps conocidos") en vez de inventarlo.

Consulta primero `AGENTS.md` (raíz del repo) para las reglas generales
(capas, Server vs Client, nomenclatura, `any`, hardcoding) — esta skill solo
cubre la estructura visual del dashboard.

## Estructura obligatoria (de arriba hacia abajo)

1. **Header de página**: título + subtítulo + acciones rápidas a la derecha.
2. **Fila de KPIs**: 2 (o más) tarjetas de métrica en una fila.
3. **Fila de gráficas**: `DonutChart` a la izquierda + `BarChart` (u otra
   gráfica del DS) a la derecha.

No agregues bloques adicionales (tablas, listas, etc.) salvo que el usuario
los pida — siguen el mismo criterio de composición pero no son parte de la
estructura mínima.

## Server vs Client

La página (`page.tsx`) es **Server Component**: obtiene los datos con el
service de la feature (`features/<f>/services/`, que usa `apiClient`) y los
pasa por props. Las gráficas y `AppPageHeader` ya son `'use client'`
internamente — no conviertas la página entera en client por usarlas.

```tsx
// src/app/(app)/<feature>/page.tsx
import { requireSession } from '@/core/auth/session';
import { AppPageHeader } from '@/core/components/app-page-header';
import { getDashboardSummary } from '@/features/<feature>/services/<feature>.service';

export default async function ProveedoresDashboardPage() {
  const [{ user }, summary] = await Promise.all([requireSession(), getDashboardSummary()]);
  return (
    <div className="flex min-h-full flex-col">
      <AppPageHeader title="Resumen del portal" subtitle={`Hola, ${user.displayName}`} />
      <div className="flex flex-col gap-8 p-8">{/* KPIs + gráficas con summary */}</div>
    </div>
  );
}
```

### 1. Header de página

Usa `AppPageHeader` (`@/core/components/app-page-header`): ya resuelve el botón
para colapsar el menú, el título (`ds-heading-sm`), el subtítulo y
`ThemeSwitcher`. No uses `ShowcaseHeader` (es del catálogo) ni armes un header a mano.

- Subtítulo del dashboard: el saludo (`Hola, {user.displayName}`), con el usuario de `requireSession()`.
- Acciones propias de la página → prop `actions` (p. ej. `Button variant="outline"`
  para exportar). La navegación a inicio ya está en el menú lateral; no la dupliques.

```tsx
<AppPageHeader
  title="Resumen del portal"
  subtitle={`Hola, ${user.displayName}`}
  actions={<Button variant="outline" asChild><Link href="/reportes">Ver reportes</Link></Button>}
/>
```

### 2. Fila de KPIs

Cada métrica es un `Card` con: etiqueta, número grande y un ícono dentro de
`Avatar` + `AvatarFallback` (reutilizado como círculo de ícono, no como avatar
de usuario — ya es redondo). No existe un `StatCard`: esta es la composición
estándar del proyecto para métricas, siempre igual. Si se repite en la misma
feature, extráela a `features/<f>/components/kpi-card.tsx`; si se usa en 3+
features, propónla como componente del DS.

```tsx
import { CircleCheck } from 'lucide-react';
import { Card } from '@/core/components/ui/card';
import { Avatar, AvatarFallback } from '@/core/components/ui/avatar';

<div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-6">
  <Card className="flex flex-col gap-2 p-6">
    <p className="ds-body-sm text-content-low">Pendientes de validación DGCOBS</p>
    <div className="flex items-center justify-between">
      <span className="ds-heading-sm text-accent-primary">{summary.pendientesDgcobs}</span>
      <Avatar size="lg" className="border border-accent-primary-low">
        <AvatarFallback className="bg-bg-surface-low text-accent-primary">
          <CircleCheck className="size-5" />
        </AvatarFallback>
      </Avatar>
    </div>
  </Card>
  {/* un Card por KPI */}
</div>
```

### 3. Fila de gráficas

`DonutChart`, `BarChart` y `HorizontalBarChart` **ya son tarjetas
completas** (traen su propio fondo, borde, radio, padding y sombra) — **nunca
las envuelvas en `Card`**, se duplicaría el borde/padding.

```tsx
import { DonutChart, type DonutDatum } from '@/core/components/ui/donut-chart';
import { BarChart } from '@/core/components/ui/bar-chart';

<div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(280px,1fr)_2fr]">
  <DonutChart data={summary.proveedoresActivos} title="Proveedores activos" totalLabel="Total" />
  <BarChart data={summary.crecimiento.valores} labels={summary.crecimiento.meses} title="Crecimiento anual" />
</div>
```

- `DonutChart` ya renderiza el total al centro y la leyenda — no la repliques.
  `data: DonutDatum[]` (`{ label, value }[]`).
- `BarChart` recibe `data: number[]` + `labels: string[]` (mismo índice) — ya
  dibuja ejes, grid y barras.
- `HorizontalBarChart` (`data: HorizontalBarDatum[]` = `{ key, label, sublabel?, value }[]`)
  para rankings ("Top dependencias").
- Los props de color (`palette`, `baseColor`, `hoverColor`) ya tienen default
  del DS — no los sobreescribas con hex.

## Gap conocido: filtro (año/periodo) sobre una gráfica

Ninguna gráfica expone un slot de acciones en su encabezado (`title` y
`description` son solo texto). Si necesitas un `Select` de año como en
"Crecimiento anual", **no** modifiques el componente del DS para este caso.
Resuélvelo por composición, con el año en la URL (`?anio=2026`) para que la
página server vuelva a pedir los datos:

```tsx
<div className="relative">
  <BarChart data={valores} labels={meses} title="Crecimiento anual" />
  <div className="absolute top-4 right-4">
    <YearFilter value={anio} options={anios} /> {/* client: Select + router.replace(?anio=) */}
  </div>
</div>
```

Si este patrón se repite en más de 2-3 dashboards, propón al usuario un prop
`actions?: React.ReactNode` en las gráficas como mejora real del DS, en vez
de seguir parchando por página.

## Dónde va el archivo

- Ruta: `src/app/(app)/<feature>/page.tsx` (o `.../<feature>/resumen/page.tsx`
  si la feature tiene más pantallas). Función `<Feature>DashboardPage`.
- Componentes propios (KPI card, filtro de año): `src/features/<feature>/components/`.
- Datos: `src/features/<feature>/services/<feature>.service.ts` vía `apiClient`.
- Carga: `loading.tsx` del segmento con `Skeleton` del DS.

Ver `AGENTS.md` § "Dónde va cada cosa nueva".

## Checklist antes de dar por terminado un dashboard

- [ ] La página es Server Component; solo las hojas interactivas son `'use client'`.
- [ ] Datos vía service de la feature + `apiClient`, nunca `fetch` directo.
- [ ] Ningún hex ni valor mágico — solo tokens (`bg-*`, `text-content-*`, `border-*`) y utilidades `ds-*`.
- [ ] KPIs = `Card` + `Avatar`/`AvatarFallback` (ícono), no un componente inventado.
- [ ] Gráficas NO envueltas en `Card` (ya son su propia tarjeta).
- [ ] Iconos de `lucide-react`, no SVGs sueltos.
- [ ] Si faltó un slot/prop en un componente del DS, se documentó como gap en vez de parchear.
