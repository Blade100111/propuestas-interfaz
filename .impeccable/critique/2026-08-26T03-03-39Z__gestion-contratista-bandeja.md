---
target: gestion-contratista/bandeja
total_score: 17
max_score: 32
na_heuristics: 9,10
p0_count: 1
p1_count: 2
timestamp: 2026-08-26T03-03-39Z
slug: gestion-contratista-bandeja
---
## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 2 | Skeleton loader excellent; no error state; month appears static |
| 2 | Match System / Real World | 2 | Tab rail shows raw enum codes (CD, PRS, RS…); chips translate, tabs don't |
| 3 | User Control and Freedom | 2 | Tab filter + empty-state escape; no sort, no search, no month navigation |
| 4 | Consistency and Standards | 3 | Internal system coherent; "Ver soporte"/"Ver estado" both navigate the same route |
| 5 | Error Prevention | 1 | No error state, no API failure path, no deadline signal |
| 6 | Recognition Rather Than Recall | 2 | Chips translate states; tabs require recall of "RS"; repeated button labels fail screen readers |
| 7 | Flexibility and Efficiency | 2 | No keyboard shortcuts, no column sort, no bulk actions |
| 8 | Aesthetic and Minimalist Design | 3 | Clean; non-functional month widget is only false affordance violation |
| 9 | Help Users Recover from Errors | n/a | Static prototype list view; no error states designed |
| 10 | Help and Documentation | n/a | Internal tool prototype |
| **Total** | | **17 / 32** | **Acceptable (53%)** |

## Design Specificity Verdict

Not a Bootstrap 3 table with different colors — but not far enough removed. Structurally modern (responsive card pivot, skeleton loader, semantic chip system, three-tier radius). Semantically dated: tab labels are database enum values, header communicates identity not urgency, table-fills-page IA is unchanged from 2018. Reads as a technically correct 2022 Tailwind UI admin pattern, not an authored solution for this specific user moment. One Assessment A finding corrected: `.tabular` is a valid custom CSS class in `styles.css`; not a no-op. Detector: DEGRADED mode (regex-only), 0 findings (undercount — computed contrast checks did not execute).

## Priority Issues

- [P0] Tab rail labels are database enum codes (CD/PRS/RS/RO), not human language
- [P1] Header communicates identity not urgency; no actionable summary for contracts needing attention
- [P1] Rejection states (RS, RO) receive no contextual acknowledgment in row or card
- [P2] Non-functional month selector (calendar icon + "2025") is false affordance — remove it
- [P2] Repeated identical action button labels ("Ver soporte"/"Ver estado") fail accessibility and create action noise on AP rows

## Persona Red Flags

- Carmen (Contratista de planta): tab codes hostile; no deadline anywhere; rejection row gives no context
- Jordan (First-Timer): tab codes are a landmine on first visit; success depends on reading chip label first
- Sam (Accessibility): tabs announced as raw codes; repeated button labels unqualified; no aria-live
- Casey (Mobile): tab rail clips RS/RO off-screen with no scroll indicator on 375px

## Minor Observations

- [class.bg-white]=!esAccionable() binding is dead code; hover applies to all rows
- cargando timeout hardcoded at 1.1s; needs removal comment for production
- Empty state copy is cold; could be warmer
- sr-only table caption leaks machine language ("filtro: todos")
- No aria-live on filtered list

## Questions to Consider

1. Does this surface need a table? 2-6 contracts → task-completion view may serve better than data grid
2. Do 7 filter tabs serve 7 distinct user goals, or would 2 ("Requieren acción" + "Todos") suffice?
3. Is the deadline display being excluded on technical grounds or user welfare grounds?
