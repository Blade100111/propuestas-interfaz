---
version: 1
slug: "gestion-contratista-bandeja"
primary_target: "gestion-contratista/bandeja"
related_targets: []
---

# Surface Brief: Bandeja del Contratista

**Route:** `gestion-contratista/bandeja`
**Component:** `BandejaContratistaComponent`
**Mode:** Operate
**Status:** Built — prototype complete, pending real API integration

## What this surface does

Lists all `pago_mensual` records for the authenticated contractor, filtered by month and year. Each row shows the contract number, object, contract type, fiscal year, month, payment state chip, and a contextual action button. The contractor uses this to see which payments need attention (CD, RS states) and to navigate into each payment's detail screen.

## Scope

**In scope:**
- List of contracts with `pago_mensual` state (CD / PRS / AS / AP / RS / RO)
- Tab rail filtering by state (Todos + one tab per state)
- Count badges on tabs
- Sort: actionable states first (CD=1, RS=2), then PRS=3, AS=4, AP=5, RO=6
- Skeleton loader during async fetch
- Empty state per filter
- Navigation to `gestion-contratista/detalle-soporte/:pagoMensualId` on action button click

**Out of scope (lives in detalle-soporte):**
- Document upload
- CD → PRS state transition (send to review)
- Rejection reason display

## Data shape

```typescript
interface PagoMensual {
  id: number;
  numeroContrato: string;
  objeto: string;
  tipoContrato: string;
  vigencia: number;
  mes: string;
  estado: 'CD' | 'PRS' | 'AS' | 'AP' | 'RS' | 'RO';
  pagoMensualId: number;
}
```

Source: `cargaDocumentosContratistaCtrl` (see `../../cumplidos_mf/MIGRATION_MAP.md`)

## Layout decisions

- **Desktop (≥768px):** 7-column data table inside `rounded-xl` card. Tipo + Vigencia columns collapse below `lg` (1024px).
- **Mobile (<768px):** Stacked `li` cards — number + chip header, 3-line object text, 3-col detail grid, full-width button.
- **Sticky tab rail:** `top-0 z-10 shadow-sm`, horizontally scrollable, no visible scrollbar.

## Action button logic

| Estado | Accionable | Button variant | Button text |
|--------|-----------|---------------|-------------|
| CD     | Yes       | Primary (red) | "Ver soporte" |
| RS     | Yes       | Primary (red) | "Ver soporte" |
| PRS    | No        | Ghost         | "Ver estado" |
| AS     | No        | Ghost         | "Ver estado" |
| AP     | No        | Ghost         | "Ver estado" |
| RO     | No        | Ghost         | "Ver estado" |

Both variants navigate to `detalle-soporte/:pagoMensualId`.

## Chip color assignments

See DESIGN.md → Components → State Chips. CD and PRS use dark text; all others use white.

## Personas on this screen

**CONTRATISTA only.** This screen is not shown to SUPERVISOR, ORDENADOR, or CONTROL_INTERNO. Those roles have their own inboxes (not yet prototyped).
