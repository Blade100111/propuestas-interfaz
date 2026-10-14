import {
  Component,
  ElementRef,
  HostListener,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

/**
 * ColumnFilterComponent — botón embudo + dropdown multi-select embebido en cabeceras de tabla.
 *
 * Uso:
 *   <app-column-filter
 *     [options]="[{value:'CD',label:'CD'},{value:'PRS',label:'PRS'}]"
 *     [value]="activeFilters"
 *     (valueChange)="activeFilters = $event"
 *   />
 *
 * - Vacío ([]) = sin filtro activo (muestra todo).
 * - El ícono se torna crimson cuando hay filtros activos (> 0 pero < total opciones).
 * - Cierra con click fuera del componente.
 * - El click sobre el trigger hace stopPropagation para que el document:click no
 *   cierre el dropdown justo después de abrirlo.
 */
@Component({
  selector: 'app-column-filter',
  standalone: true,
  host: { class: 'relative inline-flex' },
  template: `
    <button
      type="button"
      [class]="isActive() ? activeTriggerCls : triggerCls"
      (click)="toggleOpen($event)"
      aria-label="Filtrar"
      [attr.aria-expanded]="open()"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
           class="h-3 w-3" aria-hidden="true">
        <path fill-rule="evenodd"
          d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z"
          clip-rule="evenodd"
        />
      </svg>
    </button>

    @if (open()) {
      <div
        [class]="dropdownCls"
        [style.top.px]="dropdownPos().top"
        [style.left.px]="dropdownPos().left"
        role="listbox"
        aria-multiselectable="true"
      >
        <div class="max-h-48 overflow-y-auto py-1">
          @for (opt of options(); track opt.value) {
            <label
              class="flex cursor-pointer select-none items-center gap-2 px-3 py-1.5 text-xs hover:bg-gray-50"
            >
              <input
                type="checkbox"
                class="h-3.5 w-3.5 cursor-pointer rounded border-gray-300 accent-[#731514]"
                [checked]="isChecked(opt.value)"
                (change)="toggleOption(opt.value)"
              />
              <span class="whitespace-nowrap text-gray-700">{{ opt.label }}</span>
            </label>
          }
        </div>
        @if (isActive()) {
          <div class="border-t border-gray-100 px-3 py-1.5">
            <button
              type="button"
              (click)="clearAll()"
              class="text-xs text-[#731514] hover:underline focus:outline-none"
            >
              Limpiar
            </button>
          </div>
        }
      </div>
    }
  `,
})
export class ColumnFilterComponent {
  readonly options = input.required<{ value: string; label: string }[]>();
  readonly value = input<string[]>([]);
  readonly valueChange = output<string[]>();

  readonly open = signal(false);
  readonly dropdownPos = signal({ top: 0, left: 0 });

  /** Hay filtro activo cuando hay al menos una opción seleccionada, pero no todas. */
  readonly isActive = computed(() => {
    const v = this.value();
    return v.length > 0 && v.length < this.options().length;
  });

  // ── Literal class strings (TW scanner) ───────────────────────────────────
  readonly triggerCls =
    'flex items-center justify-center rounded p-0.5 text-gray-400 transition-colors duration-150 hover:bg-gray-100 hover:text-gray-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#731514]';
  readonly activeTriggerCls =
    'flex items-center justify-center rounded p-0.5 text-[#731514] transition-colors duration-150 hover:bg-[#731514]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#731514]';
  readonly dropdownCls =
    'fixed z-50 min-w-max -translate-x-1/2 rounded-lg border border-gray-200 bg-white shadow-lg';

  constructor(private readonly el: ElementRef) {}

  /** Abre/cierra el dropdown. Calcula posición fixed para escapar del overflow-hidden del padre. */
  toggleOpen(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.open()) {
      const btn = event.currentTarget as HTMLElement;
      const rect = btn.getBoundingClientRect();
      this.dropdownPos.set({
        top: rect.bottom + 4,
        left: rect.left + rect.width / 2,
      });
    }
    this.open.update((v) => !v);
  }

  toggleOption(val: string): void {
    const current = this.value();
    const next = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    this.valueChange.emit(next);
  }

  clearAll(): void {
    this.valueChange.emit([]);
    this.open.set(false);
  }

  isChecked(val: string): boolean {
    return this.value().includes(val);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target as Node)) {
      this.open.set(false);
    }
  }
}
