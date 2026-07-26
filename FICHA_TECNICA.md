# flux — Ficha Técnica

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS v4 |
| Base de datos | SQLite vía Prisma 7 ORM |
| PDF | `@react-pdf/renderer` |
| Email | nodemailer (SMTP configurable) |

## Estructura del proyecto

```
src/
├── app/                    # App Router pages + API
│   ├── page.tsx            # Dashboard principal (presupuestos)
│   ├── layout.tsx          # Root layout (nav + toast global)
│   ├── globals.css         # Design tokens, animaciones, utilities
│   ├── agenda/             # Calendario (vista mes/semana)
│   ├── clientes/           # CRUD + detalle con historial
│   ├── productos/          # CRUD + detalle + grid vista + export CSV
│   ├── presupuestos/       # CRUD + detalle + PDF + email
│   ├── org/                # Modo organización personal
│   ├── api/                # API routes
│   │   ├── seed/           # Seed data de ejemplo
│   │   ├── breakdown/      # AI breakdown (OpenRouter)
│   │   └── send-presupuesto/ # Envío de email
│   ├── components/         # Shared components
│   ├── lib/                # Utilities, server actions, format
│   └── generated/          # Prisma client generado
```

## Modelos de datos (Prisma)

- **Cliente** — nombre, email, teléfono, dirección
- **Producto** — nombre, descripción, precio, tipo, categoría
- **Presupuesto** — número, cliente, fecha, validez, notas, impuesto, estado
- **ItemPresupuesto** — línea de presupuesto: producto, descripción, cantidad, precio, total
- **CalendarEvent** — título, descripción, fecha, hora, duración, tipo, cliente
- **Project** — nombre, color, archivado
- **Task** — título, energía, minutos estimados, estado, proyecto, subtareas
- **DailyState** — energía diaria, prioridad del día

## Design System

### Tokens (globals.css)
- `--color-canvas` (#f5f0e8), `--color-surface` (#fcf9f4)
- `--color-accent` (#117a6b) verdigris, `--color-accent-soft` (#d1f0e9)
- `--color-destructive` (#b91c1c), `--color-success` (#5c6a46)
- `--shadow-card/elevated/dialog` sombras con tinta tintada
- `--radius-xs/sm/md/lg` bordes consistentes

### Animaciones
- `animate-fade-in-up` — entrada de páginas
- `animate-fade-in` — aparición de overlays
- `animate-scale-in` — modales
- `animate-spin` — loading spinner
- `.card-hover` — elevación al hover

## Patrones clave

### Layout
- Root: `max-w-6xl mx-auto`, padding responsive `px-3 sm:px-5`
- Org: breakout `-mx-5 -mb-7` con fondo `bg-stone-900`

### Componentes globales
- `Toast` — notificaciones tipo "sonner" (3 tipos, auto-dismiss 2.5s)
- `Confirm` — modal de confirmación reutilizable (`useConfirm()` hook)
- `Loading` / `PageSkeleton` — estados de carga

### Filtros reactivos
- Búsqueda con debounce (300ms)
- Selects con actualización inmediata
- Estado sincronizado con URL searchParams

### Modo dual
- `/` — Presupuestos (tema cálido artesanal)
- `/org` — Organización personal (tema oscuro)

## Rutas (27 total)

| Ruta | Tipo | Descripción |
|---|---|---|
| `/` | ƒ | Dashboard presupuestos |
| `/clientes` | ƒ | Listado + búsqueda + orden |
| `/clientes/[id]` | ƒ | Detalle + historial |
| `/clientes/nuevo` | ○ | Crear cliente |
| `/clientes/[id]/editar` | ƒ | Editar cliente |
| `/productos` | ƒ | Listado + grid/tabla + filtro |
| `/productos/[id]` | ƒ | Detalle + estadísticas de uso |
| `/productos/nuevo` | ○ | Crear producto |
| `/productos/[id]/editar` | ƒ | Editar producto |
| `/presupuestos/[id]` | ƒ | Detalle + PDF + email |
| `/presupuestos/nuevo` | ○ | Crear presupuesto |
| `/presupuestos/[id]/editar` | ƒ | Editar presupuesto |
| `/presupuestos/[id]/pdf` | ƒ | Descargar PDF |
| `/agenda` | ƒ | Calendario mes/semana |
| `/agenda/nuevo` | ƒ | Crear evento |
| `/agenda/[id]/editar` | ƒ | Editar evento |
| `/org` | ƒ | Dashboard organización |
| `/org/todas` | ƒ | Todas las tareas |
| `/org/proyectos` | ○ | Lista de proyectos |
| `/org/proyectos/nuevo` | ○ | Crear proyecto |
| `/org/proyectos/[id]` | ƒ | Detalle proyecto |
| `/org/proyectos/[id]/editar` | ƒ | Editar proyecto |
| `/org/enfoque/[id]` | ƒ | Focus mode con timer |
| `/org/tareas/[id]/editar` | ƒ | Editar tarea |
| `/api/seed` | ƒ | Seed data |
| `/api/breakdown` | ƒ | AI task breakdown |
| `/api/send-presupuesto` | ƒ | Envío de email |

## Funcionalidades destacadas

- **Pipeline visual**: Indicador de progreso tipo regla con puntos conectados
- **Timer Pomodoro**: SVG circular, 4 presets, sesiones en localStorage
- **Drag & drop en agenda**: Mover eventos entre días arrastrando
- **Acciones en lote**: Selección múltiple + cambio de estado/eliminar
- **Exportar CSV**: Presupuestos y productos
- **Modo organización**: Sidebar con proyectos, energy badge, MadeToday
- **AI Breakdown**: Descomposición de tareas vía OpenRouter
