# Liga Barrial La Armenia — Frontend

SPA en React + Vite + TypeScript para administrar la Liga Barrial La Armenia y consultar información pública.

---

## Stack

- **Vite 8** (bundler)
- **React 18** + **TypeScript 5**
- **Tailwind CSS v4** (`@theme` en `index.css`)
- **shadcn/ui** (basado en Radix)
- **React Router v6**
- **Axios** (interceptores JWT)
- **Zustand** (estado global)
- **React Hook Form** + **Zod** (formularios)
- **lucide-react** (iconos)

---

## Requisitos

- **Node.js ≥ 20.19** o **≥ 22.12**
- **npm ≥ 10**
- Backend corriendo en `http://127.0.0.1:8000/api`

Si tienes Node 18, actualízalo con `nvm`:

```bash
nvm install 22
nvm use 22
nvm alias default 22
```

---

## Setup

### 1. Clonar e instalar

```bash
git clone <repo-url> liga-armenia-front
cd liga-armenia-front
npm install
```

### 2. Configurar el entorno

Crea un archivo `.env` en la raíz:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

O copia el ejemplo:

```bash
cp .env.example .env
```

### 3. Arrancar

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Vista pública: http://localhost:5173/
- Admin: http://localhost:5173/admin

### 4. Verificar tipos

```bash
npx tsc --noEmit
```

### 5. Build de producción

```bash
npm run build
npm run preview
```

---

## Arquitectura hexagonal (Ports & Adapters)

```
src/
├── domain/           → TypeScript puro (entidades, ports, excepciones)
├── application/      → Casos de uso, DTOs
├── infrastructure/   → Adapters Axios, factories, config, storage
└── presentation/     → Stores Zustand, páginas, componentes, router
```

**Regla de dependencias:**

```
presentation → application → domain
infrastructure → domain
domain → nada (TS puro)
application ↛ infrastructure (se inyecta vía factory)
presentation ↛ infrastructure (usa factories)
```

---

## Estructura del proyecto

```
liga-armenia-front/
├── public/
├── src/
│   ├── domain/
│   │   ├── entities/          # Tipos de negocio
│   │   ├── enums/
│   │   ├── exceptions/
│   │   │   ├── domain.exception.ts
│   │   │   └── api.exception.ts
│   │   └── ports/             # Contratos de repositorios
│   ├── application/
│   │   ├── dtos/              # Payloads de entrada
│   │   └── use-cases/         # Orquestación
│   ├── infrastructure/
│   │   ├── config/
│   │   │   └── api.config.ts
│   │   ├── http/
│   │   │   ├── axios-client.ts
│   │   │   └── parse-api-error.ts
│   │   ├── storage/
│   │   │   └── local-token-storage.ts
│   │   ├── adapters/          # Implementación Axios de ports
│   │   └── factories/         # Wiring use-case + adapter
│   └── presentation/
│       ├── theme/
│       ├── utils/
│       │   ├── cn.ts
│       │   └── formatters.ts
│       ├── store/             # Zustand
│       ├── components/
│       │   ├── ui/            # shadcn
│       │   ├── shared/        # DataTable, Pagination, ConfirmDialog
│       │   ├── AppShell.tsx
│       │   └── PublicLayout.tsx
│       ├── pages/
│       │   ├── auth/
│       │   ├── public/
│       │   ├── admin/
│       │   └── PlaceholderPage.tsx
│       └── router/
│           ├── AppRouter.tsx
│           └── ProtectedRoute.tsx
├── .env
├── .env.example
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── components.json
```

---

## Rutas

### Público (sin login)

| Ruta | Página |
|---|---|
| `/` | Inicio |
| `/tabla` | Tabla de posiciones |
| `/goleadores` | Goleadores |
| `/tarjetas` | Tarjetas |
| `/calendario` | Calendario |
| `/noticias` | Noticias |
| `/noticias/:id` | Detalle de noticia |

### Auth

| Ruta | Página |
|---|---|
| `/login` | Login |

### Admin (con `AppShell` + `ProtectedRoute`)

| Ruta | Módulo | Comisión |
|---|---|---|
| `/admin` | Dashboard | — |
| `/admin/perfil` | Mi perfil | — |
| `/admin/temporadas` | Temporadas | Técnica |
| `/admin/categorias` | Categorías | Técnica |
| `/admin/inscripciones` | Inscripciones | Técnica |
| `/admin/jornadas` | Jornadas | Técnica |
| `/admin/jornadas/:id` | Detalle jornada | Técnica |
| `/admin/partidos` | Partidos | Técnica |
| `/admin/vocalias` | Vocalías | Técnica |
| `/admin/vocalias/:id` | Detalle vocalía | Técnica |
| `/admin/equipos` | Equipos | — (lectura todos) |
| `/admin/jugadores` | Jugadores | Calificaciones |
| `/admin/plantillas` | Plantillas | Calificaciones |
| `/admin/capitanes` | Capitanes | Calificaciones |
| `/admin/sanciones` | Sanciones | Penas |
| `/admin/multas` | Multas | Penas |
| `/admin/recibos` | Recibos | Penas |
| `/admin/finanzas` | Movimientos financieros | Financiera |
| `/admin/informes-semanales` | Informes semanales | Financiera |
| `/admin/lesiones` | Lesiones | Seguro |
| `/admin/sesiones` | Sesiones | Administrativa |
| `/admin/sesiones/:id` | Detalle sesión | Administrativa |
| `/admin/documentos` | Documentos | Administrativa |
| `/admin/noticias` | Noticias admin | Administrativa |
| `/admin/usuarios` | Usuarios | Superadmin |

---

## Patrón de un módulo CRUD

Cada entidad sigue **8 archivos**:

```
domain/entities/<nombre>.entity.ts
domain/ports/<nombre>.repository.ts
application/dtos/<nombre>.dto.ts
application/use-cases/<nombre>.use-case.ts
infrastructure/adapters/axios-<nombre>.repository.ts
infrastructure/factories/<nombre>.factory.ts
presentation/store/<nombre>.store.ts
presentation/pages/admin/<Nombre>Page.tsx
```

**Flujo de datos:**

```
Page → Store → UseCase → Port ← Adapter (Axios) → API
                        ↑
                     Factory (wiring)
```

---

## Autenticación (JWT)

### Login

1. `POST /auth/login/`
2. Guarda tokens en `localStorage`:
   - `liga_access`
   - `liga_refresh`
3. Guarda `user` (con `groups`, `is_superuser`) en Zustand con persistencia

### Interceptor de peticiones

Añade `Authorization: Bearer <access>` a cada request.

### Interceptor de respuestas

- **En 401:** refresca automáticamente con `POST /auth/token/refresh/`
- Si varias peticiones fallan simultáneamente, se encolan y **solo se dispara un refresh**
- Si el refresh falla: dispara evento `authExpired` en `window` y limpia la sesión

### Logout

1. `POST /auth/logout/`
2. Blacklistea el refresh token en el backend
3. Limpia `localStorage`
4. Redirige a `/` (portada pública)

---

## Guards de ruta

### `ProtectedRoute`

```tsx
<ProtectedRoute requireGroup="Comision Tecnica">
  <TemporadasPage />
</ProtectedRoute>
```

Comportamiento:
- Sin sesión → redirige a `/login` con `from` guardado en `location.state`
- Con sesión pero sin el grupo requerido → redirige a `/admin`
- Superuser siempre pasa (ignora `requireGroup`)
- Mientras se carga la sesión (`isLoading`) → spinner (evita flash)

---

## Formularios

Todos los formularios usan **React Hook Form** + **Zod**:

```tsx
const schema = z.object({
  nombre: z.string().min(2, 'Mínimo 2 caracteres'),
  anio: z.coerce.number().int().min(2000),
})

const form = useForm({ resolver: zodResolver(schema) })
```

Los **errores de validación del backend** (400) llegan al `ApiException` y se muestran en el campo correspondiente.

---

## Componentes compartidos

- **`DataTable<T>`** — tabla tipada con columnas configurables y skeleton
- **`Pagination`** — paginación con "X-Y de Z" y botones Anterior/Siguiente
- **`ConfirmDialog`** — diálogo de confirmación para acciones destructivas

---

## Estilos

- **Paleta verde** (`--color-primary`) configurada en `src/index.css` con `@theme` (Tailwind v4)
- **Dark mode** preparado (variables CSS en `.dark`)
- **Tailwind v4** — sin `tailwind.config.js`, todo en CSS
- Componentes shadcn en `src/presentation/components/ui/`
- Iconos desde `lucide-react`

### Formateo

Helpers en `src/presentation/utils/formatters.ts`:

- `formatMoney(n)` → `$1,234.50` (es-EC)
- `formatDate(iso)` → `15 mar 2025`
- `formatTime(hora)` → `HH:mm`
- `formatDateTime(iso)` → `15 mar 2025, 10:30`

---

## Scripts

| Comando | Qué hace |
|---|---|
| `npm run dev` | Dev server en `:5173` |
| `npm run build` | Build de producción en `dist/` |
| `npm run preview` | Preview del build |
| `npx tsc --noEmit` | Verificar tipos sin compilar |

---

## Añadir componentes shadcn

```bash
npx shadcn@latest add <nombre>
```

Se generan en `src/presentation/components/ui/` (configurado en `components.json`).

---

## Variables de entorno

| Variable | Descripción |
|---|---|
| `VITE_API_BASE_URL` | URL base de la API (ej. `http://127.0.0.1:8000/api`) |

---

## Despliegue

### Build

```bash
npm install
npm run build
```

Los archivos estáticos quedan en `dist/`. Súbelos a tu hosting.

### Variables en producción

```env
VITE_API_BASE_URL=https://api.tudominio.com/api
```

### Hosting sugerido

| Opción | Ventajas |
|---|---|
| **Vercel** | Deploy automático, HTTPS, CDN |
| **Netlify** | Similar, con funciones serverless |
| **Cloudflare Pages** | Muy rápido, sin cold start |

**Importante:** asegúrate de que el `CORS_ALLOWED_ORIGINS` del backend incluya el dominio del frontend.

---

## Convenciones

- **Archivos:** `kebab-case` (`auth.store.ts`, `axios-equipo.repository.ts`)
- **Componentes:** `PascalCase` (`EquiposPage.tsx`, `DataTable.tsx`)
- **Funciones:** `camelCase` (`formatMoney`, `parseApiError`)
- **Tipos:** `PascalCase` (`Equipo`, `AuthTokens`)
- **Imports con alias** `@/`:

```ts
import { Equipo } from '@/domain/entities/equipo.entity'
import { equipoUseCase } from '@/infrastructure/factories/equipo.factory'
import { DataTable } from '@/presentation/components/shared/DataTable'
```

---

## Roadmap de módulos

| # | Módulo | Estado |
|---|---|---|
| 1 | Setup (Vite + TS + Tailwind + shadcn + Hexagonal) | ✅ |
| 2 | Axios + JWT + LocalStorage | ✅ |
| 3 | Auth + Login + ProtectedRoute + AppShell | ✅ |
| 4 | Dashboard con widgets | ✅ |
| 5 | Temporadas + Categorías | ✅ |
| 6 | Equipos + Inscripciones | ✅ |
| 7 | Jugadores + Plantillas + Capitanes | ✅ |
| 8 | Jornadas + Partidos + Sorteo | ✅ |
| 9 | Vocalías + VocaliaJugador | ✅ |
| 10 | Sanciones + Multas + Recibos | ✅ |
| 11 | Finanzas | ✅ |
| 12 | Lesiones + Sesiones + Documentos + Noticias | ✅ |
| 13 | Vista pública | ✅ |
| 14 | Usuarios + Perfil + Cierre | ✅ |

---

## Próximos pasos (opcionales)

- Tests con Vitest + Testing Library
- PWA
- Notificaciones en tiempo real (WebSockets / SSE)
- Exportación a PDF
- Búsqueda global en el header
- Subida real de archivos (S3 / Cloudflare R2)

---

## Referencias

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [React Router](https://reactrouter.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Hook Form](https://react-hook-form.com/)
- [Zod](https://zod.dev/)

---

## Licencia

Proyecto privado de la Liga Barrial La Armenia.