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

interface CumplidoOrdenadorItem {
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
  estado: string;
  soportes: SoporteDocRevisable[];
}

type SortCol = 'dependencia' | 'rubro' | 'contrato' | 'vigencia' | 'mes' | 'ano' | 'estado';

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

const MOCK_CUMPLIDOS: CumplidoOrdenadorItem[] = [
  {
    pagoMensualId: 3001,
    dependencia: 'OF. ASESORA DE TECNOLOGIAS E INFORMACION',
    rubro: 'INVERSION',
    documento: '52.345.678',
    nombreContratista: 'Carlos Andres Martinez Lopez',
    numeroContrato: '789-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 7,
    mesNombre: 'Julio',
    ano: 2025,
    estado: 'AS',
    soportes: SOPORTES_3,
  },
  {
    pagoMensualId: 3002,
    dependencia: 'OF. ASESORA DE TECNOLOGIAS E INFORMACION',
    rubro: 'FUNCIONAMIENTO',
    documento: '41.876.543',
    nombreContratista: 'Laura Sofia Restrepo Diaz',
    numeroContrato: '654-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 7,
    mesNombre: 'Julio',
    ano: 2025,
    estado: 'AS',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 3004,
    dependencia: 'FACULTAD DE INGENIERIA',
    rubro: 'INVERSION',
    documento: '80.234.567',
    nombreContratista: 'Juan David Herrera Ruiz',
    numeroContrato: '512-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 7,
    mesNombre: 'Julio',
    ano: 2025,
    estado: 'AS',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 3005,
    dependencia: 'FACULTAD DE INGENIERIA',
    rubro: 'FUNCIONAMIENTO',
    documento: '39.456.789',
    nombreContratista: 'Andrea Milena Parra Torres',
    numeroContrato: '401-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 7,
    mesNombre: 'Julio',
    ano: 2025,
    estado: 'AS',
    soportes: SOPORTES_3,
  },
  {
    pagoMensualId: 3006,
    dependencia: 'FACULTAD DE INGENIERIA',
    rubro: 'INVERSION',
    documento: '80.234.567',
    nombreContratista: 'Juan David Herrera Ruiz',
    numeroContrato: '512-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 6,
    mesNombre: 'Junio',
    ano: 2025,
    estado: 'AS',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 3007,
    dependencia: 'DIV. RECURSOS HUMANOS',
    rubro: 'FUNCIONAMIENTO',
    documento: '51.789.012',
    nombreContratista: 'Diana Carolina Vargas Mendez',
    numeroContrato: '310-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 7,
    mesNombre: 'Julio',
    ano: 2025,
    estado: 'AS',
    soportes: SOPORTES_3,
  },
  {
    pagoMensualId: 3008,
    dependencia: 'DIV. RECURSOS HUMANOS',
    rubro: 'FUNCIONAMIENTO',
    documento: '79.345.123',
    nombreContratista: 'Felipe Santiago Ortiz Gomez',
    numeroContrato: '201-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 7,
    mesNombre: 'Julio',
    ano: 2025,
    estado: 'AS',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 3009,
    dependencia: 'OF. ASESORA DE TECNOLOGIAS E INFORMACION',
    rubro: 'INVERSION',
    documento: '41.876.543',
    nombreContratista: 'Laura Sofia Restrepo Diaz',
    numeroContrato: '654-2025',
    vigencia: 2025,
    esOtroSi: true,
    mes: 7,
    mesNombre: 'Julio',
    ano: 2025,
    estado: 'AS',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 3012,
    dependencia: 'DIV. FINANCIERA',
    rubro: 'INVERSION',
    documento: '23.567.890',
    nombreContratista: 'Roberto Camilo Medina Suarez',
    numeroContrato: '855-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 7,
    mesNombre: 'Julio',
    ano: 2025,
    estado: 'AS',
    soportes: SOPORTES_3,
  },
  {
    pagoMensualId: 3013,
    dependencia: 'DIV. FINANCIERA',
    rubro: 'FUNCIONAMIENTO',
    documento: '23.567.890',
    nombreContratista: 'Roberto Camilo Medina Suarez',
    numeroContrato: '855-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 6,
    mesNombre: 'Junio',
    ano: 2025,
    estado: 'AS',
    soportes: SOPORTES_BASE,
  },
];

const DEPENDENCIAS = [...new Set(MOCK_CUMPLIDOS.map((c) => c.dependencia))].sort();

@Component({
  selector: 'app-bandeja-ordenador',
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
  templateUrl: './bandeja-ordenador.component.html',
})
export class BandejaOrdenadorComponent {
  // ── Layout ─────────────────────────────────────────────────────────────────
  readonly mainCls = MAIN_WIDE;
  readonly hdrCls = HDR_WIDE;

  // ── Services ───────────────────────────────────────────────────────────────
  private readonly confirmSvc = inject(ConfirmDialogService);

  // ── State ──────────────────────────────────────────────────────────────────
  readonly cargando = signal(true);
  readonly cumplidos = signal<CumplidoOrdenadorItem[]>(MOCK_CUMPLIDOS);
  readonly busqueda = signal('');
  readonly filtroDependencia = signal('');
  readonly sortColumn = signal<SortCol | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly selectedItem = signal<CumplidoOrdenadorItem | null>(null);
  readonly selectedIds = signal<Set<number>>(new Set());

  // ── Static filter data ─────────────────────────────────────────────────────
  readonly dependencias = DEPENDENCIAS;
  readonly dependenciasOptions: SingleSelectOption[] = [
    { value: '', label: 'Todas las dependencias' },
    ...DEPENDENCIAS.map((d) => ({ value: d, label: d })),
  ];

  // ── Panel actionable estados ───────────────────────────────────────────────
  readonly panelActionableEstados = ['AS'];

  // ── Computed ───────────────────────────────────────────────────────────────
  readonly cumplidosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    const dep = this.filtroDependencia();
    let list = this.cumplidos();

    if (dep) {
      list = list.filter((c) => c.dependencia === dep);
    }

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
    } else if (col === 'rubro') {
      list = [...list].sort((a, b) => a.rubro.localeCompare(b.rubro) * dir);
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
    const hasFilter = this.busqueda() || this.filtroDependencia();
    const suffix = hasFilter ? ' encontrado(s)' : '';
    return `${n} cumplido${n !== 1 ? 's' : ''}${suffix}`;
  });

  readonly selectedCount = computed(() => this.selectedIds().size);

  readonly asCount = computed(
    () => this.cumplidosFiltrados().filter((c) => c.estado === 'AS').length,
  );

  readonly allAsSelected = computed(() => {
    const visibleAs = this.cumplidosFiltrados().filter((c) => c.estado === 'AS');
    if (visibleAs.length === 0) return false;
    const sel = this.selectedIds();
    return visibleAs.every((c) => sel.has(c.pagoMensualId));
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
      key: 'select',
      header: '',
      sortable: false,
      thClass: 'w-10 py-3.5 pl-5 pr-0',
      skHdr: 'h-2.5 w-4 animate-pulse rounded bg-gray-200 ml-1',
      skCell: 'h-4 w-4 animate-pulse rounded bg-gray-100 mx-auto',
    },
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
      sortable: true,
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

  // ── Literal class strings ──────────────────────────────────────────────────
  readonly selectCls =
    'block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors duration-150 focus:border-[#731514] focus:outline-none focus:ring-2 focus:ring-[#731514]/30';

  readonly primaryBtnCls =
    'inline-flex items-center justify-center gap-1.5 min-w-[8rem] rounded-md border border-[#731514] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#731514] transition-colors duration-150 hover:bg-[#731514]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly ghostBtnCls =
    'inline-flex items-center justify-center gap-1.5 min-w-[8rem] rounded-md border border-gray-900 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-900 transition-colors duration-150 hover:bg-gray-900/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly aprobarSelBtnCls =
    'inline-flex items-center justify-center gap-1.5 rounded-md bg-[#731514] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#5e1212] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly rubroInversionCls =
    'inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700';

  readonly rubroFuncionamientoCls =
    'inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600';

  readonly checkboxCls =
    'h-4 w-4 cursor-pointer rounded border-gray-300 accent-[#731514]';

  // ── Helpers ────────────────────────────────────────────────────────────────
  rubroBadgeClass(rubro: string): string {
    return rubro === 'INVERSION' ? this.rubroInversionCls : this.rubroFuncionamientoCls;
  }

  rubroLabel(rubro: string): string {
    return rubro === 'INVERSION' ? 'Inversi\u00f3n' : 'Funcionamiento';
  }

  accionBtnClass(estado: string): string {
    return estado === 'AS' ? this.primaryBtnCls : this.ghostBtnCls;
  }

  accionBtnLabel(estado: string): string {
    return estado === 'AS' ? 'Revisar' : 'Ver detalle';
  }

  isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  toggleSelectAll(): void {
    const visibleAs = this.cumplidosFiltrados().filter((c) => c.estado === 'AS');
    if (this.allAsSelected()) {
      this.selectedIds.update((set) => {
        const next = new Set(set);
        visibleAs.forEach((c) => next.delete(c.pagoMensualId));
        return next;
      });
    } else {
      this.selectedIds.update((set) => {
        const next = new Set(set);
        visibleAs.forEach((c) => next.add(c.pagoMensualId));
        return next;
      });
    }
  }

  toggleSelect(id: number): void {
    this.selectedIds.update((set) => {
      const next = new Set(set);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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
  abrirPanel(item: CumplidoOrdenadorItem): void {
    this.selectedItem.set(item);
  }

  cerrarPanel(): void {
    this.selectedItem.set(null);
  }

  // ── Actions ────────────────────────────────────────────────────────────────
  async handleAprobar(pagoMensualId: number): Promise<void> {
    const result = await this.confirmSvc.confirm({
      title: 'Aprobar cumplido',
      message:
        '\u00bfConfirma la aprobacion de este cumplido? El estado cambiara a Aprobado por ordenador.',
      confirmLabel: 'Aprobar',
      variant: 'default',
    });
    if (!result.confirmed) return;
    this.cumplidos.update((list) =>
      list.map((item) =>
        item.pagoMensualId !== pagoMensualId ? item : { ...item, estado: 'AP' },
      ),
    );
    this.selectedIds.update((set) => {
      const next = new Set(set);
      next.delete(pagoMensualId);
      return next;
    });
    this.selectedItem.set(null);
  }

  async handleRechazar(pagoMensualId: number): Promise<void> {
    const result = await this.confirmSvc.confirm({
      title: 'Rechazar cumplido',
      message:
        'Ingrese la observacion del rechazo. El supervisor y el contratista seran notificados.',
      confirmLabel: 'Rechazar',
      variant: 'danger',
      requireObservation: true,
      observationPlaceholder: 'Describa el motivo del rechazo...',
    });
    if (!result.confirmed) return;
    this.cumplidos.update((list) =>
      list.map((item) =>
        item.pagoMensualId !== pagoMensualId ? item : { ...item, estado: 'RO' },
      ),
    );
    this.selectedIds.update((set) => {
      const next = new Set(set);
      next.delete(pagoMensualId);
      return next;
    });
    this.selectedItem.set(null);
  }

  async handleAprobarSeleccionados(): Promise<void> {
    const ids = [...this.selectedIds()];
    if (ids.length === 0) return;
    const result = await this.confirmSvc.confirm({
      title: 'Aprobar seleccionados',
      message: `\u00bfConfirma la aprobacion de ${ids.length} cumplido${ids.length !== 1 ? 's' : ''}? El estado cambiara a Aprobado por ordenador.`,
      confirmLabel: 'Aprobar',
      variant: 'default',
    });
    if (!result.confirmed) return;
    this.cumplidos.update((list) =>
      list.map((item) =>
        !ids.includes(item.pagoMensualId) || item.estado !== 'AS'
          ? item
          : { ...item, estado: 'AP' },
      ),
    );
    this.selectedIds.set(new Set());
  }

  constructor() {
    setTimeout(() => this.cargando.set(false), 900);
  }
}
