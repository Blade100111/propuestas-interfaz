import { Component, input, output } from '@angular/core';

/**
 * SearchInputComponent — campo de búsqueda con icono de lupa.
 *
 * Uso:
 *   <app-search-input
 *     placeholder="Buscar por número de contrato"
 *     ariaLabel="Buscar contratos"
 *     [value]="busqueda()"
 *     (valueChange)="busqueda.set($event)"
 *   />
 *
 * Emite el valor en cada evento (input) sin debounce; el componente
 * padre decide si aplicar debounce o actualizar directamente su signal.
 */
@Component({
  selector: 'app-search-input',
  standalone: true,
  host: { class: 'block' },
  template: `
    <div class="relative max-w-sm">
      <div
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"
        aria-hidden="true"
      >
        <svg class="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path
            fill-rule="evenodd"
            d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <input
        type="search"
        [class]="inputCls"
        [placeholder]="placeholder()"
        [value]="value()"
        [attr.aria-label]="ariaLabel()"
        (input)="valueChange.emit($any($event.target).value)"
      />
    </div>
  `,
})
export class SearchInputComponent {
  readonly placeholder = input<string>('Buscar...');
  readonly value = input<string>('');
  readonly ariaLabel = input<string>('Buscar');
  readonly valueChange = output<string>();

  // Literal para que el scanner de Tailwind incluya todas las clases en el bundle.
  readonly inputCls =
    'block w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors duration-150 focus:border-[#731514] focus:outline-none focus:ring-2 focus:ring-[#731514]/20';
}
