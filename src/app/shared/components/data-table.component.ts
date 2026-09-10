import {
  Component,
  ContentChild,
  Directive,
  TemplateRef,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

// ── Column definition ────────────────────────────────────────────────────────

/**
 * Definición de columna para DataTableComponent.
 *
 * skHdr / skCell son las clases completas de los divs del skeleton loader.
 * Se definen como literales en el componente consumidor para que el scanner
 * de Tailwind los incluya en el bundle (las clases dinámicas del template
 * no se ven; las literales del .ts sí).
 */
export interface TableColumn {
  /** Identificador de columna; se usa como clave de sort. */
  key: string;
  /** Texto del encabezado. */
  header: string;
  /** Si true, el encabezado se renderiza como botón de ordenación. */
  sortable?: boolean;
  /** Clase(s) Tailwind completa(s) para el elemento <th>. */
  thClass: string;
  /** Clase(s) completa(s) para el div del skeleton del encabezado. */
  skHdr: string;
  /** Clase(s) completa(s) para el div del skeleton de cada fila. */
  skCell: string;
}

// ── Content-child directives ─────────────────────────────────────────────────

/**
 * Directiva de fila — proyecta las <td> del cuerpo de la tabla.
 *
 * Uso:
 *   <ng-template appTableRow let-item>
 *     <td class="...">{{ item.campo }}</td>
 *     ...
 *   </ng-template>
 */
@Directive({ selector: '[appTableRow]', standalone: true })
export class TableRowDirective {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(public readonly tpl: TemplateRef<{ $implicit: any }>) {}
}

/**
 * Directiva de tarjeta móvil — proyecta el <li> de la vista de tarjetas.
 *
 * Uso:
 *   <ng-template appTableCard let-item>
 *     <li class="overflow-hidden rounded-xl border ...">
 *       ...
 *     </li>
 *   </ng-template>
 */
@Directive({ selector: '[appTableCard]', standalone: true })
export class TableCardDirective {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(public readonly tpl: TemplateRef<{ $implicit: any }>) {}
}

// ── DataTableComponent ───────────────────────────────────────────────────────

/**
 * DataTableComponent — shell genérico de tabla con:
 *   - Skeleton loader (todos los viewports)
 *   - Vista de tabla desktop (≥md): thead sortable, tbody con hover, footer con conteo
 *   - Vista de tarjetas mobile (<md): lista con footer de conteo
 *
 * Las celdas del cuerpo y las tarjetas se proyectan via ng-template con
 * TableRowDirective / TableCardDirective respectivamente.
 *
 * Uso básico:
 *   <app-data-table
 *     [columns]="cols"
 *     [rows]="filas()"
 *     [loading]="cargando()"
 *     [sortColumn]="sortCol()"
 *     [sortDirection]="sortDir()"
 *     [footerText]="footerTxt()"
 *     (sortChange)="sortBy($event)"
 *   >
 *     <ng-template appTableRow let-item>
 *       <td>{{ item.campo }}</td>
 *     </ng-template>
 *     <ng-template appTableCard let-item>
 *       <li class="...">...</li>
 *     </ng-template>
 *   </app-data-table>
 */
@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <!-- ── Skeleton (todos los viewports mientras loading=true) ── -->
    @if (loading()) {
      <div
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        aria-busy="true"
        [attr.aria-label]="'Cargando ' + ariaLabel()"
      >
        <!-- Skeleton header row -->
        <div class="flex items-center gap-4 border-b border-gray-100 bg-gray-50 px-5 py-3">
          @for (col of columns(); track col.key) {
            <div [class]="col.skHdr"></div>
          }
        </div>
        <!-- Skeleton body rows -->
        @for (i of skRows(); track i) {
          <div class="flex items-center gap-4 border-b border-gray-100 px-5 py-4 last:border-0">
            @for (col of columns(); track col.key) {
              <div [class]="col.skCell"></div>
            }
          </div>
        }
      </div>
    }

    @else {
      <!-- ── Desktop table (≥md) ── -->
      <div class="hidden md:block">
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table
            class="min-w-full table-fixed divide-y divide-gray-200"
            [attr.aria-label]="ariaLabel()"
          >
            <thead class="bg-gray-50">
              <tr>
                @for (col of columns(); track col.key) {
                  <th scope="col" [class]="col.thClass">
                    @if (col.sortable) {
                      <button
                        [class]="sortBtnCls"
                        (click)="sortChange.emit(col.key)"
                        type="button"
                      >
                        {{ col.header }}
                        <span aria-hidden="true">{{ sortIcon(col.key) }}</span>
                      </button>
                    } @else {
                      {{ col.header }}
                    }
                  </th>
                }
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 bg-white">
              @for (row of pagedRows(); track $index) {
                <tr [class]="rowCls(row)">
                  @if (rowTpl) {
                    <ng-container
                      [ngTemplateOutlet]="rowTpl.tpl"
                      [ngTemplateOutletContext]="{ $implicit: row }"
                    />
                  }
                </tr>
              }
            </tbody>
          </table>

          <!-- Desktop footer: text + pagination -->
          <div class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-gray-100 bg-gray-50 px-5 py-2.5">
            <p class="text-xs text-gray-400">{{ footerText() }}</p>
            <div class="flex items-center gap-4">
              <!-- Page size selector -->
              <div class="flex items-center gap-1.5">
                <span class="text-xs text-gray-400">Por p\u00e1gina:</span>
                <select [class]="pageSizeSelectCls" (change)="onPageSizeChange($event)">
                  <option value="10" [selected]="selectedPageSize() === 10">10</option>
                  <option value="25" [selected]="selectedPageSize() === 25">25</option>
                  <option value="50" [selected]="selectedPageSize() === 50">50</option>
                  <option value="100" [selected]="selectedPageSize() === 100">100</option>
                </select>
              </div>
              <!-- Page navigation -->
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  [class]="pageNavBtnCls"
                  [disabled]="currentPage() <= 1"
                  (click)="prevPage()"
                  aria-label="P\u00e1gina anterior"
                >
                  &#8592;
                </button>
                <span class="min-w-[4.5rem] text-center text-xs text-gray-500">
                  {{ currentPage() }} / {{ totalPages() }}
                </span>
                <button
                  type="button"
                  [class]="pageNavBtnCls"
                  [disabled]="currentPage() >= totalPages()"
                  (click)="nextPage()"
                  aria-label="P\u00e1gina siguiente"
                >
                  &#8594;
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── Mobile cards (<md) ── -->
      <div class="md:hidden">
        <ul class="space-y-3" role="list" [attr.aria-label]="ariaLabel()">
          @for (row of pagedRows(); track $index) {
            @if (cardTpl) {
              <ng-container
                [ngTemplateOutlet]="cardTpl.tpl"
                [ngTemplateOutletContext]="{ $implicit: row }"
              />
            }
          }
        </ul>
        <!-- Mobile footer: text + pagination -->
        <div class="mt-4 flex flex-col items-center gap-3">
          <p class="text-xs text-gray-400">{{ mobileFtr() }}</p>
          <div class="flex items-center gap-3">
            <button
              type="button"
              [class]="pageNavBtnCls"
              [disabled]="currentPage() <= 1"
              (click)="prevPage()"
              aria-label="P\u00e1gina anterior"
            >
              &#8592; Anterior
            </button>
            <span class="text-xs text-gray-500">{{ currentPage() }} / {{ totalPages() }}</span>
            <button
              type="button"
              [class]="pageNavBtnCls"
              [disabled]="currentPage() >= totalPages()"
              (click)="nextPage()"
              aria-label="P\u00e1gina siguiente"
            >
              Siguiente &#8594;
            </button>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">Por p\u00e1gina:</span>
            <select [class]="pageSizeSelectCls" (change)="onPageSizeChange($event)">
              <option value="10" [selected]="selectedPageSize() === 10">10</option>
              <option value="25" [selected]="selectedPageSize() === 25">25</option>
              <option value="50" [selected]="selectedPageSize() === 50">50</option>
              <option value="100" [selected]="selectedPageSize() === 100">100</option>
            </select>
          </div>
        </div>
      </div>
    }
  `,
})
export class DataTableComponent {
  readonly columns = input.required<TableColumn[]>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly rows = input.required<any[]>();
  readonly loading = input<boolean>(false);
  readonly skeletonRows = input<number>(5);
  readonly ariaLabel = input<string>('');
  readonly sortColumn = input<string | null>(null);
  readonly sortDirection = input<'asc' | 'desc'>('asc');
  /** Texto del footer en vista desktop. */
  readonly footerText = input<string>('');
  /**
   * Texto del footer en vista mobile.
   * Si se omite, se usa el mismo valor que footerText.
   */
  readonly mobileFooterText = input<string>('');
  /**
   * Función que devuelve la clase de la fila <tr> dado el item.
   * Si se omite, se aplica el hover crimson estándar.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly rowClassFn = input<((row: any) => string) | null>(null);
  readonly sortChange = output<string>();

  @ContentChild(TableRowDirective) rowTpl?: TableRowDirective;
  @ContentChild(TableCardDirective) cardTpl?: TableCardDirective;

  // ── Pagination state ──────────────────────────────────────────────────────
  readonly currentPage = signal(1);
  readonly selectedPageSize = signal(10);

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.rows().length / this.selectedPageSize())),
  );

  readonly pagedRows = computed(() => {
    const start = (this.currentPage() - 1) * this.selectedPageSize();
    return this.rows().slice(start, start + this.selectedPageSize());
  });

  readonly mobileFtr = computed(() => this.mobileFooterText() || this.footerText());

  // Literales para el scanner de Tailwind.
  readonly defaultRowCls = 'transition-colors duration-100 hover:bg-[#731514]/5';
  readonly sortBtnCls =
    'flex w-full items-center justify-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors duration-150 focus-visible:outline-none';
  readonly pageSizeSelectCls =
    'rounded border border-gray-200 bg-white px-2 py-0.5 text-xs text-gray-600 shadow-sm transition-colors duration-150 focus:border-[#731514] focus:outline-none focus:ring-1 focus:ring-[#731514]/30';
  readonly pageNavBtnCls =
    'rounded px-2 py-1 text-xs text-gray-500 transition-colors duration-150 hover:bg-gray-200 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#731514]';

  readonly skRows = computed(() => Array.from({ length: this.skeletonRows() }, (_, i) => i));

  constructor() {
    // Reset to page 1 whenever the row set changes (filter or sort by parent).
    effect(() => {
      this.rows();
      untracked(() => this.currentPage.set(1));
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rowCls(row: any): string {
    const fn = this.rowClassFn();
    return fn ? fn(row) : this.defaultRowCls;
  }

  sortIcon(col: string): string {
    if (this.sortColumn() !== col) return '↕';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  prevPage(): void {
    this.currentPage.update((p) => Math.max(1, p - 1));
  }

  nextPage(): void {
    this.currentPage.update((p) => Math.min(this.totalPages(), p + 1));
  }

  onPageSizeChange(event: Event): void {
    const size = parseInt((event.target as HTMLSelectElement).value, 10);
    this.selectedPageSize.set(size);
    this.currentPage.set(1);
  }
}
