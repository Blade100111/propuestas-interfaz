import { Component, computed, inject, signal } from '@angular/core';
import {
  DataTableComponent,
  TableColumn,
  TableCardDirective,
  TableRowDirective,
} from '../../shared/components/data-table.component';
import { EstadoChipComponent } from '../../shared/components/estado-chip.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { SearchInputComponent } from '../../shared/components/search-input.component';
import {
  SingleSelectDropdownComponent,
  SingleSelectOption,
} from '../../shared/components/single-select-dropdown.component';
import {
  SoportesPanelComponent,
  PanelCumplidoData,
  SoporteDocRevisable,
} from '../../shared/components/soportes-panel.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { MAIN_WIDE, HDR_WIDE } from '../../shared/layout';
import { SORT_PRIORITY } from '../../shared/estado.constants';

interface CumplidoBandejaItem {
  pagoMensualId: number;
  dependencia: string;
  documento: string;
  nombreContratista: string;
  numeroContrato: string;
  vigencia: number;
  cdp: number;
  tipoContrato: string;
  esOtroSi: boolean;
  mes: number;
  mesNombre: string;
  ano: number;
  estado: string;
  soportes: SoporteDocRevisable[];
}

type SortCol =
  | 'dependencia'
  | 'contrato'
  | 'vigencia'
  | 'mes'
  | 'ano'
  | 'estado';

const MES_NOMBRES_CERT = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const MESES_CERT = MES_NOMBRES_CERT.map((label, i) => ({ value: String(i + 1), label }));
const THIS_YEAR = new Date().getFullYear();
const ANIOS_CERT = [THIS_YEAR, THIS_YEAR - 1];
const DEPENDENCIAS_CERT = [
  'OF. ASESORA DE TECNOLOGIAS E INFORMACION',
  'FACULTAD DE INGENIERIA',
  'DIV. RECURSOS HUMANOS',
];

const SOPORTES_BASE: SoporteDocRevisable[] = [
  {
    id: 1,
    nombre: 'informe-gestion.pdf',
    descripcion: 'Informe de gestion del periodo correspondiente',
    observacion: '',
  },
  {
    id: 2,
    nombre: 'soporte-actividades.pdf',
    descripcion: 'Evidencias de actividades realizadas segun objeto contractual',
    observacion: '',
  },
];

const SOPORTES_3: SoporteDocRevisable[] = [
  ...SOPORTES_BASE,
  {
    id: 3,
    nombre: 'certificado-pago.pdf',
    descripcion: 'Certificado de no mora con entidades de seguridad social',
    observacion: '',
  },
];

const MOCK_CUMPLIDOS: CumplidoBandejaItem[] = [
  {
    pagoMensualId: 2001,
    dependencia: 'OF. ASESORA DE TECNOLOGIAS E INFORMACION',
    documento: '52.345.678',
    nombreContratista: 'Carlos Andres Martinez Lopez',
    numeroContrato: '789-2025',
    vigencia: 2025,
    cdp: 4256,
    tipoContrato: 'INICIAL',
    esOtroSi: false,
    mes: 7,
    mesNombre: 'Julio',
    ano: 2025,
    estado: 'PRS',
    soportes: SOPORTES_3,
  },
  {
    pagoMensualId: 2002,
    dependencia: 'OF. ASESORA DE TECNOLOGIAS E INFORMACION',
    documento: '41.876.543',
    nombreContratista: 'Laura Sofia Restrepo Diaz',
    numeroContrato: '654-2025',
    vigencia: 2025,
    cdp: 3981,
    tipoContrato: 'INICIAL',
    esOtroSi: false,
    mes: 7,
    mesNombre: 'Julio',
    ano: 2025,
    estado: 'PRS',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 2004,
    dependencia: 'FACULTAD DE INGENIERIA',
    documento: '80.234.567',
    nombreContratista: 'Juan David Herrera Ruiz',
    numeroContrato: '512-2025',
    vigencia: 2025,
    cdp: 3540,
    tipoContrato: 'INICIAL',
    esOtroSi: false,
    mes: 7,
    mesNombre: 'Julio',
    ano: 2025,
    estado: 'PRS',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 2005,
    dependencia: 'FACULTAD DE INGENIERIA',
    documento: '39.456.789',
    nombreContratista: 'Andrea Milena Parra Torres',
    numeroContrato: '401-2025',
    vigencia: 2025,
    cdp: 3128,
    tipoContrato: 'INICIAL',
    esOtroSi: false,
    mes: 7,
    mesNombre: 'Julio',
    ano: 2025,
    estado: 'PRS',
    soportes: SOPORTES_3,
  },
  {
    pagoMensualId: 2006,
    dependencia: 'FACULTAD DE INGENIERIA',
    documento: '80.234.567',
    nombreContratista: 'Juan David Herrera Ruiz',
    numeroContrato: '512-2025',
    vigencia: 2025,
    cdp: 3540,
    tipoContrato: 'INICIAL',
    esOtroSi: false,
    mes: 6,
    mesNombre: 'Junio',
    ano: 2025,
    estado: 'PRS',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 2007,
    dependencia: 'DIV. RECURSOS HUMANOS',
    documento: '51.789.012',
    nombreContratista: 'Diana Carolina Vargas Mendez',
    numeroContrato: '310-2025',
    vigencia: 2025,
    cdp: 2894,
    tipoContrato: 'INICIAL',
    esOtroSi: false,
    mes: 7,
    mesNombre: 'Julio',
    ano: 2025,
    estado: 'PRS',
    soportes: SOPORTES_3,
  },
  {
    pagoMensualId: 2008,
    dependencia: 'DIV. RECURSOS HUMANOS',
    documento: '79.345.123',
    nombreContratista: 'Felipe Santiago Ortiz Gomez',
    numeroContrato: '201-2025',
    vigencia: 2025,
    cdp: 2501,
    tipoContrato: 'INICIAL',
    esOtroSi: false,
    mes: 7,
    mesNombre: 'Julio',
    ano: 2025,
    estado: 'PRS',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 2009,
    dependencia: 'OF. ASESORA DE TECNOLOGIAS E INFORMACION',
    documento: '41.876.543',
    nombreContratista: 'Laura Sofia Restrepo Diaz',
    numeroContrato: '654-2025',
    vigencia: 2025,
    cdp: 3982,
    tipoContrato: 'OTRO SI 1',
    esOtroSi: true,
    mes: 7,
    mesNombre: 'Julio',
    ano: 2025,
    estado: 'PRS',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 2011,
    dependencia: 'DIV. RECURSOS HUMANOS',
    documento: '51.789.012',
    nombreContratista: 'Diana Carolina Vargas Mendez',
    numeroContrato: '310-2025',
    vigencia: 2025,
    cdp: 2894,
    tipoContrato: 'INICIAL',
    esOtroSi: false,
    mes: 6,
    mesNombre: 'Junio',
    ano: 2025,
    estado: 'RS',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 2012,
    dependencia: 'OF. ASESORA DE TECNOLOGIAS E INFORMACION',
    documento: '52.345.678',
    nombreContratista: 'Carlos Andres Martinez Lopez',
    numeroContrato: '789-2025',
    vigencia: 2025,
    cdp: 4256,
    tipoContrato: 'INICIAL',
    esOtroSi: false,
    mes: 5,
    mesNombre: 'Mayo',
    ano: 2025,
    estado: 'AP',
    soportes: SOPORTES_3,
  },
];

@Component({
  selector: 'app-bandeja-supervisor',
  standalone: true,
  imports: [
    DataTableComponent,
    TableRowDirective,
    TableCardDirective,
    EstadoChipComponent,
    EmptyStateComponent,
    SearchInputComponent,
    SoportesPanelComponent,
    ConfirmDialogComponent,
    SingleSelectDropdownComponent,
  ],
  templateUrl: './bandeja-supervisor.component.html',
})
export class BandejaSupervisorComponent {
  // ── Layout ─────────────────────────────────────────────────────────────────
  readonly mainCls = MAIN_WIDE;
  readonly hdrCls = HDR_WIDE;

  // ── Services ───────────────────────────────────────────────────────────────
  private readonly confirmSvc = inject(ConfirmDialogService);

  // ── State ──────────────────────────────────────────────────────────────────
  readonly cargando = signal(true);
  readonly cumplidos = signal<CumplidoBandejaItem[]>(MOCK_CUMPLIDOS);
  readonly busqueda = signal('');
  readonly sortColumn = signal<SortCol | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly selectedItem = signal<CumplidoBandejaItem | null>(null);

  // ── Computed ───────────────────────────────────────────────────────────────
  readonly cumplidosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    let list = this.cumplidos();

    if (q) {
      list = list.filter(
        (c) =>
          c.nombreContratista.toLowerCase().includes(q) ||
          c.documento.toLowerCase().includes(q) ||
          c.numeroContrato.toLowerCase().includes(q) ||
          c.dependencia.toLowerCase().includes(q),
      );
    }

    const col = this.sortColumn();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;

    if (col === 'dependencia') {
      list = [...list].sort((a, b) => a.dependencia.localeCompare(b.dependencia) * dir);
    } else if (col === 'contrato') {
      list = [...list].sort((a, b) => a.numeroContrato.localeCompare(b.numeroContrato) * dir);
    } else if (col === 'vigencia') {
      list = [...list].sort((a, b) => (a.vigencia - b.vigencia) * dir);
    } else if (col === 'mes') {
      list = [...list].sort((a, b) => (a.mes - b.mes) * dir);
    } else if (col === 'ano') {
      list = [...list].sort((a, b) => (a.ano - b.ano) * dir);
    } else if (col === 'estado') {
      list = [...list].sort(
        (a, b) => (SORT_PRIORITY[a.estado] - SORT_PRIORITY[b.estado]) * dir,
      );
    }

    return list;
  });

  readonly footerText = computed(() => {
    const n = this.cumplidosFiltrados().length;
    const suffix = this.busqueda() ? ' encontrado(s)' : '';
    return `${n} cumplido${n !== 1 ? 's' : ''}${suffix}`;
  });

  readonly panelData = computed((): PanelCumplidoData | null => {
    const item = this.selectedItem();
    if (!item) return null;
    return {
      pagoMensualId: item.pagoMensualId,
      nombreContratista: item.nombreContratista,
      documento: item.documento,
      numeroContrato: item.numeroContrato,
      mes: item.mesNombre,
      ano: item.ano,
      estado: item.estado,
      soportes: item.soportes,
    };
  });

  // ── Columns ────────────────────────────────────────────────────────────────
  readonly tableColumns: TableColumn[] = [
    {
      key: 'dependencia',
      header: 'Dependencia',
      sortable: true,
      thClass: 'hidden px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 lg:table-cell',
      skHdr: 'hidden h-2.5 flex-1 animate-pulse rounded bg-gray-200 lg:block',
      skCell: 'hidden h-4 w-40 animate-pulse rounded bg-gray-100 lg:block',
    },
    {
      key: 'documento',
      header: 'Documento',
      sortable: false,
      thClass: 'px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500',
      skHdr: 'h-2.5 w-20 animate-pulse rounded bg-gray-200',
      skCell: 'h-4 w-24 animate-pulse rounded bg-gray-100',
    },
    {
      key: 'nombre',
      header: 'Nombre',
      sortable: false,
      thClass: 'px-3 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500',
      skHdr: 'h-2.5 flex-1 animate-pulse rounded bg-gray-200',
      skCell: 'h-4 w-36 animate-pulse rounded bg-gray-100',
    },
    {
      key: 'contrato',
      header: 'N\u00b0 Contrato',
      sortable: true,
      thClass: 'px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500',
      skHdr: 'h-2.5 w-20 animate-pulse rounded bg-gray-200',
      skCell: 'h-4 w-20 animate-pulse rounded bg-gray-100',
    },
    {
      key: 'vigencia',
      header: 'Vigencia',
      sortable: true,
      thClass: 'hidden px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 lg:table-cell',
      skHdr: 'hidden h-2.5 w-14 animate-pulse rounded bg-gray-200 lg:block',
      skCell: 'hidden h-4 w-14 animate-pulse rounded bg-gray-100 lg:block',
    },
    {
      key: 'cdp',
      header: 'CDP',
      sortable: false,
      thClass: 'hidden px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 lg:table-cell',
      skHdr: 'hidden h-2.5 w-12 animate-pulse rounded bg-gray-200 lg:block',
      skCell: 'hidden h-4 w-12 animate-pulse rounded bg-gray-100 lg:block',
    },
    {
      key: 'tipo',
      header: 'Tipo',
      sortable: false,
      thClass: 'hidden px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 lg:table-cell',
      skHdr: 'hidden h-2.5 w-16 animate-pulse rounded bg-gray-200 lg:block',
      skCell: 'hidden h-5 w-16 animate-pulse rounded-full bg-gray-100 lg:block',
    },
    {
      key: 'mes',
      header: 'Mes',
      sortable: true,
      thClass: 'px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500',
      skHdr: 'h-2.5 w-10 animate-pulse rounded bg-gray-200',
      skCell: 'h-4 w-12 animate-pulse rounded bg-gray-100',
    },
    {
      key: 'ano',
      header: 'A\u00f1o',
      sortable: true,
      thClass: 'px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500',
      skHdr: 'h-2.5 w-10 animate-pulse rounded bg-gray-200',
      skCell: 'h-4 w-12 animate-pulse rounded bg-gray-100',
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      thClass: 'px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500',
      skHdr: 'h-2.5 w-16 animate-pulse rounded bg-gray-200',
      skCell: 'h-5 w-24 animate-pulse rounded-full bg-gray-100',
    },
    {
      key: 'accion',
      header: 'Acciones',
      sortable: false,
      thClass: 'py-3.5 pl-3 pr-5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500',
      skHdr: 'h-2.5 w-20 animate-pulse rounded bg-gray-200',
      skCell: 'h-8 w-28 animate-pulse rounded-md bg-gray-100',
    },
  ];

  // ── Cert filter static data ────────────────────────────────────────────────
  readonly certDependencias = DEPENDENCIAS_CERT;
  readonly certMeses = MESES_CERT;
  readonly certAnios = ANIOS_CERT;
  readonly certDependenciasOptions: SingleSelectOption[] = DEPENDENCIAS_CERT.map((d) => ({ value: d, label: d }));
  readonly certMesesOptions: SingleSelectOption[] = MESES_CERT;
  readonly certAniosOptions: SingleSelectOption[] = ANIOS_CERT.map((a) => ({ value: String(a), label: String(a) }));

  // ── Cert filter state ──────────────────────────────────────────────────────
  readonly certDependencia = signal('');
  readonly certMes = signal('');
  readonly certAnio = signal('');
  readonly certFecha = signal('');

  // ── Literal class strings ──────────────────────────────────────────────────
  readonly selectCls =
    'block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors duration-150 focus:border-[#731514] focus:outline-none focus:ring-2 focus:ring-[#731514]/30';

  readonly primaryBtnCls =
    'inline-flex items-center justify-center gap-1.5 min-w-[8rem] rounded-md border border-[#731514] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#731514] transition-colors duration-150 hover:bg-[#731514]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly ghostBtnCls =
    'inline-flex items-center justify-center gap-1.5 min-w-[8rem] rounded-md border border-gray-900 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-900 transition-colors duration-150 hover:bg-gray-900/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly certBtnCls =
    'inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:border-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly tipoBadgeInicialCls =
    'inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600';

  readonly tipoBadgeOtroSiCls =
    'inline-flex items-center rounded-full bg-[#731514]/10 px-2 py-0.5 text-xs font-medium text-[#731514]';

  // ── Helpers ────────────────────────────────────────────────────────────────
  tipoBadgeClass(item: CumplidoBandejaItem): string {
    return item.esOtroSi ? this.tipoBadgeOtroSiCls : this.tipoBadgeInicialCls;
  }

  accionBtnClass(estado: string): string {
    return estado === 'PRS' ? this.primaryBtnCls : this.ghostBtnCls;
  }

  accionBtnLabel(estado: string): string {
    return estado === 'PRS' ? 'Revisar' : 'Ver detalle';
  }

  // ── Sorting ────────────────────────────────────────────────────────────────
  sortBy(col: string): void {
    const sortCol = col as SortCol;
    if (this.sortColumn() === sortCol) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(sortCol);
      this.sortDirection.set('asc');
    }
  }

  // ── Panel ──────────────────────────────────────────────────────────────────
  abrirPanel(item: CumplidoBandejaItem): void {
    this.selectedItem.set(item);
  }

  cerrarPanel(): void {
    this.selectedItem.set(null);
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  // ── Cert section ───────────────────────────────────────────────────────────
  async generarCertificado(): Promise<void> {
    await this.confirmSvc.confirm({
      title: 'Certificado de cumplido',
      message:
        'La generacion de este certificado estara disponible proximamente. El modulo de exportacion PDF para supervisores esta en desarrollo.',
      variant: 'info',
      cancelLabel: 'Entendido',
    });
  }

  async handleAprobar(pagoMensualId: number): Promise<void> {
    const result = await this.confirmSvc.confirm({
      title: 'Aprobar cumplido',
      message:
        '\u00bfConfirma que los soportes cumplen con los requisitos? Esta accion cambiara el estado a Aprobado por supervisor.',
      confirmLabel: 'Aprobar',
      variant: 'default',
    });
    if (!result.confirmed) return;
    this.cumplidos.update((list) =>
      list.map((item) =>
        item.pagoMensualId !== pagoMensualId ? item : { ...item, estado: 'AS' },
      ),
    );
    this.selectedItem.set(null);
  }

  async handleRechazar(pagoMensualId: number): Promise<void> {
    const result = await this.confirmSvc.confirm({
      title: 'Rechazar cumplido',
      message:
        'Ingrese la observacion del rechazo. El contratista debera corregir los soportes y reenviar.',
      confirmLabel: 'Rechazar',
      variant: 'danger',
      requireObservation: true,
      observationPlaceholder: 'Describa el motivo del rechazo...',
    });
    if (!result.confirmed) return;
    this.cumplidos.update((list) =>
      list.map((item) =>
        item.pagoMensualId !== pagoMensualId ? item : { ...item, estado: 'RS' },
      ),
    );
    this.selectedItem.set(null);
  }

  constructor() {
    setTimeout(() => this.cargando.set(false), 900);
  }
}
