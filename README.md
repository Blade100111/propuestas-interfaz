# propuestas-interfaz

Sandbox de propuesta de interfaz para el módulo de **cumplidos de contratistas** de la Universidad Distrital Francisco José de Caldas. Su propósito es validar flujos, pantallas y decisiones de UX antes de que el código final aterrice en `cumplidos_mf`.

> **Nota:** todos los datos mostrados son hardcodeados. Este repositorio es desechable; el código de producción vivirá en `cumplidos_mf`.

---

## Contexto

El proceso de cumplidos permite a los contratistas de la universidad reportar mensualmente las actividades ejecutadas y cargar los documentos de soporte correspondientes. El flujo involucra cuatro roles: **Contratista**, Supervisor, Ordenador del Gasto y Control Interno.

Este sandbox cubre la perspectiva del **Contratista** — el primer eslabón del proceso.

### Flujo implementado

```
Mis contratos → Solicitudes → Detalle soporte ⟷ Informe
```

| Pantalla | Ruta | Descripción |
|---|---|---|
| Mis contratos | `/gestion-contratista/contratos` | Listado de contratos activos del contratista. Búsqueda, ordenamiento, badges INICIAL / OTRO SÍ. |
| Solicitudes | `/gestion-contratista/contratos/:numero/solicitudes` | Creación de solicitudes por mes/año. Filtro por tab (requieren atención / todos). Chips de estado. |
| Detalle soporte | `/gestion-contratista/detalle-soporte/:id` | Carga de documentos por ítem del informe. Drag-and-drop. Editable en CD/RS; solo lectura en PRS/AS/AP/RO. |
| Informe | `/gestion-contratista/informe/:id` | Acordeón de actividades → productos con campos de cumplimiento. Misma regla de edición que detalle soporte. |

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

## Stack

- **Angular 21** — componentes standalone, señales (`signal`, `computed`), nueva sintaxis de control de flujo (`@if` / `@for`)
- **Tailwind CSS v4** — utilidades CSS; paleta GAIA institucional (`#731514` crimson)
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

## Estructura relevante

```
src/app/
└── gestion-contratista/
    ├── contratos/          # Mis contratos
    ├── solicitudes/        # Solicitudes por contrato
    ├── detalle-soporte/    # Carga de documentos
    └── informe/            # Informe de actividades
```

---

## Proyecto de producción

El código final de este módulo vivirá en [`cumplidos_mf`](https://github.com/udistrital/cumplidos_mf). Consultar `DIAGNOSTICO_ARQUITECTURA.md` y `MIGRATION_MAP.md` en ese repositorio para contexto de arquitectura, endpoints y decisiones de diseño.
