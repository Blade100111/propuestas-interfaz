import { Component, computed, input } from '@angular/core';

/**
 * EmptyStateComponent — tarjeta de estado vacío con icono, título y descripción.
 *
 * Uso:
 *   <app-empty-state
 *     paddingClass="py-20"
 *     title="Sin contratos activos"
 *     description="No tiene contratos asociados a su número de documento."
 *   >
 *     <!-- Proyectar el SVG del icono directamente -->
 *     <svg class="h-8 w-8 text-gray-400" ...></svg>
 *   </app-empty-state>
 *
 * paddingClass es opcional y por defecto es "py-16".  Los valores que se pasan
 * desde el padre ("py-16", "py-20") aparecen como literales en los call sites,
 * así el scanner de Tailwind los incluye en el CSS compilado.
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  host: { class: 'block' },
  template: `
    <div [class]="outerCls()">
      <div class="rounded-full bg-gray-100 p-4">
        <ng-content />
      </div>
      <h2 class="mt-4 text-sm font-semibold text-gray-900">{{ title() }}</h2>
      <p class="mt-1 text-sm text-gray-500">{{ description() }}</p>
    </div>
  `,
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  /** Clase(s) Tailwind de padding vertical para el contenedor exterior. */
  readonly paddingClass = input<string>('py-16');

  protected readonly outerCls = computed(
    () =>
      `flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white text-center shadow-sm ${this.paddingClass()}`,
  );
}
