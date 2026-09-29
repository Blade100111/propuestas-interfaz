import { Component, computed, inject, input, output, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EstadoChipComponent } from '../shared/components/estado-chip.component';
import { crearDocumentoPlaceholderPDF } from '../shared/doc-placeholder-pdf';

export interface HistorialEstadoEntry {
  estado: string;
  responsable: string;
  cargo: string;
  fecha: string;
}

export interface SoporteHistorico {
  id: number;
  nombre: string;
  descripcion: string;
}

export interface CumplidoHistoricoItem {
  pagoMensualId: number;
  numeroCps: string;
  dependencia: string;
  rubro: string;
  documento: string;
  nombreContratista: string;
  numeroContrato: string;
  vigencia: number;
  esOtroSi: boolean;
  mes: number;
  mesNombre: string;
  ano: number;
  estado: string;
  historial: HistorialEstadoEntry[];
  soportes: SoporteHistorico[];
}

@Component({
  selector: 'app-historico-detalle-panel',
  standalone: true,
  imports: [EstadoChipComponent],
  template: `
    @if (abierto()) {
      <div
        class="fixed inset-0 z-40 bg-black/30"
        (click)="cerrar.emit()"
        aria-hidden="true"
      ></div>
    }

    <aside
      class="fixed inset-y-0 right-0 z-40 flex w-full flex-col border-l border-gray-200 bg-white shadow-sm transition-transform duration-300 ease-in-out sm:w-[30rem]"
      [class]="panelTransformCls()"
      [attr.aria-hidden]="!abierto()"
      role="complementary"
      aria-label="Detalle del cumplido"
    >
      @if (item(); as data) {

        <!-- Header -->
        <div class="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div class="min-w-0">
            <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Detalle de solicitud de pago
            </p>
            <h2 class="mt-0.5 text-base font-bold text-gray-900">
              CPS {{ data.numeroCps }} &mdash; {{ data.mesNombre }} {{ data.ano }}
            </h2>
            <p class="mt-0.5 text-xs text-gray-500">
              {{ data.nombreContratista }}
              <span class="mx-1 text-gray-300">&middot;</span>
              C.C. {{ data.documento }}
            </p>
            <div class="mt-1.5">
              <app-estado-chip [estado]="data.estado" />
            </div>
          </div>
          <button
            type="button"
            [class]="closeBtnCls"
            (click)="cerrar.emit()"
            aria-label="Cerrar panel"
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
              <line x1="2" y1="2" x2="10" y2="10"/>
              <line x1="10" y1="2" x2="2" y2="10"/>
            </svg>
          </button>
        </div>

        <!-- Scrollable body -->
        <div class="flex-1 space-y-6 overflow-y-auto px-5 py-5">

          <!-- ── Historico de estados ── -->
          <section aria-labelledby="hist-heading">
            <h3
              id="hist-heading"
              class="mb-4 text-sm font-semibold text-gray-900"
            >
              Historico de estados
            </h3>

            <div>
              @for (entry of data.historial; track $index; let isLast = $last) {
                <div class="relative flex gap-3 pb-6">

                  @if (!isLast) {
                    <span
                      class="absolute left-3 top-5 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    ></span>
                  }

                  <!-- Dot -->
                  <div
                    class="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white ring-2 ring-gray-200"
                  >
                    <div class="h-2.5 w-2.5 rounded-full bg-gray-300"></div>
                  </div>

                  <!-- Card -->
                  <div class="min-w-0 flex-1 rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <div class="flex flex-wrap items-center gap-2">
                      <app-estado-chip [estado]="entry.estado" />
                      <span class="tabular-nums text-xs text-gray-400">{{ entry.fecha }}</span>
                    </div>
                    <p class="mt-1 text-sm font-medium text-gray-900">{{ entry.responsable }}</p>
                    <p class="text-xs text-gray-500">{{ entry.cargo }}</p>
                  </div>

                </div>
              }
            </div>
          </section>

          <!-- ── Documentos de soporte ── -->
          <section aria-labelledby="sop-heading">
            <h3
              id="sop-heading"
              class="mb-3 text-sm font-semibold text-gray-900"
            >
              Documentos de soporte
            </h3>

            @if (data.soportes.length === 0) {
              <p class="text-sm text-gray-400">Sin documentos registrados.</p>
            }

            <div class="space-y-2">
              @for (soporte of data.soportes; track soporte.id) {
                <div class="flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white p-3">
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <svg class="shrink-0 text-gray-400" width="13" height="13"
                           viewBox="0 0 16 16" fill="none" stroke="currentColor"
                           stroke-width="1.5" stroke-linecap="round"
                           stroke-linejoin="round" aria-hidden="true">
                        <path d="M9 2H4a1 1 0 00-1 1v10a1 1 0 001 1h8a1 1 0 001-1V6L9 2z"/>
                        <polyline points="9,2 9,6 13,6"/>
                      </svg>
                      <p class="truncate text-sm font-semibold text-gray-900">{{ soporte.nombre }}</p>
                    </div>
                    <p class="mt-0.5 text-xs text-gray-500">{{ soporte.descripcion }}</p>
                  </div>
                  <button
                    type="button"
                    [class]="verDocBtnCls"
                    [attr.aria-label]="'Ver documento ' + soporte.nombre"
                    (click)="verDocumento(soporte.nombre)"
                  >
                    Ver
                  </button>
                </div>
              }
            </div>
          </section>

        </div>
      }
    </aside>

    <!-- ── Visor de documento (placeholder) ── -->
    @if (visorDocAbierto()) {
      <div
        class="fixed inset-0 z-[70] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Vista previa del documento"
      >
        <div class="flex shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
          <span class="text-sm font-semibold text-gray-900">Vista previa</span>
          <button
            type="button"
            [class]="visorCerrarBtnCls"
            (click)="cerrarVisorDoc()"
            aria-label="Cerrar vista previa"
          >
            Cerrar
          </button>
        </div>
        <iframe
          [src]="visorDocUrl()"
          class="min-h-0 w-full flex-1 border-0 bg-gray-100"
          title="Vista previa del documento"
        ></iframe>
      </div>
    }
  `,
})
export class HistoricoDetallePanelComponent {
  private readonly sanitizer = inject(DomSanitizer);

  readonly item = input<CumplidoHistoricoItem | null>(null);
  readonly cerrar = output<void>();

  readonly abierto = computed(() => this.item() !== null);
  readonly panelTransformCls = computed(() =>
    this.abierto() ? 'translate-x-0' : 'translate-x-full',
  );

  readonly visorDocAbierto = signal(false);
  readonly visorDocUrl = signal<SafeResourceUrl>('');

  readonly closeBtnCls =
    'shrink-0 rounded p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#731514]';

  readonly verDocBtnCls =
    'shrink-0 rounded text-xs font-medium text-[#731514] hover:text-[#5e1212] hover:underline underline-offset-2 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#731514]';

  readonly visorCerrarBtnCls =
    'inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50 hover:border-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  verDocumento(nombre: string): void {
    const doc = crearDocumentoPlaceholderPDF(nombre);
    (doc.getDataUrl() as Promise<string>).then((url: string) => {
      this.visorDocUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
      this.visorDocAbierto.set(true);
    });
  }

  cerrarVisorDoc(): void {
    this.visorDocAbierto.set(false);
    this.visorDocUrl.set('');
  }
}
