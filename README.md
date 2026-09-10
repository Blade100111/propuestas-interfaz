# propuestas-interfaz

Sandbox de propuesta de interfaz para el módulo de **cumplidos de contratistas** de la Universidad Distrital Francisco José de Caldas. Su propósito es validar flujos, pantallas y decisiones de UX antes de que el código final aterrice en `cumplidos_mf`.

> **Nota:** todos los datos mostrados son hardcodeados. Este repositorio es desechable; el código de producción vivirá en `cumplidos_mf`.

---

## Contexto

El proceso de cumplidos permite a los contratistas de la universidad reportar mensualmente las actividades ejecutadas y cargar los documentos de soporte correspondientes. El flujo involucra cuatro roles: **Contratista**, **Supervisor**, **Ordenador del Gasto** y **Control Interno**.

---

## Pantallas implementadas

### Rol Contratista (rama `main`)

```
Mis contratos → Solicitudes → Detalle soporte ⟷ Informe
```

| Pantalla | Ruta | Descripción |
|---|---|---|
| Mis contratos | `/gestion-contratista/contratos` | Listado de contratos activos. Búsqueda, ordenamiento, badges INICIAL / OTRO SÍ. |
| Solicitudes | `/gestion-contratista/contratos/:numero/solicitudes` | Creación de solicitudes por mes/año. Filtro por tab (requieren atención / todos). Chips de estado. |
| Detalle soporte | `/gestion-contratista/detalle-soporte/:id` | Carga de documentos por ítem. Drag-and-drop. Editable en CD/RS; solo lectura en otros estados. |
| Informe | `/gestion-contratista/informe/:id` | Acordeón de actividades y productos. Generación de certificado PDF con pdfmake. |

### Componentes compartidos (`src/app/shared/`)

| Componente | Descripción |
|---|---|
| `DataTableComponent` | Tabla genérica responsive: desktop `<table>` + mobile cards, skeleton loader, ordenamiento por columna. |
| `TabBarComponent` | Barra de filtros por tabs con badges de conteo. |
| `SearchInputComponent` | Input de búsqueda con icono de lupa. |
| `EstadoChipComponent` | Chip de color por estado (CD, PRS, AS, AP, RS, RO) según paleta GAIA. |
| `EmptyStateComponent` | Estado vacío con icono, título y descripción. |
| `layout.ts` | Constantes de ancho de contenedor (MAIN_WIDE, MAIN_NARROW, HDR_WIDE, HDR_NARROW). |
| `estado.constants.ts` | Configuración de estados (labels, colores, prioridad de ordenamiento). |
| `ApiService` | Wrapper HTTP genérico (placeholder para integración con backend). |
| `SessionService` | Datos de sesión del usuario autenticado (mock). |

### Máquina de estados (`pago_mensual`)

```
CD → PRS → AS → AP
          ↓
         RS  (rechazo supervisor → vuelve a CD)
     PRS → RO (rechazo ordenador)
```

| Código | Estado | Quién actúa |
|---|---|---|
| `CD` | Creado | Contratista carga soportes |
| `PRS` | En revisión supervisor | Supervisor revisa |
| `AS` | Aprobado supervisor | Pendiente ordenador |
| `AP` | Aprobado | Proceso terminado |
| `RS` | Rechazado supervisor | Contratista corrige |
| `RO` | Rechazado ordenador | Proceso cerrado |

---

## Interfaces pendientes (rama `interfaces-roles`)

Las siguientes interfaces se construirán como prototipo para validar UX antes de implementar en `cumplidos_mf`. Estructura de rutas pendiente de validación.

| Interfaz | Rol | Descripción |
|---|---|---|
| Revisión del supervisor | SUPERVISOR | Bandeja de cumplidos en estado PRS. Acciones: ver soportes, aprobar (PRS→AS), rechazar (PRS→RS). Generación de certificado PDF. |
| Aprobación del ordenador | ORDENADOR_DEL_GASTO | Bandeja de cumplidos en estado AS. Aprobación individual y masiva. Filtro por dependencia. Paginación. |
| Reversión de aprobados | ORDENADOR_DEL_GASTO | Lista de cumplidos aprobados recientemente que pueden revertirse (AP→RO). |
| Parametrización de fechas | SUPERVISOR | CRUD de ventanas de carga por mes/año/dependencia. |
| Histórico de cumplidos | SUPERVISOR, ORDENADOR, CONTROL_INTERNO | Búsqueda con filtros múltiples. Línea de tiempo de estados. Descarga ZIP de documentos. |

---

## Stack

- **Angular 21** — componentes standalone, señales (`signal`, `computed`), nueva sintaxis de control de flujo (`@if` / `@for`)
- **Tailwind CSS v4** — utilidades CSS; paleta GAIA institucional (`#731514` crimson)
- **pdfmake 0.3** — generación de certificados PDF (fuente Roboto)
- **single-spa-angular** — ciclo de vida de micro-frontend; pensado para composición en el shell `udistrital`
- **Vitest** — runner de tests unitarios

---

## Comandos

```bash
npm start          # Servidor de desarrollo en http://localhost:4200
npm run build      # Build de producción → dist/
npm run watch      # Build en modo watch
npm test           # Tests unitarios
```

Generación de artefactos Angular:

```bash
ng generate component <nombre>
ng generate service <nombre>
ng generate --help
```

---

## Estructura del proyecto

```
src/app/
├── shared/
│   ├── components/         # DataTable, TabBar, SearchInput, EstadoChip, EmptyState
│   ├── services/           # ApiService, SessionService
│   ├── estado.constants.ts # Config de estados y prioridad de ordenamiento
│   └── layout.ts           # Constantes de ancho de contenedor
│
├── gestion-contratista/    # ✅ Implementado
│   ├── contratos/
│   ├── solicitudes/
│   ├── detalle-soporte/
│   └── informe/            # Incluye generación PDF (generar-certificado.ts, logos.ts)
│
├── gestion-supervisor/     # 🔲 Pendiente
├── gestion-ordenador/      # 🔲 Pendiente
├── historico/              # 🔲 Pendiente
└── parametrizacion-fechas/ # 🔲 Pendiente
```

---

## Proyecto de producción

El código final de este módulo vivirá en [`cumplidos_mf`](https://github.com/udistrital/cumplidos_mf). Consultar `DIAGNOSTICO_ARQUITECTURA.md` y `MIGRATION_MAP.md` en ese repositorio para contexto de arquitectura, endpoints y decisiones de diseño.
