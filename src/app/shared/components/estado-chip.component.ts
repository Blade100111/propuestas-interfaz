import { Component, computed, input } from '@angular/core';
import { ESTADO_CONFIG } from '../estado.constants';

/**
 * EstadoChipComponent — pill de estado del pago_mensual.
 *
 * Uso:
 *   <app-estado-chip [estado]="sol.estado" />
 *
 * host: contents hace el elemento anfitrión invisible al layout, de modo que
 * el <span> interior participa directamente en el contexto flex/grid del padre,
 * igual a como lo hacía el <span> inline original.
 */
@Component({
  selector: 'app-estado-chip',
  standalone: true,
  host: { class: 'contents' },
  template: `
    <span [class]="cls()" [attr.aria-label]="'Estado: ' + lbl()">{{ lbl() }}</span>
  `,
})
export class EstadoChipComponent {
  readonly estado = input.required<string>();

  protected readonly lbl = computed(
    () => ESTADO_CONFIG[this.estado()]?.label ?? this.estado(),
  );

  protected readonly cls = computed(() => {
    const color = ESTADO_CONFIG[this.estado()]?.chipClass ?? 'bg-gray-300 text-gray-800';
    // Base layout classes are literal here so the Tailwind scanner picks them up.
    return `${color} inline-flex items-center justify-center min-w-[7.5rem] rounded-full px-2.5 py-0.5 text-xs font-semibold`;
  });
}
