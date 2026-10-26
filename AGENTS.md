# AGENTS.md — SIAF Notificaciones (siaf-notificaciones)

Conocimiento de proyecto para cualquier IA que trabaje aquí. Léase antes de tocar código.

## Qué es este proyecto

Portal del **Módulo de Notificaciones del SIAF** (Dirección de Auditoría Fiscal, SAF Morelos): sustituye al aplicativo de terceros con el que se asignan y siguen en campo las notificaciones de cartas invitación. Es un aplicativo Next.js **independiente** del SIAF modernizado (ADR-002), copiado del cascarón `gob-design-2026` sin el catálogo del DS ni el servidor MCP. No guarda datos propios: todo lo lee y escribe por la API de `siaf-backend` (Spring Boot, context path `/siaf`).

Dos portales bajo el mismo login del SIAF:

| Portal | Rol | Rutas (= `DBA_C_MODULOS.URL`) |
|---|---|---|
| Administrativo | `ROLE_ADMIN_NOTIFICACIONES` (y `ROLE_ADMIN_SIAF`) | `/notificaciones-campo` (bandeja y edición), `/paquetes` (armado, seguimiento, detalle, soportes) |
| Notificador | `ROLE_NOTIFICADOR` | `/mis-paquetes` (solo sus paquetes: resultado e imágenes) |

Negocio y alcance: PRD SIAF Notificaciones v1.1, SOW Notificaciones y Modelo de datos (bóveda Obsidian `Cerebro/01-Proyectos/SIAF - Modernizacion/`). Este documento define *cómo se programa* aquí: capas, estructura, reglas y convenciones. Para ver el catálogo de componentes del DS usa `/showcase` en `gob-design-2026`.

Es el equivalente en React de `cascaron-web` (Angular). Las **prácticas y conceptos** son los mismos; cambia la tecnología con que se expresan (ver "Equivalencias con cascaron-web" al final).

Los componentes de `src/core/components/ui/` son la **fuente de verdad de UI** para todo desarrollo futuro. No se reinventan ni se mezclan con estilos propios.

## Stack tecnológico

- Next.js 15 App Router + React 19, TypeScript `strict`. Gestor: **bun**.
- Tailwind CSS v4 + tokens semánticos del DS (`src/app/globals.css`).
- shadcn/ui + Radix como base de los componentes del DS — nunca se consume un primitivo Radix crudo fuera de `core/components/ui/` salvo "stopgap" explícito (ver más abajo).
- `lucide-react` para iconos (`import { House } from 'lucide-react'`).
- **Zod** para toda validación (formularios, Server Actions, env, query params) + `react-hook-form` cuando el formulario necesita validación en vivo en el cliente.
- Sesión propia contra el backend SIAF (patrón BFF, ver "Autenticación"): `jose` cifra la cookie de sesión.
- `sonner` para toasts.

Decisiones bloqueadas — no reintroducir sin acordarlo:
- **Sin Auth.js / NextAuth** — la identidad es del backend SIAF; Auth.js no puede escribir cookies al refrescar dentro de un Server Component y SIAF revoca la sesión si se reusa un refresh token (ver "Autenticación").
- **Sin `next-themes`** — ThemeProvider propio vía cookie + `data-theme` en `<html>`.
- **Sin TanStack Query / SWR** — lectura en Server Components, mutación con Server Actions. El fetch desde el cliente es la excepción (ver "Server vs Client").
- **Sin librería de gráficas** — SVG propio en `core/components/ui/*-chart.tsx`.

## Estructura y flujo entre capas

```
src/
  app/                    # SOLO enrutamiento: page.tsx, layout.tsx, loading.tsx, error.tsx, route.ts
    (app)/                # pantallas de negocio con sesión: layout con el menú de /auth/perfil
      layout.tsx          # requireSession() + getPerfil() → SidebarShell + AppSidebar
      inicio/             # aterrizaje por rol: admin → /notificaciones-campo, notificador → /mis-paquetes
      <feature>/page.tsx  # delgado: lee params, llama al service de la feature, compone componentes
    login/                # ruta pública; la lógica está en features/auth
    sesion-expirada/      # route handler: borra la cookie cuando el backend rechaza la sesión
  core/                   # infraestructura transversal, no sabe que existen las features
    auth/                 # sesión SIAF: session, siaf-auth.service, perfil.service, roles, routes
    components/ui/        # Design System — única fuente de UI
    components/           # shell compartido: sidebar-shell, app-sidebar, app-page-header, menu-icons
    config/               # env.ts (variables validadas, server-only), app.ts (nombre de la app)
    http/                 # apiClient, apiFetch, ApiError, ApiResponse<T>
    lib/                  # schemas transversales, action-state, utils/
    context/              # Context de React transversal (sidebar, etc.)
  features/               # una carpeta por feature de negocio
    <feature>/
      components/         # componentes propios de la feature (client o server)
      services/           # lectura/escritura contra la API vía apiClient (server-only)
      actions.ts          # Server Actions ('use server') de la feature
      schemas.ts          # esquemas Zod + tipos inferidos (z.infer)
      types.ts            # modelos de dominio que no salen de un esquema
  middleware.ts           # guardia de sesión y ÚNICO lugar que renueva el access token
```

**Regla de dependencia (no negociable):** `app → features → core`. `features` puede importar de `core`; `core` **nunca** importa de `features` ni de `app`. Una feature **no importa de otra feature** — si dos la necesitan, la pieza sube a `core`. Si sientes la tentación de romper esto, la pieza que quieres compartir pertenece a `core` o al DS, no a la feature.

**`app/` es solo enrutamiento.** Un `page.tsx` lee `params`/`searchParams`, llama al service de su feature y compone componentes. La lógica (fetch, mapeo, validación, reglas) vive en `features/<feature>/`.

Flujo de una pantalla nueva con datos:

```
app/(app)/<feature>/page.tsx        (Server Component; protegido por middleware.ts)
  → features/<feature>/services/*   (import 'server-only')
    → apiClient('<clientKey>')       (core/http — nunca fetch directo)
      → ApiResponse<T>  |  throw ApiException { error: ApiError }
  → la página decide cómo presentarlo: datos → componentes; error → AlertBanner / error.tsx
```

Flujo de una mutación:

```
Client Component (form) → useActionState(xAction)
  → features/<feature>/actions.ts  ('use server')
    1. verifica sesión/rol: requireSession() / requireRole() o getSession() + hasAnyRole() (ver features/notificaciones-campo/actions.ts)
    2. valida FormData con el esquema Zod de schemas.ts
    3. llama al service → apiClient
    4. revalidatePath / revalidateTag
    5. devuelve ActionState (core/lib/action-state.ts) — objeto plano, nunca lanza al cliente
  → el componente muestra toast / errores por campo
```

## Server vs Client

- **Server Component por defecto.** Agrega `'use client'` solo en el componente hoja que necesita estado, efectos, eventos o APIs del navegador — no en la página completa.
- Los datos se leen en el servidor y bajan como props. Un Client Component **nunca** llama a la API de negocio directo; si necesita datos en respuesta a una interacción, usa una Server Action o un route handler propio que pase por `apiClient`.
- **Estado de listados en la URL** (`searchParams`: búsqueda, filtros, tab, página) — compartible, sobrevive al refresh y lo lee el Server Component. `useState` para estado puramente visual/local; Context solo para lo transversal (`core/context/`).
- Carga: `loading.tsx` del segmento (o `<Suspense>`) con el skeleton del DS. Errores no controlados: `error.tsx` del segmento.
- **Imágenes de soporte:** el navegador nunca las pide a la API. Un route handler propio (`app/(app)/paquetes/soportes/[idSoporte]/route.ts`, `app/(app)/mis-paquetes/soportes/[idSoporte]/route.ts`) las trae por `apiClient` y las sirve en streaming (`core/http/binary-proxy.ts`).
- **Carga de archivos (fotografías del notificador):** no es una Server Action (límite de 1 MB); el cliente sube una por una a un route handler propio (`app/(app)/mis-paquetes/soportes/route.ts`, POST) que valida sesión, rol y entrada y reenvía el `FormData` con `apiClient(...).postForm`. Después, `router.refresh()`.
- **Celular:** el shell es responsivo (`SidebarShell`): desde `md` el sidebar es fijo y colapsable; abajo se abre como `Sheet` lateral con el botón de menú del encabezado. Páginas con `p-4 md:p-8`. El portal del notificador se diseña mobile-first (tarjetas en lugar de tablas, hoja inferior para capturar).

## Dónde va cada cosa nueva

- **Vista/pantalla de negocio** → ruta en `src/app/(app)/<feature>/page.tsx` + lógica en `src/features/<feature>/`. Si la feature no existe, créala con las carpetas que necesite (`components/`, `services/`, `actions.ts`, `schemas.ts`, `types.ts`). Usa `AppPageHeader` como encabezado.
- **Nuevo módulo del menú** → el menú lo decide el backend por completo: el login manda `sistema: APP_SISTEMA` (`core/config/app.ts`) y `/auth/perfil` devuelve solo los módulos de ese sistema (`DBA_E_SISTEMA_MODULO`) que permiten los roles del usuario, en el orden del sistema. El alta es en base de datos (Auditoría Fiscal): fila en `DBA_C_MODULOS`, liga a los roles en `DBA_E_ROLES_MODULOS` y liga al sistema `SIAF_NOTIFICACIONES` con su `ORDEN` en `DBA_E_SISTEMA_MODULO` (ver `siaf-backend/db/scripts-dba/datos/011`). En el front solo: la ruta de la página coincide con la `url` del módulo (`/paquetes` → `app/(app)/paquetes/page.tsx`) y su ícono se registra en `core/components/menu-icons.ts`. Nunca filtres, ocultes ni agregues opciones del menú en el front: el backend también niega (403) las rutas de módulos que no son de este sistema.
- **Layout de shell** (con/sin sidebar, con/sin sesión) → `layout.tsx` del route group (`(app)/layout.tsx`, etc.), con sus piezas en `core/components/`.
- **Componente reusable de una sola feature** → `features/<feature>/components/`.
- **Componente visual reusable entre features** → no se crea en `features/`; se propone como componente del DS (`core/components/ui/`) o, si no hay tiempo/alcance, se usa el primitivo más cercano marcado `// STOPGAP:` (ver Reglas del DS).
- **Lógica transversal** (auth, http, config, estado global) → `core/`, en la subcarpeta de su dominio (`core/http/`, `core/config/`, `core/lib/`, `core/context/`).
- **Función utilitaria reusada en 2+ lugares** → helper en `core/lib/utils/`. Nunca la dupliques inline en cada componente.
- **Esquema Zod usado por más de una feature** → `core/lib/schemas/`. Si es de una sola feature → `features/<feature>/schemas.ts`.
- **Nueva API de backend** → agrega su clave en `ApiClientKey` y su URL en `core/config/env.ts`, `core/http/api-client.config.ts` y `.env.example`. El backend SIAF ya es `'institutional'`.
- **Endpoints de SIAF-Backend** → siguen `/<modulo>/<verboCamelCase>` (`POST /notificaciones-campo/buscarNotificaciones`): `GET` para lecturas sin cuerpo y `POST` para consultas filtradas y escrituras. Las rutas del service van en una constante de la feature, nunca sueltas.

## Reglas del Design System

1. **Lee los skills antes de escribir CSS/Tailwind** — `gob-color`, `gob-tipografia`, `gob-foundations`, `gob-componentes`.
2. **Nunca hex directo ni valores mágicos** de color, spacing o tipografía — solo tokens semánticos (`bg-bg-surface-low`, `text-content-high`, `border-border-low`…) y utilidades tipográficas del DS (`ds-heading-sm`, `ds-title-md`, `ds-body-sm`, `ds-label-md`…). Si necesitas un valor que no existe como token, es un gap del DS: repórtalo, no lo inventes local.
3. **Nunca escribas un componente visual a mano si ya existe en el DS.** Impórtalo directo de `@/core/components/ui/<nombre>` (no hay barrel).
4. **Si el componente no existe en el DS**, en este orden: (a) si existe en `manuales/web/src/core/components/ui/` → copiarlo verbatim; (b) si es de shadcn → `bunx shadcn@latest add <nombre>` desde la raíz y ajustarlo a tokens; (c) si no hay alcance para (a)/(b), usa el primitivo Radix más cercano envuelto mínimamente y márcalo `// STOPGAP: falta <Componente> en el DS — <qué falta>`. Nunca escribas un componente shadcn desde cero a mano.
5. **No mezcles estilos propios con el DS.** Si el DS no tiene el patrón exacto, pregunta antes de improvisar.
6. **Temas** vía `data-theme` en `<html>` (light, dark, hc, mono) — el ThemeProvider propio lo maneja por cookie. Nunca estilos condicionados al tema a mano.
7. Los tokens fuente de verdad viven en `morelos-ds` (Figma → Supernova). Este repo puede tener drift; ante discrepancia, `morelos-ds` gana.

## Convenciones de nomenclatura

- **Archivos**: kebab-case siempre (`user-form-dialog.tsx`, `users.service.ts`). Archivos especiales de Next con su nombre fijo (`page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `route.ts`).
- **Componentes**: PascalCase, export nombrado (`export function UserFormDialog`). Componentes del DS sin prefijo (`Button`, `AlertBanner`) en `core/components/ui/`.
- **Páginas**: `export default function <Nombre>Page` (`UsersListPage`, `UsersDashboardPage`). **Layouts**: `<Nombre>Layout`.
- **Props**: `interface <Componente>Props`; callbacks con prefijo `on` (`onSuccess`, `onCancel`, `onValueChange`).
- **Hooks**: `use<Algo>` en `features/<f>/hooks/` o `core/lib/hooks/` si es transversal.
- **Server Actions**: sufijo `Action` (`createUserAction`), firma `(prevState: ActionState, formData: FormData) => Promise<ActionState>` cuando se usa con `useActionState`.
- **Esquemas Zod**: sufijo `Schema` (`createUserSchema`); tipo inferido sin sufijo extra (`type CreateUserInput = z.infer<typeof createUserSchema>`).
- **Services**: `<feature>.service.ts` con funciones verbo + entidad (`listUsers`, `getUserById`).
- **Constantes**: `UPPER_SNAKE_CASE` (`THEME_COOKIE`, `PAGE_SIZE`).
- **Imports**: alias `@/*` (`@/core/...`, `@/features/...`) — nunca rutas relativas que suban más de un nivel (`../../`).

## Reglas absolutas

- **Nunca hacer `git commit` ni `git push` sin que el usuario lo pida explícitamente.**
- **Nunca usar `any`.** Si el tipo es complejo o desconocido, usa `unknown` y angosta (o un esquema Zod), o modela el tipo en `types.ts`/`schemas.ts`. `strict: true` está activo — no lo debilites, y no uses `as` para silenciar al compilador.
- **Nunca hardcodear valores repetidos** (URLs, strings mágicos, roles, tamaños, colores) — van a `core/config/env.ts` (entorno), a un token del DS (visual), o a una constante nombrada en el módulo que corresponda.
- **Nunca dupliques lógica genérica** (formateo, validación, mapeo de errores) en cada componente — extráela a `core/lib/utils/` o a un esquema compartido.
- **Nunca `fetch` directo al backend de negocio** desde una feature ni desde el cliente — siempre `apiClient` (`core/http/api-client.ts`), que resuelve base URL, auth, timeout y normalización de errores a `ApiError`.
- **Nunca secretos en el cliente.** Todo lo que lleve `NEXT_PUBLIC_` o viva en un archivo `'use client'` es público. Los módulos que tocan secretos, DB o APIs llevan `import 'server-only'`. Placeholders marcados `TODO(backend)`.
- **Nunca tokens en `localStorage`/`sessionStorage`/cookies legibles por JS ni en props de Client Components.** Access y refresh token viven solo dentro de la cookie cifrada `siaf_session` (HttpOnly). A un Client Component solo baja `AuthUser` (id, usuario, nombre, roles).
- **Nunca renueves el access token fuera de `middleware.ts`** ni llames a `/auth/refresh` desde otro lado: SIAF rota el refresh en cada uso y revoca toda la sesión si detecta reuso.
- **Toda Server Action valida y autoriza.** Es un endpoint público: verifica sesión/rol (`requireSession`/`requireRole`, o `getSession` + `hasAnyRole` si debe devolver `ActionState` en vez de redirigir) y valida la entrada con Zod antes de hacer nada. Devuelve `ActionState`, nunca lanza al cliente ni devuelve instancias de clase. Los roles en el front son conveniencia de UI: el backend autoriza cada endpoint.
- **No mezclar estilos propios con el DS.** Si el DS no tiene el patrón, pregunta antes de improvisar.

## Autenticación (sesión SIAF, patrón BFF)

La identidad es del backend Java `siaf-backend` (`/siaf/auth/*`). Next actúa como **BFF** (*Backend for Frontend*): el navegador nunca habla con SIAF ni ve un token.

**Contrato del backend** (verificado en `siaf-backend`, `AuthController`):
- `POST /auth/login` `{ usuario (≤24), password (≤128) }` → `{ data: { accessToken, tipoToken, expiraEnSegundos, usuario: { idUsuario, usuario, nombre, roles } }, success, mensaje }` + `Set-Cookie` con el refresh token (`rt` en dev, `__Secure-rt` en QA/prod).
- `POST /auth/refresh` (cookie del refresh) → misma respuesta. **Rota el refresh en cada uso y revoca toda la sesión si detecta reuso.**
- `POST /auth/logout` (cookie del refresh) → revoca. Refresh y logout rechazan un header `Origin` ajeno a CORS; las llamadas servidor-a-servidor no mandan `Origin`.
- `GET /auth/perfil` (Bearer) → usuario + **menú filtrado por permisos** (`[{ nombre, descripcion, url }]`).
- Access token de 15 min; sesión de 8 h por inactividad y 12 h como máximo.

**Flujo:**
1. **Login** — `features/auth/actions.ts` (`loginAction`): valida con Zod, llama a `loginSiaf()` (`core/auth/siaf-auth.service.ts`), que toma el access token del body y el refresh token del `Set-Cookie`. Ambos se guardan en la cookie **`siaf_session`**: cifrada (JWE `A256GCM`, llave derivada de `SESSION_SECRET`), HttpOnly, SameSite=Lax y Secure en prod. Después redirige a `callbackUrl` (solo rutas internas, `safeCallbackUrl`).
2. **Cada request** — `middleware.ts` (runtime Node) descifra la sesión. Sin sesión, redirige a `/login?callbackUrl=…`. Si al access le queda menos de 60 s, llama a `refreshSiaf()` y escribe la cookie nueva en la respuesta **y** en el header `Cookie` del request en curso, para que la página ya la vea.
3. **Single-flight** — `refreshSiaf()` comparte una sola promesa por refresh token (N peticiones en paralelo hacen un solo `/auth/refresh`). Además recuerda "refresh viejo → sesión renovada": si una cookie renovada no llegó al navegador, la siguiente petición con la vieja recibe la sesión vigente en vez de reusar un refresh rotado. Es el equivalente de `refreshInFlight$` + `shareReplay(1)` en Angular. *Limitación:* vive en memoria del proceso; con varias réplicas hace falta afinidad de sesión o un store compartido (`TODO(infra)`).
4. **Llamadas a la API** — `apiClient` adjunta `Authorization: Bearer <access>` desde `getSession()` y reenvía la IP del usuario en `X-Forwarded-For`.
5. **Menú** — `app/(app)/layout.tsx` pide `getPerfil()` y pinta `AppSidebar`. Si el backend responde 401 (sesión revocada, usuario inhabilitado), redirige a `/sesion-expirada`, que borra la cookie y regresa a `/login`.
6. **Logout** — `logoutAction` (`core/auth/actions.ts`): `POST /auth/logout` (best-effort), borra la cookie y redirige a `/login`.

**Por qué no Auth.js:** Auth.js refresca dentro de los Server Components, donde Next no permite escribir cookies. La cookie con el refresh rotado se pierde, el siguiente request reusa el viejo y SIAF revoca la sesión. Con la sesión propia, el único lugar que refresca (el middleware) sí puede escribirla.

**Guardas:**
- `middleware.ts` protege todo excepto `/login`, `/sesion-expirada` y los estáticos. `/notificaciones-campo*` y `/paquetes*` exigen `ADMIN_NOTIFICACIONES_ROLES` (`ROLE_ROUTES`).
- En el backend la autorización es **por módulo**: el usuario debe tener asignado el módulo cuya `DBA_C_MODULOS.URL` es la ruta base del endpoint. El notificador además se valida contra el dueño del paquete en el servicio.
- En páginas: `requireSession()` / `requireRole(...)` (`core/auth/session.ts`). En Server Actions que devuelven `ActionState`: `getSession()` + `hasAnyRole()`.
- Los roles en el front (`core/auth/roles.ts`) son conveniencia de UI; el backend autoriza cada endpoint.

**Requisito en QA/prod (backend):** el rate limit de login es por IP (10/min). La IP del servidor Next debe estar en `PROXIES_CONFIABLES` del backend para que respete el `X-Forwarded-For`. Si no está, todos los usuarios comparten un solo límite.

## Fuentes

En `public/fonts/`. Si faltan, copiar de `../manuales/web/public/fonts/`.

## Comandos

Requiere `.env.local` (copiar de `.env.example`) con `SESSION_SECRET`, `API_INSTITUTIONAL_URL` y `SIAF_REFRESH_COOKIE`, y el backend SIAF corriendo (local: `./mvnw spring-boot:run -Dspring-boot.run.profiles=dev` en `siaf-backend`).

```bash
bun run dev        # dev con turbopack
bun run build      # build de producción
bun run lint       # eslint
bun run type-check # validación de tipos sin build
```

Antes de dar una tarea por terminada: `bun run type-check` y `bun run lint` sin errores.

## Skills de UI/UX disponibles

Para patrones de vista recurrentes hay skills en `.agents/skills/` (convención [Agent Configuration Standard](https://agentsstandard.com/), `.agents/skills/<nombre>/SKILL.md` — no específica de una sola herramienta de IA). Antes de armar una vista de un tipo cubierto por una skill, ábrela y síguela en vez de improvisar la estructura:

- `dashboard-view` — estructura obligatoria de pantallas de dashboard/resumen (KPIs + gráficas), qué componentes del DS usar para cada bloque y cómo documentar gaps del DS en vez de inventarlos.
- `domain-list-view` — estructura obligatoria de pantallas de listado de un dominio (Usuarios, Proveedores, Catálogos...): tabs de estado opcionales, filtros en la URL + botones de acción (orden y variantes), tabla, paginador y el modal de alta/edición asociado.
- `crud-form-modal` — estructura del modal de alta/edición (`Dialog` + `Field` + Server Action), alineación de Cancelar/Guardar y el patrón de un solo componente para crear y editar.

Si se agrega una skill nueva para otro tipo de vista, regístrala aquí con una línea igual de corta.

## Equivalencias con cascaron-web (Angular)

Mismas prácticas, distinta tecnología. Útil si vienes del cascarón Angular:

| cascaron-web (Angular) | Aquí (Next/React) |
|---|---|
| `features/<f>/` + `<f>.routes.ts` | `features/<f>/` + rutas delgadas en `app/(app)/<f>/` |
| `layouts/` (`MainLayout`, `AuthLayout`) | `layout.tsx` por route group (`(app)/layout.tsx` = MainLayout con el menú) |
| `ApiService` (nunca `HttpClient`) | `apiClient` (nunca `fetch` directo) |
| `errorInterceptor` → `ApiError` | `apiClient` → `ApiException { error: ApiError }` |
| `environment.*.ts` | `core/config/env.ts` (Zod) + `.env.local` |
| Signals | Server Components + `useState` + estado en la URL |
| Reactive Forms + `Validators` | Zod + Server Actions (`useActionState`) / react-hook-form |
| `authGuard` / `roleGuard` | `middleware.ts` + `requireSession()` / `requireRole()` |
| `AuthService` (access token en un signal) | `core/auth/`: access + refresh dentro de la cookie cifrada `siaf_session` |
| `authInterceptor` (401 → refresh → reintento) | `middleware.ts` renueva antes de que venza; `apiClient` adjunta el Bearer |
| `refreshInFlight$` + `shareReplay(1)` | single-flight en `refreshSiaf()` |
| `bootstrapSession()` al arrancar | no hace falta: la cookie persiste |
| `NAV_ITEMS` fijo filtrado por roles | menú de `GET /auth/perfil` (lo decide el backend) |
| `ds-table-skeleton` mientras carga | `loading.tsx` con `TableSkeleton` |
| `DialogService.confirm()` | `ConfirmDialog` |
| `// STOPGAP:` con Angular Material | `// STOPGAP:` con primitivo Radix |

## Referencias

- Proyecto de componentes origen: `../manuales/web/`.
- Figma DS: https://www.figma.com/design/ITsxyLjIHfHsxYItqH42U6/Morelos-Design-System
- Catálogo de componentes del DS (`/showcase`): `../gob-design-2026/`.
- Negocio: PRD y SOW de SIAF Notificaciones, ADR-002/003/004 y Modelo de datos (Obsidian `Cerebro/01-Proyectos/SIAF - Modernizacion/`).
