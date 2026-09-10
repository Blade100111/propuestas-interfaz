import { Component, computed, inject, signal } from '@angular/core';
import { ConfirmDialogService } from '../services/confirm-dialog.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [],
  host: { class: 'contents' },
  template: `
    @if (svc.visible()) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 z-50 bg-black/40"
        (click)="cancel()"
        aria-hidden="true"
      ></div>

      <!-- Dialog -->
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'confirm-title'"
        (keydown.escape)="cancel()"
        tabindex="-1"
      >
        <div
          class="relative w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          (click)="$event.stopPropagation()"
        >
          <h2 id="confirm-title" class="text-lg font-bold text-gray-900">
            {{ svc.options()?.title }}
          </h2>
          <p class="mt-2 text-sm leading-relaxed text-gray-600">
            {{ svc.options()?.message }}
          </p>

          @if (svc.options()?.requireObservation) {
            <div class="mt-4">
              <label
                for="confirm-obs"
                class="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400"
              >
                Observación (obligatoria)
              </label>
              <textarea
                id="confirm-obs"
                rows="3"
                [class]="textareaCls"
                [placeholder]="svc.options()?.observationPlaceholder ?? 'Escribe una observación...'"
                [value]="observation()"
                (input)="observation.set($any($event.target).value)"
              ></textarea>
              @if (observation().length > 0 && observation().length < 10) {
                <p class="mt-1 text-xs text-red-500">Mínimo 10 caracteres.</p>
              }
            </div>
          }

          <div class="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            @if (svc.options()?.variant === 'info') {
              <!-- Variante informativa: solo botón de cierre -->
              <button type="button" [class]="cancelBtnCls" (click)="cancel()">
                {{ svc.options()?.cancelLabel ?? 'Cerrar' }}
              </button>
            } @else {
              <button type="button" [class]="cancelBtnCls" (click)="cancel()">
                {{ svc.options()?.cancelLabel ?? 'Cancelar' }}
              </button>
              <button
                type="button"
                [class]="confirmBtnCls()"
                [disabled]="!canConfirm()"
                (click)="confirm()"
              >
                {{ svc.options()?.confirmLabel ?? 'Confirmar' }}
              </button>
            }
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly svc = inject(ConfirmDialogService);
  readonly observation = signal('');

  readonly canConfirm = computed(() => {
    if (this.svc.options()?.requireObservation) {
      return this.observation().trim().length >= 10;
    }
    return true;
  });

  readonly confirmBtnCls = computed(() =>
    this.svc.options()?.variant === 'danger' ? this.confirmDangerCls : this.confirmDefaultCls,
  );

  readonly cancelBtnCls =
    'inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:border-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly confirmDefaultCls =
    'inline-flex items-center justify-center gap-2 rounded-md bg-[#731514] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#5e1212] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly confirmDangerCls =
    'inline-flex items-center justify-center gap-2 rounded-md bg-[#930E10] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#7a0c0e] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#930E10]';

  readonly textareaCls =
    'block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm resize-none overflow-y-auto max-h-[12rem] transition-colors duration-150 focus:border-[#731514] focus:outline-none focus:ring-2 focus:ring-[#731514]/30';

  confirm(): void {
    if (!this.canConfirm()) return;
    this.svc._complete({
      confirmed: true,
      observation: this.observation().trim() || undefined,
    });
    this.observation.set('');
  }

  cancel(): void {
    this.svc._complete({ confirmed: false });
    this.observation.set('');
  }
}
