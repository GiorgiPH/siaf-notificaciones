# SIAF Notificaciones — Portal (Next.js) + Morelos Design System

Portal del Módulo de Notificaciones del SIAF (Dirección de Auditoría Fiscal, SAF Morelos). Toma del SIAF las órdenes de cartas invitación listas para notificar. Permite agruparlas en paquetes asignados a un notificador y dar seguimiento al resultado en campo. Sustituye al aplicativo de terceros (Painani) y elimina la recaptura de órdenes.

Es un aplicativo independiente del SIAF modernizado (ADR-002), copiado del cascarón `gob-design-2026` sin el catálogo del DS ni el servidor MCP. Todo lo lee y escribe por la API de `siaf-backend`. Reglas de arquitectura y código: `AGENTS.md`.

## Portales

| Portal | Rol | Rutas |
|---|---|---|
| Administrativo | `ROLE_ADMIN_NOTIFICACIONES` | `/notificaciones-campo` — bandeja de órdenes listas para notificar y edición de datos de campo<br>`/paquetes` — registro, edición, inicio, detalle y soportes de paquetes |
| Notificador (etapa 2) | `ROLE_NOTIFICADOR` | `/mis-paquetes` — solo sus paquetes: resultado e imágenes |

El menú lo define el backend (`DBA_C_MODULOS` vía `/auth/perfil`): cada ruta coincide con la URL del módulo. `/inicio` redirige según el rol.

## Ejecutar

1. Levanta el backend SIAF (en `siaf-backend`):
   ```bash
   ./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
   ```
2. Configura y arranca el front:
   ```bash
   bun install
   cp .env.example .env.local   # y completa SESSION_SECRET
   bun run dev
   ```

Variables de `.env.local`:

- `SESSION_SECRET`: cifra la cookie de sesión. Genera una con `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.
- `API_INSTITUTIONAL_URL`: base del backend con su context path (local: `http://localhost:8080/siaf`).
- `SIAF_REFRESH_COOKIE`: nombre de la cookie del refresh token del backend (`rt` en dev, `__Secure-rt` en QA/prod).

Abre http://localhost:3000: redirige a `/login` y, ya con sesión, al portal que corresponde a tu rol.

## Autenticación

Next actúa como BFF: el navegador nunca habla con SIAF ni ve un token. El servidor de Next hace login, refresh y logout contra `/siaf/auth/*` y guarda el access token y el refresh token en una cookie cifrada HttpOnly (`siaf_session`). `middleware.ts` renueva el access token antes de que venza, con un solo refresh en curso porque SIAF revoca la sesión si se reusa un refresh token. Detalle completo en `AGENTS.md`, sección "Autenticación".

En QA/prod:
- La IP del servidor Next debe estar en `PROXIES_CONFIABLES` del backend, para que su rate limit de login sea por usuario y no global.
- El origen del portal debe estar en `CORS_ORIGENES`.

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 15 App Router |
| Estilos | Tailwind CSS v4 + tokens del Morelos DS |
| Componentes | Morelos DS (`core/components/ui/`, sobre shadcn/ui + Radix) |
| Iconos | lucide-react |
| Temas | theme-provider propio vía cookie (NO next-themes): light, dark, hc, mono |
| Formularios | Zod + Server Actions / react-hook-form |
| Auth | Sesión propia contra SIAF (BFF): cookie cifrada con `jose`, refresh en `middleware.ts` |
| Base de datos | Ninguna (es del backend) |
| Lenguaje | TypeScript strict |

## Design System

Para ver los componentes y sus variantes, usa el catálogo `/showcase` de `gob-design-2026`. Aquí se usan **siempre** tokens semánticos, nunca hex directos (`bg-bg-surface-low text-content-high border-border-md`). Ver `src/app/globals.css`. Las fuentes `KarolSans` y `TwogetherSans` están incluidas en `public/fonts/`.

## Comandos

```bash
bun run dev         # dev con turbopack
bun run build       # build de producción
bun run lint        # eslint
bun run type-check  # validación de tipos sin build
```

## Referencia

- Negocio: PRD y SOW de SIAF Notificaciones, ADR-002/003/004 y Modelo de datos (Obsidian `Cerebro/01-Proyectos/SIAF - Modernizacion/`).
- Backend: `siaf-backend`, módulo `notificacionescampo`.
- Figma DS: https://www.figma.com/design/ITsxyLjIHfHsxYItqH42U6/Morelos-Design-System
