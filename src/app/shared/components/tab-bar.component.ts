import { Component, input, output } from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
  /** Si count > 0 se muestra un badge numérico junto al label. */
  count?: number;
}

/**
 * TabBarComponent — barra de tabs con badge opcional de conteo.
 *
 * Uso:
 *   <app-tab-bar
 *     [tabs]="tabItems()"
 *     [active]="filtroActivo()"
 *     (activeChange)="filtroActivo.set($event)"
 *   />
 *
 * Renderiza el <div class="-mb-px flex"> interior; el <nav> envolvente
 * y su padding/sticky lo pone el componente padre para conservar
 * semántica y posicionamiento específicos de cada pantalla.
 */
@Component({
  selector: 'app-tab-bar',
  standalone: true,
  host: { class: 'block' },
  template: `
    <div class="-mb-px flex" role="tablist">
      @for (tab of tabs(); track tab.id) {
        <button
          [class]="tabCls(tab.id)"
          (click)="activeChange.emit(tab.id)"
          type="button"
          role="tab"
          [attr.aria-selected]="active() === tab.id"
        >
          {{ tab.label }}
          @if (tab.count !== undefined && tab.count > 0) {
            <span
              class="ml-1.5 rounded-full bg-[#731514]/10 px-1.5 py-0.5 text-xs font-semibold text-[#731514]"
            >
              {{ tab.count }}
            </span>
          }
        </button>
      }
    </div>
  `,
})
export class TabBarComponent {
  readonly tabs = input.required<TabItem[]>();
  readonly active = input.required<string>();
  readonly activeChange = output<string>();

  // Literales para el scanner de Tailwind.
  readonly tabActiveCls =
    'border-b-2 border-[#731514] px-3 pb-3 pt-3 text-sm font-semibold text-[#731514] focus-visible:outline-none whitespace-nowrap';
  readonly tabInactiveCls =
    'border-b-2 border-transparent px-3 pb-3 pt-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors duration-150 focus-visible:outline-none whitespace-nowrap';

  tabCls(id: string): string {
    return this.active() === id ? this.tabActiveCls : this.tabInactiveCls;
  }
}
