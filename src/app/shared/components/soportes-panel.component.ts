import { Component, computed, inject, output, signal, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EstadoChipComponent } from './estado-chip.component';
import { crearDocumentoPlaceholderPDF } from '../doc-placeholder-pdf';

export interface SoporteDocRevisable {
  id: number;
  nombre: string;
  descripcion: string;
  observacion: string;
}

export interface PanelCumplidoData {
  pagoMensualId: number;
  nombreContratista: string;
  documento: string;
  numeroContrato: string;
  mes: string;
  ano: number;
  estado: string;
  soportes: SoporteDocRevisable[];
}

@Component({
  selector: 'app-soportes-panel',
  standalone: true,
  imports: [EstadoChipComponent],
  templateUrl: './soportes-panel.component.html',
})
export class SoportesPanelComponent {
  readonly item = input<PanelCumplidoData | null>(null);

  readonly cerrar = output<void>();
  readonly aprobar = output<number>();
  readonly rechazar = output<number>();

  readonly actionableEstados = input<string[]>(['PRS']);
  readonly panelReadonly = input<boolean>(false);

  readonly abierto = computed(() => this.item() !== null);
  readonly esAccionable = computed(() => {
    const est = this.item()?.estado;
    return est !== undefined && this.actionableEstados().includes(est);
  });

  private readonly sanitizer = inject(DomSanitizer);

  readonly observaciones = signal<Partial<Record<number, string>>>({});
  readonly visorDocAbierto = signal(false);
  readonly visorDocUrl = signal<SafeResourceUrl>('');

  readonly panelTransformCls = computed(() =>
    this.abierto() ? this.panelOpenCls : this.panelClosedCls,
  );

  // ── Literal TW class strings ──────────────────────────────────────────────

  readonly panelOpenCls = 'translate-x-0';
  readonly panelClosedCls = 'translate-x-full';

  readonly verDocBtnCls =
    'shrink-0 rounded text-xs font-medium text-[#731514] hover:text-[#5e1212] hover:underline underline-offset-2 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#731514]';

  readonly visorCerrarBtnCls =
    'inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50 hover:border-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly closeBtnCls =
    'shrink-0 rounded p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#731514]';

  readonly textareaCls =
    'block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm resize-none transition-colors duration-150 focus:border-[#731514] focus:outline-none focus:ring-2 focus:ring-[#731514]/30';

  readonly primaryBtnCls =
    'inline-flex items-center justify-center gap-2 rounded-md bg-[#731514] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#5e1212] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly dangerOutlineBtnCls =
    'inline-flex items-center justify-center gap-2 rounded-md border border-[#930E10] bg-white px-4 py-2.5 text-sm font-semibold text-[#930E10] transition-colors duration-150 hover:bg-[#930E10]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#930E10]';

  // ── Methods ───────────────────────────────────────────────────────────────

  onObservacionInput(soporteId: number, event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.observaciones.update((obs) => ({ ...obs, [soporteId]: value }));
  }

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

  onCerrar(): void {
    this.cerrar.emit();
  }

  onAprobar(): void {
    const id = this.item()?.pagoMensualId;
    if (id !== undefined) this.aprobar.emit(id);
  }

  onRechazar(): void {
    const id = this.item()?.pagoMensualId;
    if (id !== undefined) this.rechazar.emit(id);
  }
}
