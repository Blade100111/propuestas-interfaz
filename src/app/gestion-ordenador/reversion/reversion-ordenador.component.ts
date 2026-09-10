import { Component, computed, inject, signal } from '@angular/core';
import {
  DataTableComponent,
  TableColumn,
  TableCardDirective,
  TableRowDirective,
} from '../../shared/components/data-table.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { SearchInputComponent } from '../../shared/components/search-input.component';
import {
  SoportesPanelComponent,
  PanelCumplidoData,
  SoporteDocRevisable,
} from '../../shared/components/soportes-panel.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog.component';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';
import { MAIN_WIDE, HDR_WIDE } from '../../shared/layout';

interface CumplidoReversionItem {
  pagoMensualId: number;
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
  fechaAprobacion: string;
  estado: string;
  soportes: SoporteDocRevisable[];
}

type SortCol = 'dependencia' | 'contrato' | 'vigencia' | 'mes' | 'ano' | 'fechaAprobacion';

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

const MOCK_CUMPLIDOS: CumplidoReversionItem[] = [
  {
    pagoMensualId: 4001,
    dependencia: 'OF. ASESORA DE TECNOLOGIAS E INFORMACION',
    rubro: 'INVERSION',
    documento: '52.345.678',
    nombreContratista: 'Carlos Andres Martinez Lopez',
    numeroContrato: '789-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 6,
    mesNombre: 'Junio',
    ano: 2025,
    fechaAprobacion: '2025-09-01',
    estado: 'AP',
    soportes: SOPORTES_3,
  },
  {
    pagoMensualId: 4002,
    dependencia: 'OF. ASESORA DE TECNOLOGIAS E INFORMACION',
    rubro: 'FUNCIONAMIENTO',
    documento: '41.876.543',
    nombreContratista: 'Laura Sofia Restrepo Diaz',
    numeroContrato: '654-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 6,
    mesNombre: 'Junio',
    ano: 2025,
    fechaAprobacion: '2025-09-01',
    estado: 'AP',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 4003,
    dependencia: 'FACULTAD DE INGENIERIA',
    rubro: 'INVERSION',
    documento: '80.234.567',
    nombreContratista: 'Juan David Herrera Ruiz',
    numeroContrato: '512-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 5,
    mesNombre: 'Mayo',
    ano: 2025,
    fechaAprobacion: '2025-08-28',
    estado: 'AP',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 4004,
    dependencia: 'FACULTAD DE INGENIERIA',
    rubro: 'FUNCIONAMIENTO',
    documento: '39.456.789',
    nombreContratista: 'Andrea Milena Parra Torres',
    numeroContrato: '401-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 6,
    mesNombre: 'Junio',
    ano: 2025,
    fechaAprobacion: '2025-09-02',
    estado: 'AP',
    soportes: SOPORTES_3,
  },
  {
    pagoMensualId: 4005,
    dependencia: 'DIV. RECURSOS HUMANOS',
    rubro: 'FUNCIONAMIENTO',
    documento: '51.789.012',
    nombreContratista: 'Diana Carolina Vargas Mendez',
    numeroContrato: '310-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 6,
    mesNombre: 'Junio',
    ano: 2025,
    fechaAprobacion: '2025-09-03',
    estado: 'AP',
    soportes: SOPORTES_3,
  },
  {
    pagoMensualId: 4006,
    dependencia: 'DIV. RECURSOS HUMANOS',
    rubro: 'FUNCIONAMIENTO',
    documento: '79.345.123',
    nombreContratista: 'Felipe Santiago Ortiz Gomez',
    numeroContrato: '201-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 5,
    mesNombre: 'Mayo',
    ano: 2025,
    fechaAprobacion: '2025-08-25',
    estado: 'AP',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 4007,
    dependencia: 'DIV. FINANCIERA',
    rubro: 'INVERSION',
    documento: '23.567.890',
    nombreContratista: 'Roberto Camilo Medina Suarez',
    numeroContrato: '855-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 6,
    mesNombre: 'Junio',
    ano: 2025,
    fechaAprobacion: '2025-09-03',
    estado: 'AP',
    soportes: SOPORTES_3,
  },
];

@Component({
  selector: 'app-reversion-ordenador',
  standalone: true,
  imports: [
    DataTableComponent,
    TableRowDirective,
    TableCardDirective,
    EmptyStateComponent,
    SearchInputComponent,
    SoportesPanelComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './reversion-ordenador.component.html',
})
export class ReversionOrdenadorComponent {
  // ── Layout ─────────────────────────────────────────────────────────────────
  readonly mainCls = MAIN_WIDE;
  readonly hdrCls = HDR_WIDE;

  // ── Services ───────────────────────────────────────────────────────────────
  private readonly confirmSvc = inject(ConfirmDialogService);

  // ── Panel config (read-only: no action buttons, no observation textareas) ──
  readonly panelActionableEstados: string[] = [];

  // ── State ──────────────────────────────────────────────────────────────────
  readonly cargando = signal(true);
  readonly cumplidos = signal<CumplidoReversionItem[]>(MOCK_CUMPLIDOS);
  readonly busqueda = signal('');
  readonly sortColumn = signal<SortCol | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly selectedItem = signal<CumplidoReversionItem | null>(null);

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
    } else if (col === 'fechaAprobacion') {
      list = [...list].sort((a, b) => a.fechaAprobacion.localeCompare(b.fechaAprobacion) * dir);
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
      key: 'rubro',
      header: 'Rubro',
      sortable: false,
      thClass: 'hidden px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 lg:table-cell',
      skHdr: 'hidden h-2.5 w-24 animate-pulse rounded bg-gray-200 lg:block',
      skCell: 'hidden h-5 w-28 animate-pulse rounded-full bg-gray-100 lg:block',
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
      key: 'mes',
      header: 'Mes',
      sortable: true,
      thClass: 'px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500',
      skHdr: 'h-2.5 w-10 animate-pulse rounded bg-gray-200',
      skCell: 'h-4 w-12 animate-pulse rounded bg-gray-100',
    },
    {
      key: 'fechaAprobacion',
      header: 'Fecha aprobacion',
      sortable: true,
      thClass: 'hidden px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 lg:table-cell',
      skHdr: 'hidden h-2.5 w-24 animate-pulse rounded bg-gray-200 lg:block',
      skCell: 'hidden h-4 w-24 animate-pulse rounded bg-gray-100 lg:block',
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
      key: 'accion',
      header: 'Acciones',
      sortable: false,
      thClass: 'py-3.5 pl-3 pr-5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500',
      skHdr: 'h-2.5 w-28 animate-pulse rounded bg-gray-200',
      skCell: 'h-8 w-40 animate-pulse rounded-md bg-gray-100',
    },
  ];

  // ── Literal class strings ──────────────────────────────────────────────────
  readonly soportesBtnCls =
    'inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors duration-150 hover:border-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly revertirBtnCls =
    'inline-flex items-center gap-1 rounded-md border border-[#930E10] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#930E10] transition-colors duration-150 hover:bg-[#930E10]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#930E10]';

  readonly rubroInversionCls =
    'inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700';

  readonly rubroFuncionamientoCls =
    'inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600';

  // ── Helpers ────────────────────────────────────────────────────────────────
  rubroBadgeClass(rubro: string): string {
    return rubro === 'INVERSION' ? this.rubroInversionCls : this.rubroFuncionamientoCls;
  }

  rubroLabel(rubro: string): string {
    return rubro === 'INVERSION' ? 'Inversion' : 'Funcionamiento';
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
  abrirPanel(item: CumplidoReversionItem): void {
    this.selectedItem.set(item);
  }

  cerrarPanel(): void {
    this.selectedItem.set(null);
  }

  // ── Reversion ──────────────────────────────────────────────────────────────
  async handleRevertir(item: CumplidoReversionItem): Promise<void> {
    const result = await this.confirmSvc.confirm({
      title: 'Revertir aprobacion',
      message: `\u00bfEsta seguro de revertir el cumplido de ${item.nombreContratista} (${item.mesNombre} ${item.ano})? El estado volvera a Rechazado por ordenador y el contratista debera corregir y reenviar.`,
      confirmLabel: 'Revertir',
      cancelLabel: 'Cancelar',
      variant: 'danger',
    });
    if (!result.confirmed) return;
    // Item leaves the revertible list (matches real endpoint behavior)
    this.cumplidos.update((list) =>
      list.filter((c) => c.pagoMensualId !== item.pagoMensualId),
    );
    if (this.selectedItem()?.pagoMensualId === item.pagoMensualId) {
      this.selectedItem.set(null);
    }
  }

  constructor() {
    setTimeout(() => this.cargando.set(false), 900);
  }
}
