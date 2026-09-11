# Surface Brief: gestion-contratista/detalle-soporte/:pagoMensualId

<!-- impeccable:surface-brief 1 -->

## Meta

| Field | Value |
|---|---|
| route | `/gestion-contratista/detalle-soporte/:pagoMensualId` |
| component | `DetalleSoporteContratistaComponent` |
| file | `src/app/gestion-contratista/detalle-soporte/detalle-soporte-contratista.component.{ts,html}` |
| mode | Operate |
| status | planned |
| entry | "Ver soporte" (primary) or "Ver estado" (ghost) from bandeja-contratista |

---

## 1. Job and audience

**Who:** CONTRATISTA, arriving from bandeja after tapping one of their contract rows.

**Two entry states:**

- **Editable** (estado = CD or RS): contractor has pending work. CD = fresh payment period, needs to upload documents and submit. RS = supervisor rejected, must read rejection reason and resubmit. Urgency is medium-high; this blocks payment.
- **Read-only** (estado = PRS / AS / AP / RO): contractor checking status or reviewing what was submitted. No action available or expected.

---

## 2. Outcome and proof

**Editable:** one or more PDF soportes uploaded + "Enviar a revisión" tapped → contract transitions CD→PRS (or RS→PRS) → user is returned to bandeja.

**Read-only:** user understands current status, can see submitted documents, knows whether further action is needed (RS/RO) and who to contact.

**Product-specific truth:** the same action label "Enviar a revisión" covers both CD→PRS and RS→PRS. The form never shows both modes simultaneously — mode is fully derived from `estado` at load time.

---

## 3. Single-route dual-mode — confirmed

One route (`/detalle-soporte/:pagoMensualId`), mode derived from `estado` on load. No reason to split into separate routes:

- Same resource (same `pago_mensual` record)
- Same data fetched on entry (contract summary + soportes list)
- The difference is a rendering decision (upload zone visible or not), not a navigation one
- Splitting would require route guards that read runtime state, duplicating data loading

After submission, route redirects back to bandeja (state change makes edit mode invalid for the session).

---

## 4. Real domain fields (do not invent fields)

### From `pago_mensual` (CRUD, `cumplidos_crud/v1`)

| Field | Display label | Notes |
|---|---|---|
| `NumeroContrato` | Contrato | e.g. "789-2025" — tabular-nums |
| `Objeto` | Objeto del contrato | Full text, no truncation |
| `TipoContrato` | Tipo | "Prestación de Servicios" / "Consultoría" |
| `Vigencia` | Vigencia | year |
| `Mes` | Mes | e.g. "Julio" |
| `EstadoPagoMensualId.CodigoAbreviacion` | Estado | rendered as chip |

### From `contrato/{numero}/{vigencia}` (JBPM v1)

| Field | Display label |
|---|---|
| `contrato.supervisor.NombreSupervisor` | Supervisor |
| `contrato.supervisor.Cargo` | Cargo supervisor |

### From `historicos/cambio_estado_pago/{id}` (MID v2)

| Field | Display label | Shown when |
|---|---|---|
| `ObservacionRechazo` | Observaciones | RS or RO estado |
| `CargoEjecutor` | Ejecutado por | Optional in timeline |

### From `contratos_contratista/documentos_pago_mensual/{id}` (MID v2)

| Field | Display label |
|---|---|
| `NombreArchivo` | Nombre del archivo |
| `FechaCarga` | Fecha |

---

## 5. In scope

1. **Back navigation** — "← Volver a bandeja" (top-left)
2. **Contract summary card** — all real-domain fields listed in §4, estado chip
3. **Rejection reason panel** — RS and RO only; shows `ObservacionRechazo`; uses tints from existing `danger-scarlet` and `neutral-slate` tonal ramps in design.json — no new colors introduced:
   - RS: bg `#f8d9d9` (danger-scarlet ramp[8]) · border + text `#930E10` (danger-scarlet canonical) — same token family as chip-rs
   - RO: bg `#f0f2f5` (neutral-slate ramp[8]) · border + text `#6B7280` (neutral-slate canonical) — same token family as chip-ro
   - Neither color is Gaia Crimson; The Crimson Gate Rule is not affected
4. **Upload zone** — editable mode only; PDF only; multiple files; size limit **asumido: 5 MB por archivo — pendiente de confirmar contra límite real del backend Nuxeo / API gateway** (MIGRATION_MAP no documenta este valor); type and size validation visible inline per file; staged file list with × remove; drag-and-drop + browse click
5. **Documents on record** — read-only list in all modes (when documents exist); file name + date; each row has a view/download link
6. **Link to informe** — ghost button or text link "Completar informe de gestión →" navigates to stub route `gestion-contratista/informe/:pagoMensualId`
7. **"Enviar a revisión" primary action** — editable mode only; covers CD→PRS and RS→PRS; full-width on mobile, right-aligned on desktop

## Out of scope

- Informe de gestión form (separate surface, next session)
- Real HTTP calls or persistence
- PDF generation or certificate preview
- Supervisor/ordenador views (separate role surfaces)
- File download implementation (link stub only)

---

## 6. States matrix

| Estado | Mode | Key UI elements |
|---|---|---|
| CD | Editable | Upload zone (empty, no prior docs), "Enviar a revisión" CTA |
| RS | Editable | Rejection reason box (prominent) + prior docs list + upload zone (add/replace) + "Enviar a revisión" |
| PRS | Read-only | Prior docs list, informational note "En revisión por el supervisor", no action |
| AS | Read-only | Prior docs list, "Aprobado por supervisor — pendiente de ordenador" note |
| AP | Read-only | Prior docs list, completion state — "Aprobado y pagado" |
| RO | Read-only | Rejection reason box (neutral palette, terminal) + "Contacte a su supervisor" note |

---

## 7. Layout and interaction

### Structure (top to bottom)

1. **Page header row** — back arrow · "Contrato [NumeroContrato]" heading · estado chip (right-aligned)
2. **Contract summary card** — rounded-xl, shadow-sm, white surface
   - `Objeto` in full (no clamp; this is a detail view)
   - Meta grid: Tipo · Vigencia · Mes · Supervisor + Cargo
3. **Rejection reason panel** (RS/RO only) — full-width, below summary card, before upload
4. **Upload zone** (editable only) — dashed border, centered icon + copy, full-width; below it: staged file list; per-file validation error inline
5. **Documents on record** — below upload zone; always visible when docs exist; read-only rows
6. **Informe link** — below doc list
7. **Action bar** (editable only) — "Enviar a revisión" primary + "Cancelar" ghost; sticky bottom on mobile, inline below informe link on desktop

### Responsive

- Single-column layout at all breakpoints (no table — one record at a time, not a list)
- Upload zone and action button full-width on mobile
- Contract summary meta: 2-col grid on mobile (tipo/vigencia left, mes/supervisor right), 4-col on md+
- Sticky action bar on mobile only (position: fixed bottom + safe-area-inset)

### Interaction notes

- File add: triggers validation immediately; invalid files show error chip inline, not in a toast
- File remove from staged list: confirmation not required (destructive action is reversible before submission)
- "Enviar a revisión": disabled if no files staged AND estado = CD (no docs to send); enabled if estado = RS even with no new files (re-sends existing docs)
- Submission success: navigate to bandeja; no intermediate confirmation dialog

---

## 8. Design system reuse

| Element | Reuses |
|---|---|
| "Enviar a revisión" | `button-primary` |
| "Cancelar" / back / "Ver informe" | `button-ghost` |
| Estado header chip | `chip-cd` / `chip-rs` / `chip-prs` / `chip-success` / `chip-ro` |
| Rejection box header chip | `chip-rs` (RS) / `chip-ro` (RO) |
| Contract summary container | card radius/shadow pattern (rounded-xl, shadow-sm) |
| Tab rail | not used on this screen |

No new component variants needed. Upload zone and doc list are new patterns (not in design.json) — add them to components after implementation.

---

## 9. Hardcoded data (consistent with bandeja mock)

| pagoMensualId | NumeroContrato | Estado | Notes |
|---|---|---|---|
| 1001 | 789-2025 | CD | No docs uploaded; blank upload zone |
| 1002 | 654-2025 | RS | Rejection reason: "El informe de actividades no detalla las tareas realizadas durante el periodo. Por favor corrija y reenvíe con el detalle completo." + 1 prior doc |
| 1003 | 512-2025 | PRS | 2 docs uploaded; read-only |
| 1004 | 401-2025 | AS | 2 docs + informe; read-only |
| 1005 | 310-2025 | AP | 2 docs; read-only; completion state |
| 1006 | 201-2025 | RO | Rejection reason: "Los soportes presentados no corresponden al periodo contractual indicado. Se revierte la aprobación." |

Supervisor for all: "María Fernanda Ospina Ruiz · Coordinadora de Sistemas" (hardcoded from contrato endpoint shape).
