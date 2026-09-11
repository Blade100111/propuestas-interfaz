---
version: 1
slug: "gestion-contratista-solicitudes"
primary_target: "gestion-contratista/contratos/:numeroContrato/solicitudes"
related_targets:
  - "gestion-contratista/contratos"
  - "gestion-contratista/detalle-soporte/:pagoMensualId"
---

# Surface Brief: Solicitudes de Cumplido por Contrato

**Route:** `gestion-contratista/contratos/:numeroContrato/solicitudes`
**Query params:** `?cdp=X&vigenciaCdp=Y` (temporary routing key — see DIAGNOSTICO_ARQUITECTURA.md § 5)
**Component:** `SolicitudesContratistaComponent`
**Mode:** Operate
**Status:** Built — prototype complete, pending real API integration

## What this surface does

Second screen in the CONTRATISTA flow. Shows all monthly payment solicitudes
(pago_mensual records) for a single contract identified by `numeroContrato` + CDP
query params. The contractor can:
1. Create a new solicitude for a given month/year (validated against duplicates).
2. Filter by "Requieren acción" (CD + RS) or "Todos".
3. Sort by Año, Mes, or Estado.
4. Navigate to the detalle-soporte screen for any existing solicitude.

## Entry / exit

**Entry:** "Solicitar cumplido →" button on `gestion-contratista/contratos`.
**Exit:**
- Back button → `gestion-contratista/contratos`
- "Ver soporte →" → `gestion-contratista/detalle-soporte/:pagoMensualId`

## Scope

**In scope:**
- Header: contract number + CDP context line + back button
- Creation panel: Año select + Mes select + "Crear solicitud" button + inline error
  - Duplicate validation: same mes+año already exists → show error, do not create
  - New solicitude is created in CD state, prepended to the list
- Sticky tab rail: "Requieren acción" (CD+RS) / "Todos"
  - Badge count on "Requieren acción" tab
- Skeleton loader during async fetch
- Empty state per tab (no action-needed vs. no solicitudes at all)
- Desktop table (≥md): Año (sortable) · Mes (sortable) · Estado chip (sortable) · Acción
- Mobile cards (<md): Mes Año header + Estado chip + full-width "Ver soporte" button
- Sort: asc/desc toggle per column; Estado sorted by business priority (CD=1 RS=2 PRS=3 AS=4 AP=5 RO=6)

**Out of scope:**
- State transitions (CD→PRS etc.) — handled in detalle-soporte
- Document upload — handled in detalle-soporte
- Informe editing — handled in informe screen

## Data shape

```typescript
interface SolicitudMock {
  pagoMensualId: number;
  mes: number;          // 1–12
  mesNombre: string;    // 'Enero' … 'Diciembre'
  ano: number;
  estado: 'CD' | 'PRS' | 'AS' | 'AP' | 'RS' | 'RO';
}
```

## Mock data

6 rows, all contract 789-2025, pagoMensualIds 1001–1006:

| pagoMensualId | Mes      | Año  | Estado |
|---------------|----------|------|--------|
| 1001          | Julio    | 2025 | CD     |
| 1002          | Junio    | 2025 | RS     |
| 1003          | Mayo     | 2025 | PRS    |
| 1004          | Abril    | 2025 | AS     |
| 1005          | Marzo    | 2025 | AP     |
| 1006          | Febrero  | 2025 | RO     |

Same IDs are shared with `detalle-soporte-contratista` and `informe-contratista` mocks.

## Layout decisions

- **Header:** back button above the h1 (same pattern as detalle-soporte + informe).
- **Creation panel:** white bar between header and tab rail; horizontal row on all viewports.
- **Tab rail:** `sticky top-0 z-10`; two tabs only (no filtering by other dimensions).
- **Desktop (≥md):** 4-column table; sortable Año/Mes/Estado headers show ↕/↑/↓.
- **Mobile (<md):** card list; ghost button replaced by full-width crimson button.

## Personas on this screen

**CONTRATISTA only.**
