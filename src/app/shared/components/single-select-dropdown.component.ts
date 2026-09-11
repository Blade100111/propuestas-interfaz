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
 * SingleSelectDropdownComponent — selector de una sola opción con panel custom.
 *
 * Uso:
 *   <app-single-select
 *     [options]="myOptions"
 *     [value]="selectedValue()"
 *     placeholder="Seleccionar..."
 *     (valueChange)="selectedValue.set($event)"
 *   />
 *
 * - Mismo lenguaje visual que app-multi-select (bordes, colores, foco, radios).
 * - Sin checkboxes: clic en opción → selecciona y cierra el panel.
 * - La opción activa muestra un checkmark crimson a la derecha.
 * - Cierra al hacer clic fuera del componente.
 */
export interface SingleSelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-single-select',
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
        >
          <div class="max-h-52 overflow-y-auto py-1">
            @if (options().length === 0) {
              <p class="px-3 py-2 text-sm text-gray-400">Sin opciones disponibles.</p>
            }
            @for (opt of options(); track opt.value) {
              <button
                type="button"
                role="option"
                [attr.aria-selected]="value() === opt.value"
                [class]="value() === opt.value ? optionSelectedCls : optionBaseCls"
                (click)="selectOption(opt.value)"
              >
                <span class="truncate">{{ opt.label }}</span>
                @if (value() === opt.value) {
                  <svg class="ml-auto h-3.5 w-3.5 shrink-0 text-[#731514]"
                       viewBox="0 0 16 16" fill="none" stroke="currentColor"
                       stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                       aria-hidden="true">
                    <path d="M2 8l4 4 8-8"/>
                  </svg>
                }
              </button>
            }
          </div>
        </div>
      }

    </div>
  `,
})
export class SingleSelectDropdownComponent {
  private readonly el = inject(ElementRef);

  readonly options = input<SingleSelectOption[]>([]);
  readonly value = input('');
  readonly placeholder = input('Seleccionar...');
  readonly valueChange = output<string>();

  readonly abierto = signal(false);

  // ── Computed ───────────────────────────────────────────────────────────────

  readonly triggerLabel = computed(() => {
    const val = this.value();
    if (!val) return this.placeholder();
    return this.options().find((o) => o.value === val)?.label ?? val;
  });

  readonly triggerCls = computed(() =>
    this.abierto() ? this.triggerOpenCls : this.triggerClosedCls,
  );

  readonly triggerTextCls = computed(() =>
    !this.value() ? this.triggerTextEmptyCls : this.triggerTextFilledCls,
  );

  // ── Literal TW class strings ───────────────────────────────────────────────

  readonly triggerClosedCls =
    'flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm transition-colors duration-150 hover:border-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly triggerOpenCls =
    'flex w-full items-center justify-between gap-2 rounded-lg border border-[#731514] bg-white px-3 py-2 text-sm shadow-sm ring-2 ring-[#731514]/20 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly triggerTextEmptyCls = 'truncate text-gray-400';
  readonly triggerTextFilledCls = 'truncate text-gray-900';

  readonly optionBaseCls =
    'flex w-full cursor-pointer select-none items-center gap-2.5 px-3 py-2 text-sm text-gray-700 transition-colors duration-100 hover:bg-gray-50';

  readonly optionSelectedCls =
    'flex w-full cursor-pointer select-none items-center gap-2.5 px-3 py-2 text-sm font-semibold text-[#731514] bg-[#731514]/5 transition-colors duration-100 hover:bg-[#731514]/10';

  // ── Methods ────────────────────────────────────────────────────────────────

  toggle(): void {
    this.abierto.update((v) => !v);
  }

  selectOption(val: string): void {
    this.valueChange.emit(val);
    this.abierto.set(false);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!(this.el.nativeElement as HTMLElement).contains(event.target as Node)) {
      this.abierto.set(false);
    }
  }
}
