# System: flux — Presupuestos & Organización

## Direction
Dual-mode app: **Taller** (presupuestos, cálido, material) y **Estudio** (org, oscuro, minimalista). La navegación entre modos es un switch físico tipo panel de taller.

## Feel
Taller artesanal — pergamino, madera, verdigris, tinta sobre papel. El modo Estudio contrasta como una sala de planos silenciosa.

## Depth Strategy
Borders-only con surface color shifts. Sin sombras dramáticas. `shadow-card`, `shadow-elevated`, `shadow-dialog` para elevación sutil. `shadow-groove` (inset) para elementos empotrados tipo gauge.

## Spacing Base Unit
`4px` (multiplicadores Tailwind estándar: `p-4` = 16px, `gap-2` = 8px, etc.)

## Border Radius
- `--radius-xs`: 4px (gauges, badges)
- `--radius-sm`: 6px (inputs, botones, tabs)
- `--radius-md`: 10px (cards, modales)
- `--radius-lg`: 16px (contenedores grandes)

## Token Architecture

### Surface Elevation
- `--color-canvas`: Fondo de página (#f5f0e8 light / #1a1614 dark)
- `--color-surface`: Cards, contenedores (#fcf9f4 / #25201c)
- `--color-surface-alt`: Headers de tabla, hover sutil (#f8f3eb / #2f2925)
- `--color-panel`: Nav bar, paneles de control (#efe8dd / #1e1917)

### Text Hierarchy
- `--color-text-primary`: Texto principal (#2c2420 / #e8e2dc)
- `--color-text-secondary`: Texto de apoyo (#6b5d55 / #b0a69e)
- `--color-text-tertiary`: Metadatos, labels (#a09086 / #7a7068)
- `--color-text-muted`: Deshabilitado, placeholders (#c4b8ae)

### Border Progression
- `--color-border-soft`: Separación suave (#eeeae2 / #332d28)
- `--color-border`: Borde estándar (#e3ddd4 / #3d3530)
- `--color-border-emphasis`: Borde de énfasis (#d5ccc0 / #4a423c)

### Brand & Semantic
- `--color-accent`: Verdigris, acción principal (#117a6b / #4fc3b3)
- `--color-accent-soft`: Fondo de acento (#d1f0e9 / #1a3d38)
- `--color-warm-accent`: Ámbar, advertencia (#b45309)
- `--color-success`: Verde oliva (#5c6a46)
- `--color-destructive`: Rojo (#b91c1c)

### Workshop-specific
- `--color-gauge`: Fondo de indicador tipo instrumento (#8a7a6e / #6b625a)
- `--color-gauge-active`: Indicador activo (mismo que accent)
- `--color-sticky`: Fondo de nota adhesiva (#fef7e0 / #2d2810)

## Typography
- **Geist Sans** (`--font-geist-sans`): Texto general, UI
- **Geist Mono** (`--font-geist-mono`): Números, código, gauges

## Key Components

### ModeSwitch
Switch horizontal tipo panel de taller con dos posiciones: ⚒ Taller y ◫ Estudio. Sliding pill indicator con color accent. Implementado en `src/components/mode-switch.tsx`.

### Gauge
Badge empotrado tipo instrumento de panel. Usar en headers de sección como indicador visual. Clase CSS `.gauge` con variante `.gauge-active`.

### Sticky Note
Fondo amarillo/mostaza simulando nota adhesiva. Usar para notas, observaciones, comentarios en formularios. Clase CSS `.sticky-note`.

### FolderTab
Indicador de estado tipo folder con barra lateral de color. Usar para mostrar estado en listas. Componente `src/components/folder-tab.tsx`.

### Canvas Texture
Textura sutil de fondo mediante radial-gradients. Clase `.canvas-texture` en el body.

## Navigation
- Nav bar con `bg-panel` + `canvas-texture` en modo Taller
- Nav bar con `bg-stone-900` en modo Estudio
- ModeSwitch centrado entre el logo y los links
- Links de navegación secundarios a la derecha (Search, Theme, Nuevo)

## Dark Mode
Clase `.dark` en `<html>`. Inicializado por script inline en layout.tsx para evitar FOUC. Todos los tokens tienen variante dark. En modo oscuro, fondos más cálidos (no grises fríos) para mantener la coherencia material.
