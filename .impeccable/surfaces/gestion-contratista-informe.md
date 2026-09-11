# Surface Brief: gestion-contratista/informe/:pagoMensualId

<!-- impeccable:surface-brief 1 -->

## Meta

| Field | Value |
|---|---|
| route | `/gestion-contratista/informe/:pagoMensualId` |
| component | `InformeContratistaComponent` |
| file | `src/app/gestion-contratista/informe/informe-contratista.component.{ts,html}` |
| mode | Operate |
| status | planned |
| entry | "Completar informe de gestión" ghost button from detalle-soporte |

---

## 1. Job and audience

**Who:** CONTRATISTA completing their monthly informe de gestión — documenting what they did, with what result, against what evidence. Arrives from detalle-soporte; this screen is separate from doc upload and is optional relative to sending to review.

**Context:** The informe is the narrative companion to the PDF soportes. The contratista may fill it before or after uploading docs, but both belong to the same `pago_mensual`. The form is not a blocker for "Enviar a revisión" — the design must not imply otherwise.

---

## 2. Real domain fields (from legacy controller + view — no invented names)

### From `pago_mensual` (already loaded, same mock as bandeja/detalle-soporte)

| Field | Display |
|---|---|
| `NumeroContrato` | "Contrato 789-2025" in page heading |
| `Ano` | Year |
| `Mes` | Month number → month name via utils |

### From `informacion_informe/{pago_mensual_id}` response (read-only context, displayed at top)

| Field | Display |
|---|---|
| `Objeto` | Contract object (read-only) |
| `ActividadesEspecificas` | Specific activities from contract scope (read-only context block) |
| `FechasConNovedades.FechaInicio` | Constrain `PeriodoInformeInicio` min date |
| `FechasConNovedades.FechaFin` | Constrain `PeriodoInformeFin` max date |

### Informe form data (editable, saved to `informe/{pago_mensual_id}`)

| Field | Type | Constraints |
|---|---|---|
| `Proceso` | Select | Hardcoded list of 22 institutional processes (see §7) |
| `PeriodoInformeInicio` | Date | min: `FechasConNovedades.FechaInicio`, max: `FechaFin` |
| `PeriodoInformeFin` | Date | min: `FechaInicio`, max: `FechasConNovedades.FechaFin` |
| `ActividadesEspecificas[]` | Array (Level 1) | Reorderable, expandable |

### Per `ActividadEspecifica` (Level 1 — general activity)

| Field | Type | Constraints |
|---|---|---|
| `ActividadEspecifica` | text input | maxlength 1000 |
| `Avance` | number | 0–100 (percent) |
| `Activo` | boolean | soft-delete; `false` items hidden in render |
| `ActividadesRealizadas[]` | sub-array (Level 2) | |

### Per `ActividadRealizada` (Level 2 — performed activity detail, inside each Level 1)

| Field | Type | Constraints |
|---|---|---|
| `Actividad` | textarea | maxlength 1000 |
| `ProductoAsociado` | textarea | maxlength 250 |
| `Evidencia` | textarea | maxlength 1000 |
| `Activo` | boolean | soft-delete |

---

## 3. Editable mode decision — DESIGN DECISION, not legacy behavior

**Legacy fact:** `InformeGyCertificadoCCtrl` has NO state-based restriction. The form is always shown in edit mode regardless of `pago_mensual` estado. There is no `readonly` check against `CodigoAbreviacion` in the controller.

**New design decision (confirmed, NOT inherited from legacy):** **CD, RS, and PRS = editable; AS, AP, RO = read-only.**

**Rationale:** The informe is explicitly optional relative to "Enviar a revisión" from detalle-soporte. A contratista who uploads soportes and sends to review (CD→PRS) without having filled the informe must be able to complete it while the review is in progress. Blocking in PRS would contradict the optional nature of the informe. Blocking at AS is correct: the supervisor has evaluated the full package including the informe, so edits would be anachronistic.

**Pending stakeholder validation:** This decision is NOT a migration of legacy behavior (the legacy had no restriction at all). It must be validated with the office before production implementation in `cumplidos_mf`.

---

## 4. Reordering mechanism for ActividadesEspecificas (Level 1)

**Decision: ↑/↓ buttons as primary mechanism.**

Reasoning:
- The reordering requirement is a business given; the mechanism is an open design decision.
- Drag-and-drop requires ARIA `role="listbox"` + keyboard arrow key handlers to be accessible — significant complexity for a prototype.
- ↑/↓ buttons are keyboard-accessible by default (Tab focus + Enter/Space), provide 48px touch targets on mobile, and are self-explanatory for a low-frequency operation.
- Typical item count: 2–6 activities. ↑/↓ is not tedious at this scale.
- CDK DragDrop can be layered on top in `cumplidos_mf` production for mouse/touch without changing the accessible fallback.

**Implementation in prototype:** Two icon buttons (↑ / ↓) per Level 1 item, disabled when already at top/bottom. Keyboard: Tab reaches each button; Enter/Space moves the item.

---

## 5. In scope

1. **Back navigation** — "← Volver al soporte" → `detalle-soporte/:pagoMensualId`
2. **Page heading** — "Informe — Contrato [número]" + estado chip (same chip component)
3. **Context card** (read-only) — `Objeto` + `ActividadesEspecificas` from `informacion_informe` (what was contracted, not what was done)
4. **Form header row** — Proceso (select) + PeriodoInformeInicio / PeriodoInformeFin (date inputs)
5. **ActivityEspecifica accordion list** (editable mode only or read-only per §3):
   - Each item: expandable header (ActividadEspecifica text + Avance %) + ↑/↓ reorder buttons + delete × + expand toggle
   - Expanded body: ActividadesRealizadas rows (Actividad | ProductoAsociado | Evidencia + delete × per row)
   - "Agregar actividad realizada" ghost button inside each expanded item
   - "Agregar actividad específica" ghost button at list bottom
6. **"Última vez guardado"** — static hardcoded timestamp (e.g. "Guardado: 26 ago 2025, 10:32") — visual indicator only, no behavior
7. **"Generar certificado"** — ghost button visible in all states; no action on click in prototype
8. **Read-only mode** (PRS/AS/AP/RO) — same content displayed as plain text, no inputs, no reordering controls, no add/delete buttons; status banner (same pattern as detalle-soporte)

## Out of scope

- Preliquidación modal (financial breakdown — not needed for UI validation)
- Auto-save logic or save-on-exit behavior
- Real PDF generation or upload to gestor documental
- `informe/ultimo_informe` (copy-from-previous mechanism) — stub behavior only
- State transition from this screen (the "Enviar a revisión" CTA lives in detalle-soporte, not here)

---

## 6. Layout and interaction

### Structure (top → bottom)

1. Back nav → "Volver al soporte"
2. Page heading: "Informe — Contrato [número]" + estado chip
3. Context card (read-only, `rounded-xl shadow-sm`) — `Objeto` heading + `ActividadesEspecificas` from contract
4. "Última vez guardado" — subdued text, right-aligned or inline with form header
5. Form section: Proceso select (full width) + date range (two date inputs side-by-side on md+, stacked on mobile)
6. Accordion list: `rounded-xl border shadow-sm` wrapper containing `divide-y divide-gray-100` rows — same visual pattern as "Documentos enviados" in detalle-soporte
   - Collapsed row: drag handle area → ↑/↓ buttons → [ActividadEspecifica truncated 1 line] → [Avance %] → expand chevron → delete ×
   - Expanded row: above + sub-list of ActividadesRealizadas rows (Actividad / ProductoAsociado / Evidencia as labeled fields, not a table) + "Agregar actividad realizada" ghost button
7. "Agregar actividad específica" ghost button below accordion
8. "Generar certificado" ghost button (always visible, no action)

### Responsive

- Accordion rows: full-width single column on mobile; date inputs stack (full-width each)
- Sub-item fields (Actividad/ProductoAsociado/Evidencia): stacked on mobile, 3-col grid on md+
- ↑/↓ buttons: always visible as column on left side of row (44px min tap target)
- Avance % field: inline next to activity text on desktop, below it on mobile

### Interaction notes

- Expand/collapse: clicking the chevron or the row body (not the ↑/↓ or × buttons) toggles expansion
- Delete Level 1: marks `Activo: false` (soft delete); item disappears from view; no confirmation for prototype
- Delete Level 2: same soft delete pattern; no confirmation
- ↑ at position 0: button disabled. ↓ at last position: button disabled
- "Generar certificado": button renders, onClick does nothing (no toast, no transition)
- Read-only mode: same data displayed, no controls, no edit indicators

---

## 7. Hardcoded data (consistent with bandeja + detalle-soporte mock)

**pagoMensualId 1001 (Contrato 789-2025, CD — editable):** Pre-filled informe with 2 `ActividadesEspecificas`, each with 1 `ActividadRealizada`.

**pagoMensualId 1002 (Contrato 654-2025, RS — editable):** Pre-filled with rejection context visible; informe shows previous entry.

**pagoMensualId 1003+ (PRS/AS/AP/RO — read-only):** Read-only view of submitted informe.

**Proceso options (real domain list, 22 items hardcoded in legacy controller):**
1. Planeación Estratégica e Institucional
2. Gestión Integrada
3. Autoevaluación y Acreditación
4. Interinstitucionalización e Internacionalización
5. Comunicaciones
6. Gestión de Docencia
7. Gestión de Investigación
8. Extensión y Proyección Social
9. Admisiones, Registro y Control
10. Bienestar Institucional
11. Gestión de la Información Bibliográfica
12. Gestión de Laboratorios
13. Servicio al Ciudadano
14. Gestión de los Sistemas de Información y las Telecomunicaciones
15. Gestión y Desarrollo del Talento Humano
16. Gestión Documental
17. Gestión de Infraestructura Física
18. Gestión de Recursos Financieros
19. Gestión Contractual
20. Gestión Jurídica
21. Evaluación y Control
22. Control Disciplinario

---

## 8. Design system reuse

| Element | Reuses |
|---|---|
| Back nav | Same `backBtnCls` literal from detalle-soporte |
| Page heading chip | Same chip components from design.json |
| Context card | Same `rounded-xl shadow-sm border` card pattern |
| Status banners (read-only states) | Same `infoPanelCls` / `successPanelCls` from detalle-soporte |
| Accordion list wrapper | Same `rounded-xl border shadow-sm divide-y divide-gray-100` as "Documentos enviados" |
| "Agregar actividad" | `button-ghost` from design.json |
| "Generar certificado" | `button-ghost` from design.json |
| ↑/↓ icon buttons | Icon-only variant of ghost pattern — new size variant (icon-only, square) |
| × delete button | Same pattern as staged-file remove button in detalle-soporte |

No new component variants in design.json beyond the icon-only ghost button (↑/↓/×). Add after implementation.
