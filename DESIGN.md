---
name: GAIA – Cumplidos Interface
description: Disciplined administrative UI for contractor payment tracking at Universidad Distrital
colors:
  gaia-crimson: "#731514"
  gaia-crimson-deep: "#5e1212"
  danger-scarlet: "#930E10"
  caution-amber: "#FF9311"
  caution-honey: "#FFB051"
  approval-forest: "#218B22"
  neutral-slate: "#6B7280"
  surface-white: "#FFFFFF"
  surface-subtle: "#F9FAFB"
  surface-divider: "#E5E7EB"
  text-primary: "#111827"
  text-body: "#374151"
  text-muted: "#6B7280"
  text-subdued: "#9CA3AF"
typography:
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    letterSpacing: "0.05em"
rounded:
  chip: "9999px"
  button: "6px"
  card: "12px"
spacing:
  cell: "16px 12px"
  card: "16px"
  section: "24px"
components:
  button-primary:
    backgroundColor: "{colors.gaia-crimson}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.button}"
    padding: "6px 12px"
  button-primary-hover:
    backgroundColor: "{colors.gaia-crimson-deep}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.button}"
    padding: "6px 12px"
  button-ghost:
    backgroundColor: "{colors.surface-white}"
    textColor: "{colors.text-body}"
    rounded: "{rounded.button}"
    padding: "6px 12px"
  chip-cd:
    backgroundColor: "{colors.caution-amber}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.chip}"
    padding: "2px 10px"
  chip-prs:
    backgroundColor: "{colors.caution-honey}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.chip}"
    padding: "2px 10px"
  chip-rs:
    backgroundColor: "{colors.danger-scarlet}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.chip}"
    padding: "2px 10px"
  chip-success:
    backgroundColor: "{colors.approval-forest}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.chip}"
    padding: "2px 10px"
  chip-ro:
    backgroundColor: "{colors.neutral-slate}"
    textColor: "{colors.surface-white}"
    rounded: "{rounded.chip}"
    padding: "2px 10px"
---

# Design System: GAIA – Cumplidos Interface

## Overview

**Creative North Star: "The Trusted Registry"**

This is an administrative UI for a Colombian public university's contractor payment tracking system. The visual language is deliberately restrained and institutional: dense information, clear hierarchy, no decorative noise. Every pixel earns its place by making a bureaucratic process feel manageable. The dominant surface is white with gray structure; the only color is semantic — state chips that communicate legal payment status, and one action surface (Gaia Crimson) for primary buttons.

The system tracks six payment states (CD, PRS, AS, AP, RS, RO), each with a precise color assignment that carries operational weight for the contractor. Color decisions here are functional contracts, not aesthetic choices. Manrope brings geometric warmth to what would otherwise feel cold — its rounded apertures and clean weights soften institutional density without sacrificing seriousness.

Depth is almost flat. Cards and table wrappers carry a minimal `shadow-sm`; the sticky navigation picks up the same treatment during scroll. Everything else is separated by structure — borders and tonal surface contrast — not by elevation.

**Key Characteristics:**
- Monochromatic white/gray canvas; color reserved for semantic state chips and primary action buttons
- Dense horizontal data table (desktop) paired with stacked labeled cards (mobile)
- Six-state semantic chip system with strict contrast compliance per WCAG AA
- Manrope for warmth within institutional rigor
- Gaia Crimson (#731514) on primary action buttons only — never decorative

## Colors

A near-monochromatic base with one brand accent and a dedicated semantic state palette. The brand red and the state colors never compete — they occupy different UI layers (buttons vs. chips).

### Primary
- **Gaia Crimson** (#731514): The GAIA subsystem's institutional brand color. Used exclusively on primary action buttons and the active tab bottom-border indicator. Never used as a chip background, card stripe, or decorative accent.
- **Gaia Crimson Deep** (#5e1212): Hover state for Gaia Crimson surfaces. Applied only when the primary color is already in use.

### Tertiary (semantic state palette)
- **Danger Scarlet** (#930E10): Background for RS (Rechazado Supervisor) chips — highest-severity rejection. Paired with white text (contrast ≥ 4.5:1).
- **Caution Amber** (#FF9311): Background for CD (Creado) chips — initial actionable state. Paired with gray-900 text for WCAG AA compliance.
- **Caution Honey** (#FFB051): Background for PRS (En revisión) chips — in-review state. Paired with gray-900 text for contrast compliance.
- **Approval Forest** (#218B22): Background for AS (Aprobado Supervisor) and AP (Aprobado) chips. Paired with white text.
- **Neutral Slate** (#6B7280): Background for RO (Rechazado Ordenador) chips — terminal, low-attention state. Paired with white text.

### Neutral
- **Surface White** (#FFFFFF): Primary surface for cards, table bodies, navigation bars.
- **Surface Subtle** (#F9FAFB): Page canvas, table header rows, sticky rail, footer bars.
- **Surface Divider** (#E5E7EB): Row dividers, card outlines, section separators.
- **Text Primary** (#111827): Page headings, contract numbers, bold data values.
- **Text Body** (#374151): Standard body copy — contract objects, table cell values.
- **Text Muted** (#6B7280): Secondary labels — inactive tab text, column headers.
- **Text Subdued** (#9CA3AF): Tertiary text — footer result counts, decorative date labels.

### Named Rules
**The Crimson Gate Rule.** Gaia Crimson (#731514) appears on exactly one layer per screen: primary action buttons and the active tab indicator. It is never used as a chip background, card border, heading color, or decorative stripe. State color and brand color live in parallel, not together.

**The Contrast Contract Rule.** Warm chip backgrounds (CD Amber, PRS Honey) always pair with text-gray-900. Dark chip backgrounds (Danger Scarlet, Approval Forest, Neutral Slate) always pair with white. This is non-negotiable — the chips communicate payment states with legal significance.

## Typography

**Body Font:** Manrope (with system-ui, sans-serif fallback)

**Character:** A single humanist geometric sans-serif carries the entire system. Manrope's rounded terminals bring warmth to dense administrative data; its tabular-nums feature aligns contract numbers and year values in columns without jitter. Weight variation (400 → 700) and size range (11px → 20px) supply full hierarchy without a second family.

### Hierarchy
- **Title** (700, 20px / 1.2): Page-level headings ("Mis contratos"). Appears once per screen.
- **Body** (400, 14px / 1.5): Standard data — contract objects, table values, card descriptions.
- **Label** (600, 12px / 1, uppercase, letter-spacing 0.05em): Column headers, section meta-labels. Enforces scannable structure in dense tables.
- **Data** (700, 14px, tabular-nums): Contract numbers, year values. Bold weight + tabular-nums for column alignment.
- **Caption** (400, 12px / 1.5): Footer counts, subsidiary context lines, date meta.
- **Badge** (700, 11px): Count badges in tab rail. Extra-bold for legibility at minimum size.

### Named Rules
**The One Typeface Rule.** Manrope handles every role from heading to caption. No secondary or display family is introduced. All hierarchy comes from weight (400/500/600/700) and size (11–20px).

## Layout

Single-column content area within the university portal shell. The Core MF provides the outer container (header, lateral menu, footer); this system owns only the content between.

**Container:** `max-w-7xl` centered with `mx-auto`. Horizontal padding scales: 16px (mobile), 24px (`sm:`), 32px (`lg:`).

**Breakpoints:** Mobile-first with a primary pivot at `md` (768px) — below which cards replace the data table. A secondary pivot at `lg` (1024px) reveals additional columns (Tipo, Vigencia) hidden at `md`.

**Page structure:**
1. Header area — 24px vertical padding; title + subtitle left, year indicator right.
2. Sticky tab rail — `top-0 z-10`; horizontally scrollable, hidden scrollbar.
3. Main content area — 24px top padding; table or card list fills width.

**Density:** Comfortable, not compact. Table rows at 16px vertical padding; mobile cards at 16px all-around. A contractor typically sees 4–12 rows; paging is not required at this scale.

## Elevation & Depth

The system is intentionally flat. Depth is communicated by structural borders and tonal surface contrast (white card over gray-50 canvas), not by shadows.

### Shadow Vocabulary
- **shadow-sm** (`0 1px 2px rgba(0,0,0,0.05)`): Applied to mobile card wrappers, the desktop table wrapper, and the sticky tab rail. Minimal lift — enough to separate content layer from page canvas.

### Named Rules
**The Flat-By-Default Rule.** `shadow-sm` appears on three element types only: card wrappers, the data table wrapper, and the sticky tab rail. It is not applied to buttons, chips, individual table rows, or any decorative element.

## Shapes

Gently rounded throughout. No sharp corners; no full-pill except for semantic labels and count badges.

- **Cards / Table wrapper:** Rounded corners (12px, `rounded-xl`) — friendly but structured, the outer container of dense data.
- **Buttons:** Slightly rounded (6px, `rounded-md`) — approachable and controlled. Clearly interactive, but not pill-shaped so it doesn't read as a chip.
- **State chips:** Full-pill (`rounded-full`) — distinguishes semantic labels from interactive controls.
- **Count badges:** Full-pill — consistent with chip shape language at a smaller scale.

### Named Rules
**The Shape Tier Rule.** Three radius values exist: 12px for containers, 6px for controls, full-pill for semantic labels and badges. No other radius is used.

## Components

### Buttons

Lean and purposeful. Primary buttons carry the brand weight; ghost buttons recede entirely.

- **Shape:** 6px rounded corners
- **Primary:** Background Gaia Crimson (#731514), white text, `px-3 py-1.5` inline / `w-full px-4 py-2.5` mobile full-width. Hover: Gaia Crimson Deep (#5e1212). Focus-visible: 2px outline, 2px offset, Gaia Crimson.
- **Ghost / Secondary:** White background, `border border-gray-200`, gray-600 text. Hover: `bg-gray-50 border-gray-300`. Focus-visible: same 2px Crimson outline.
- **Icon treatment:** 13×13px SVG chevron-right, `stroke-width: 2`, inline trailing the label text.
- **CD / RS rows:** Primary button ("Ver soporte"). All other states: Ghost button ("Ver estado").

### State Chips

Six-state semantic pill labels. The color is the message.

- **Shape:** `rounded-full`, `px-2.5 py-0.5`, `text-xs font-semibold`
- **CD:** Caution Amber bg (#FF9311) + gray-900 text / label "Creado"
- **PRS:** Caution Honey bg (#FFB051) + gray-900 text / label "En revisión"
- **AS:** Approval Forest bg (#218B22) + white text / label "Aprobado Sup."
- **AP:** Approval Forest bg (#218B22) + white text / label "Aprobado"
- **RS:** Danger Scarlet bg (#930E10) + white text / label "Rechazado Sup."
- **RO:** Neutral Slate bg (#6B7280) + white text / label "Rechazado Ord."

### Tab Navigation (Filter Rail)

Horizontal scrollable rail with count badges. Filters the contract list by payment state.

- **Rail:** Flush tabs, no gap, `overflow-x-auto` with hidden scrollbar (`.tab-rail`)
- **Active:** `border-b-2 border-[#731514] text-[#731514] font-semibold`
- **Inactive:** `border-b-2 border-transparent text-gray-500`, hover: `text-gray-900 border-gray-300`
- **Count badge:** `rounded-full px-1.5 py-px text-xs font-bold`. Active: `bg-[#f3e8e8] text-[#731514]`. Inactive: `bg-gray-100 text-gray-500`.

### Data Table (Desktop, ≥768px)

Primary data surface at desktop widths.

- **Wrapper:** `rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden`
- **Header row:** `bg-gray-50`, `text-xs font-semibold uppercase tracking-wider text-gray-500`
- **Body rows:** `divide-y divide-gray-100`, hover: `bg-gray-50 transition-colors duration-100`
- **Columns:** N° Contrato · Objeto · Tipo (≥lg) · Vigencia (≥lg) · Mes · Estado · Acción
- **Footer bar:** `bg-gray-50 border-t border-gray-100 text-xs text-gray-400` — shows result count and active filter label

### Contract Card (Mobile, <768px)

Stacked labeled card replaces the table below `md`.

- **Wrapper:** `rounded-xl border border-gray-200 bg-white shadow-sm`
- **Padding:** 16px all-around
- **Structure:** Contract number (bold left) + state chip (top-right) → object text (3-line clamp) → 3-col detail grid (Tipo / Vigencia / Mes) → full-width action button

### Skeleton Loader

Pulse-animated placeholder matching the table structure shown during the async data fetch.

- **Pattern:** Same wrapper shape as the table; `animate-pulse` bars in gray-200 (header) and gray-100 (rows)
- **Duration:** Simulated 1.1s timeout before data resolves

## Do's and Don'ts

### Do:
- **Do** use Gaia Crimson (#731514) exclusively on primary action buttons and the active tab bottom-border indicator.
- **Do** pair Caution Amber (#FF9311) and Caution Honey (#FFB051) chip backgrounds with `text-gray-900` to meet WCAG AA contrast.
- **Do** sort rows so actionable states (CD, RS) appear first, non-actionable last (priority order: CD=1, RS=2, PRS=3, AS=4, AP=5, RO=6).
- **Do** use `rounded-xl` (12px) for containers, `rounded-md` (6px) for buttons, `rounded-full` for chips and badges.
- **Do** apply `shadow-sm` only to: mobile card wrappers, the desktop table wrapper, and the sticky tab rail.
- **Do** apply `tabular-nums` (`font-variant-numeric: tabular-nums`) to contract numbers and year values.
- **Do** show a skeleton loader (not a spinner) during async data fetch to maintain layout stability.

### Don't:
- **Don't** use Gaia Crimson (#731514) as a chip background, card stripe, section border, or heading color.
- **Don't** introduce Angular Material or Bootstrap components. All UI is plain HTML + Tailwind.
- **Don't** use the URANO blue (#03678F) palette — that belongs to SGA-subsystem micro-frontends.
- **Don't** add shadows beyond `shadow-sm` or introduce `backdrop-filter` blur effects.
- **Don't** implement the outer shell (header, lateral menu, footer) — Core MF owns those.
- **Don't** use gradient fills, colored left-border card decorations, or glass-morphism effects.
- **Don't** place the active-filter state label (chipLabel) inside the primary action button text.
