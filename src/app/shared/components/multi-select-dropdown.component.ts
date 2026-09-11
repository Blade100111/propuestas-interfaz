import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

/**
 * MultiSelectDropdownComponent — selector múltiple compacto con checkboxes.
 *
 * Uso:
 *   <app-multi-select
 *     [options]="myOptions"
 *     [value]="selectedValues()"
 *     placeholder="Seleccionar..."
 *     (valueChange)="selectedValues.set($event)"
 *   />
 *
 * - Colapsado por defecto; se despliega al hacer clic en el trigger.
 * - Muestra el label del elemento si solo hay uno seleccionado.
 * - Muestra "N seleccionados" cuando hay más de uno.
 * - Cierra al hacer clic fuera del componente.
 * - Checkboxes con color institucional (accent-[#731514]).
 */
export interface MultiSelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-multi-select',
  standalone: true,
  template: `
    <div class="relative">

      <!-- Trigger -->
      <button
        type="button"
        [class]="triggerCls()"
        (click)="toggle()"
        [attr.aria-expanded]="abierto()"
        aria-haspopup="listbox"
      >
        <span [class]="triggerTextCls()">{{ triggerLabel() }}</span>
        <svg
          class="h-4 w-4 shrink-0 text-gray-400 transition-transform duration-150"
          [style.transform]="abierto() ? 'rotate(180deg)' : ''"
          viewBox="0 0 16 16" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M4 6l4 4 4-4"/>
        </svg>
      </button>

      <!-- Dropdown panel -->
      @if (abierto()) {
        <div
          class="absolute left-0 top-full z-30 mt-1 min-w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
          role="listbox"
          aria-multiselectable="true"
        >
          <div class="max-h-52 overflow-y-auto py-1">
            @if (options().length === 0) {
              <p class="px-3 py-2 text-sm text-gray-400">Sin opciones disponibles.</p>
            }
            @for (opt of options(); track opt.value) {
              <label [class]="optionCls">
                <input
                  type="checkbox"
                  [class]="checkboxCls"
                  [value]="opt.value"
                  [checked]="value().includes(opt.value)"
                  (change)="toggleOption(opt.value)"
                />
                <span class="truncate">{{ opt.label }}</span>
              </label>
            }
          </div>
        </div>
      }

    </div>
  `,
})
export class MultiSelectDropdownComponent {
  private readonly el = inject(ElementRef);

  readonly options = input<MultiSelectOption[]>([]);
  readonly value = input<string[]>([]);
  readonly placeholder = input('Seleccionar...');
  readonly valueChange = output<string[]>();

  readonly abierto = signal(false);

  // ── Computed ───────────────────────────────────────────────────────────────

  readonly triggerLabel = computed(() => {
    const sel = this.value();
    if (sel.length === 0) return this.placeholder();
    if (sel.length === 1) {
      return this.options().find((o) => o.value === sel[0])?.label ?? sel[0];
    }
    return `${sel.length} seleccionados`;
  });

  readonly triggerCls = computed(() =>
    this.abierto() ? this.triggerOpenCls : this.triggerClosedCls,
  );

  readonly triggerTextCls = computed(() =>
    this.value().length === 0 ? this.triggerTextEmptyCls : this.triggerTextFilledCls,
  );

  // ── Literal TW class strings ───────────────────────────────────────────────

  readonly triggerClosedCls =
    'flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-150 hover:border-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly triggerOpenCls =
    'flex w-full items-center justify-between gap-2 rounded-lg border border-[#731514] bg-white px-3 py-2 text-sm shadow-sm ring-2 ring-[#731514]/20 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly triggerTextEmptyCls = 'truncate text-gray-400';
  readonly triggerTextFilledCls = 'truncate text-gray-900';

  readonly checkboxCls =
    'h-4 w-4 shrink-0 cursor-pointer rounded border-gray-300 accent-[#731514]';

  readonly optionCls =
    'flex w-full cursor-pointer select-none items-center gap-2.5 px-3 py-2 text-sm text-gray-700 transition-colors duration-100 hover:bg-gray-50';

  // ── Methods ────────────────────────────────────────────────────────────────

  toggle(): void {
    this.abierto.update((v) => !v);
  }

  toggleOption(val: string): void {
    const current = this.value();
    const next = current.includes(val)
      ? current.filter((v) => v !== val)
      : [...current, val];
    this.valueChange.emit(next);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!(this.el.nativeElement as HTMLElement).contains(event.target as Node)) {
      this.abierto.set(false);
    }
  }
}
