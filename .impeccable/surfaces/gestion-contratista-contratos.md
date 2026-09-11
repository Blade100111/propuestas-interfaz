---
version: 1
slug: "gestion-contratista-contratos"
primary_target: "gestion-contratista/contratos"
related_targets: []
---

# Surface Brief: Lista de Contratos del Contratista

**Route:** `gestion-contratista/contratos`
**Component:** `ContratosContratistaComponent`
**Mode:** Operate
**Status:** Built — prototype complete, pending real API integration

## What this surface does

Entry point for the CONTRATISTA role. Lists all active contracts associated with the
authenticated contractor's document number. Each row shows the contract identifiers
(number, vigencia, RP, CDP, dependencia) and contract type (INICIAL or OTRO SÍ n).
The contractor selects a contract to manage its monthly payment solicitudes.

## Scope

**In scope:**
- List of contracts from `GET cumplidos_mid/v2/contratos_contratista/{doc}`
- Columns: NumeroContratoSuscrito, Vigencia, TipoContrato (INICIAL / OTRO SÍ n), NumeroRp, NumeroCdp, NombreDependencia
- OTRO SÍ rows sorted immediately after their INICIAL sibling (same contract number, different CDP)
- OTRO SÍ visual treatment: ↳ prefix in contract number cell (desktop) + distinct badge style
- Single action per row: "Solicitar cumplido →" → navigates to `gestion-contratista/contratos/:numeroContrato/solicitudes`
- Skeleton loader during async fetch
- Empty state: "No tiene contratos asociados a su número de documento"

**Out of scope (lives in subsequent screens):**
- Solicitudes (pago_mensual) list — belongs to `gestion-contratista/contratos/:id/solicitudes`
- Document upload, state transitions
- No tab rail / no filtering (contracts have no payment state)

## Data shape

```typescript
interface ContratoItem {
  id: number;
  numeroContratoSuscrito: string;   // e.g. '789-2025'
  vigencia: number;                  // e.g. 2025
  tipoContrato: string;              // 'INICIAL' | 'OTRO SÍ n'
  esOtroSi: boolean;                 // derived flag for visual treatment
  numeroRp: number;                  // e.g. 11546
  numeroCdp: number;                 // e.g. 4256
  nombreDependencia: string;
}
```

Source: `cargaDocumentosContratistaCtrl` → `clasificarContratos()` (see
`../../cumplidos_mf/MIGRATION_MAP.md` § 7.1)

## Layout decisions

- **Desktop (≥768px):** 7-column table inside `rounded-xl` card. RP + CDP columns
  collapse below `lg` (1024px).
- **Mobile (<768px):** Stacked `li` cards — number + tipo badge header, 3-col detail
  grid (Vigencia / RP / CDP), dependencia full-width, full-width action button.
- **No tab rail** — contracts carry no payment state.

## Visual treatment for OTRO SÍ rows

Desktop table:
- Row background: `bg-gray-50/50` (vs white for INICIAL)
- Contract number cell: `↳` prefix in `text-gray-300`
- Tipo badge: `bg-gray-200 text-gray-700 font-semibold`

INICIAL rows:
- Tipo badge: `bg-gray-100 text-gray-500 font-medium`

Mobile card: badge text alone distinguishes type (no ↳ on mobile).

## Sort order

Descending by the numeric prefix of `NumeroContratoSuscrito` (789 → 654 → 512 → 401
→ 310 → 201). Within the same number, INICIAL comes before OTRO SÍ n.

## Navigation target

`/gestion-contratista/contratos/:numeroContrato/solicitudes` — receives the
`NumeroContratoSuscrito` as a route param. This sub-route will be a reconstructed
`BandejaContratistaComponent` scoped to one contract (planned for a separate shape
session; not yet built).

## Personas on this screen

**CONTRATISTA only.**
