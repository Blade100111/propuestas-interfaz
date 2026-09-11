import { Component, ElementRef, ViewChild, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EstadoChipComponent } from '../../shared/components/estado-chip.component';
import {
  SingleSelectDropdownComponent,
  SingleSelectOption,
} from '../../shared/components/single-select-dropdown.component';
import { MAIN_NARROW, HDR_NARROW } from '../../shared/layout';

export interface SoporteDoc {
  nombre: string;
  fecha: string;
}

export interface DetalleContrato {
  pagoMensualId: number;
  numeroContrato: string;
  objeto: string;
  tipoContrato: string;
  vigencia: number;
  mes: string;
  estado: 'CD' | 'PRS' | 'AS' | 'AP' | 'RS' | 'RO';
  supervisor: string;
  supervisorCargo: string;
  observacionRechazo?: string;
  soportes: SoporteDoc[];
}

export interface StagedFile {
  file: File;
  nombre: string;
  sizeMB: number;
  error?: string;
}


// Hardcoded mock — 6 rows, all belonging to contract 789-2025, one per month.
// pagoMensualId values are shared with solicitudes-contratista + informe components.
// Exported so the informe component can cross-reference supervisor info for the PDF.
export const MOCK_DETALLES: DetalleContrato[] = [
  {
    pagoMensualId: 1001,
    numeroContrato: '789-2025',
    objeto:
      'Prestación de servicios profesionales en soporte y mantenimiento de sistemas de información para la Oficina de Sistemas e Informática',
    tipoContrato: 'Prestación de Servicios',
    vigencia: 2025,
    mes: 'Julio',
    estado: 'CD',
    supervisor: 'María Fernanda Ospina Ruiz',
    supervisorCargo: 'Coordinadora de Sistemas',
    soportes: [],
  },
  {
    pagoMensualId: 1002,
    numeroContrato: '789-2025',
    objeto:
      'Prestación de servicios profesionales en soporte y mantenimiento de sistemas de información para la Oficina de Sistemas e Informática',
    tipoContrato: 'Prestación de Servicios',
    vigencia: 2025,
    mes: 'Junio',
    estado: 'RS',
    supervisor: 'María Fernanda Ospina Ruiz',
    supervisorCargo: 'Coordinadora de Sistemas',
    observacionRechazo:
      'El informe de actividades no detalla las tareas realizadas durante el periodo. Por favor corrija y reenvíe con el detalle completo de las actividades ejecutadas.',
    soportes: [{ nombre: 'soporte-junio-2025.pdf', fecha: '14 jul 2025' }],
  },
  {
    pagoMensualId: 1003,
    numeroContrato: '789-2025',
    objeto:
      'Prestación de servicios profesionales en soporte y mantenimiento de sistemas de información para la Oficina de Sistemas e Informática',
    tipoContrato: 'Prestación de Servicios',
    vigencia: 2025,
    mes: 'Mayo',
    estado: 'PRS',
    supervisor: 'María Fernanda Ospina Ruiz',
    supervisorCargo: 'Coordinadora de Sistemas',
    soportes: [
      { nombre: 'informe-mayo-2025.pdf', fecha: '10 jun 2025' },
      { nombre: 'soporte-actividades.pdf', fecha: '10 jun 2025' },
    ],
  },
  {
    pagoMensualId: 1004,
    numeroContrato: '789-2025',
    objeto:
      'Prestación de servicios profesionales en soporte y mantenimiento de sistemas de información para la Oficina de Sistemas e Informática',
    tipoContrato: 'Prestación de Servicios',
    vigencia: 2025,
    mes: 'Abril',
    estado: 'AS',
    supervisor: 'María Fernanda Ospina Ruiz',
    supervisorCargo: 'Coordinadora de Sistemas',
    soportes: [
      { nombre: 'informe-abril-2025.pdf', fecha: '5 may 2025' },
      { nombre: 'soporte-actividades.pdf', fecha: '5 may 2025' },
    ],
  },
  {
    pagoMensualId: 1005,
    numeroContrato: '789-2025',
    objeto:
      'Prestación de servicios profesionales en soporte y mantenimiento de sistemas de información para la Oficina de Sistemas e Informática',
    tipoContrato: 'Prestación de Servicios',
    vigencia: 2025,
    mes: 'Marzo',
    estado: 'AP',
    supervisor: 'María Fernanda Ospina Ruiz',
    supervisorCargo: 'Coordinadora de Sistemas',
    soportes: [
      { nombre: 'informe-marzo-2025.pdf', fecha: '3 abr 2025' },
      { nombre: 'evidencias-sistemas.pdf', fecha: '3 abr 2025' },
    ],
  },
  {
    pagoMensualId: 1006,
    numeroContrato: '789-2025',
    objeto:
      'Prestación de servicios profesionales en soporte y mantenimiento de sistemas de información para la Oficina de Sistemas e Informática',
    tipoContrato: 'Prestación de Servicios',
    vigencia: 2025,
    mes: 'Febrero',
    estado: 'RO',
    supervisor: 'María Fernanda Ospina Ruiz',
    supervisorCargo: 'Coordinadora de Sistemas',
    observacionRechazo:
      'Los soportes presentados no corresponden al periodo contractual indicado. Se revierte la aprobación hasta que se presenten los documentos de febrero 2025.',
    soportes: [
      { nombre: 'informe-febrero-2025.pdf', fecha: '4 mar 2025' },
      { nombre: 'soporte-sistemas.pdf', fecha: '4 mar 2025' },
    ],
  },
];

// Items from item_informe_tipo_contrato — confirmed against real backend schema.
// In production, this list is fetched by TipoContratoId (dynamic, from the loaded
// contract). The bug in the legacy (carga_documentos_contratista.js) was hardcoding
// TipoContratoId: '6'. Here we express the dynamic intent via itemsDisponibles().
const ITEMS_SOPORTE = [
  { id: 'salud-pension',   label: 'Salud y Pensión' },
  { id: 'informe-gestion', label: 'Informe de Gestión y Certificado' },
  { id: 'cumplido',        label: 'Cumplido' },
  { id: 'otras',           label: 'Otras' },
] as const;

const INFORME_ITEM_ID = 'informe-gestion';
const MAX_FILE_MB = 1; // confirmed: maxFileSize: 1000 KB / fileModel.size <= 1000000

@Component({
  selector: 'app-detalle-soporte-contratista',
  standalone: true,
  imports: [EstadoChipComponent, SingleSelectDropdownComponent],
  templateUrl: './detalle-soporte-contratista.component.html',
})
export class DetalleSoporteContratistaComponent {
  // ── Layout ────────────────────────────────────────────────────────────────
  readonly mainCls = MAIN_NARROW;
  readonly hdrCls  = HDR_NARROW;

  // ── Literal class strings — TW scanner must see these at build time ────────
  readonly backBtnCls =
    'inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514] rounded';

  readonly primaryBtnCls =
    'inline-flex items-center justify-center gap-2 rounded-md bg-[#731514] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#5e1212] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514] disabled:opacity-40 disabled:cursor-not-allowed';

  readonly ghostBtnCls =
    'inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50 hover:border-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  // Rejection panels — tints from existing design.json tonal ramps; no new colors.
  // RS: danger-scarlet ramp tints (#f8d9d9 bg, #edaaab border, #5e0a0b text)
  // RO: neutral-slate ramp tints (#f0f2f5 bg, #d8dce4 border)
  readonly rsPanelCls = 'rounded-xl border border-[#edaaab] bg-[#f8d9d9] p-4 mb-5';
  readonly roPanelCls = 'rounded-xl border border-[#d8dce4] bg-[#f0f2f5] p-4 mb-5';

  // Status info banners (PRS, AS = neutral; AP = approval-forest lightest tint)
  readonly infoPanelCls =
    'flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 mb-5';
  readonly successPanelCls =
    'flex items-start gap-3 rounded-xl border border-[#a5e5a6] bg-[#d6f5d6] p-4 mb-5';

  // Drop zone — two states; computed combines them
  readonly dropZoneDefaultCls =
    'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center cursor-pointer transition-colors duration-150 hover:bg-white hover:border-gray-400 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#731514]';
  readonly dropZoneActiveCls =
    'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-[#731514] bg-[#f3e8e8] px-6 py-10 text-center cursor-pointer transition-colors duration-150 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#731514]';
  readonly itemsOptions: SingleSelectOption[] = ITEMS_SOPORTE.map((i) => ({
    value: i.id,
    label: i.label,
  }));

  // ── ViewChild ─────────────────────────────────────────────────────────────
  // Present in DOM only when esEditable() && itemSeleccionado() && !esInforme()
  @ViewChild('fileInput') private readonly fileInputEl?: ElementRef<HTMLInputElement>;

  // ── State ─────────────────────────────────────────────────────────────────
  readonly cargando = signal(true);
  readonly dropZoneActive = signal(false);
  readonly archivosStaged = signal<StagedFile[]>([]);
  readonly enviando = signal(false);
  readonly itemSeleccionado = signal<string>('');

  readonly pagoMensualId: number;
  readonly contrato = signal<DetalleContrato | null>(null);

  readonly esEditable = computed(() => {
    const c = this.contrato();
    return c?.estado === 'CD' || c?.estado === 'RS';
  });

  readonly esInforme = computed(() => this.itemSeleccionado() === INFORME_ITEM_ID);

  // Returns items for the loaded contract's TipoContrato.
  // Production: look up item_informe_tipo_contrato by tipoContratoId (dynamic).
  // Mock: all records are 'Prestación de Servicios' → same 4 items.
  readonly itemsDisponibles = computed(() => ITEMS_SOPORTE);

  // Enabled when: item selected, NOT informe redirect, not already sending,
  // AND (RS state allows re-send with existing docs / CD requires at least one valid file).
  readonly puedeEnviar = computed(() => {
    const c = this.contrato();
    if (!c || this.enviando()) return false;
    if (!this.itemSeleccionado() || this.esInforme()) return false;
    if (c.estado === 'RS') return true;
    return this.archivosStaged().some((f) => !f.error);
  });

  readonly dropZoneCls = computed(() =>
    this.dropZoneActive() ? this.dropZoneActiveCls : this.dropZoneDefaultCls,
  );

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.pagoMensualId = Number(this.route.snapshot.paramMap.get('pagoMensualId'));
    // Simulate async data fetch
    setTimeout(() => {
      this.contrato.set(
        MOCK_DETALLES.find((d) => d.pagoMensualId === this.pagoMensualId) ?? null,
      );
      this.cargando.set(false);
    }, 900);
  }

  // ── File handling ─────────────────────────────────────────────────────────
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.processFiles(Array.from(input.files ?? []));
    input.value = ''; // reset so the same file can be re-added after removal
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dropZoneActive.set(true);
  }

  onDragLeave(event: DragEvent): void {
    // Only deactivate when cursor genuinely leaves the drop zone bounds
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const { clientX: x, clientY: y } = event;
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      this.dropZoneActive.set(false);
    }
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dropZoneActive.set(false);
    this.processFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  activateFileInput(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.dispararFileInput();
    }
  }

  private processFiles(files: File[]): void {
    const staged = [...this.archivosStaged()];
    for (const file of files) {
      if (staged.some((f) => f.nombre === file.name)) continue; // deduplicate
      const sizeMB = file.size / 1024 / 1024;
      const esPdf =
        file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      let error: string | undefined;
      if (!esPdf) {
        error = 'Solo se permiten archivos PDF';
      } else if (sizeMB > MAX_FILE_MB) {
        error = `Supera el límite de ${MAX_FILE_MB} MB (${sizeMB.toFixed(1)} MB)`;
      }
      staged.push({ file, nombre: file.name, sizeMB, error });
    }
    this.archivosStaged.set(staged);
  }

  removeFile(target: StagedFile): void {
    this.archivosStaged.update((list) => list.filter((f) => f !== target));
  }

  setItem(val: string): void {
    this.itemSeleccionado.set(val);
    this.archivosStaged.set([]); // clear staged files when item type changes
  }

  dispararFileInput(): void {
    this.fileInputEl?.nativeElement.click();
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  volver(): void {
    this.router.navigate(['/gestion-contratista/contratos']);
  }

  verInforme(): void {
    this.router.navigate(['/gestion-contratista/informe', this.pagoMensualId]);
  }

  enviarARevision(): void {
    if (!this.puedeEnviar()) return;
    this.enviando.set(true);
    // Simulate async submission; in production: PUT pago_mensual + POST soporte_pago_mensual
    setTimeout(() => {
      this.enviando.set(false);
      this.router.navigate(['/gestion-contratista/contratos']);
    }, 1200);
  }
}
