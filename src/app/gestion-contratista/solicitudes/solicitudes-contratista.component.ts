import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EstadoChipComponent } from '../../shared/components/estado-chip.component';
import {
  SingleSelectDropdownComponent,
  SingleSelectOption,
} from '../../shared/components/single-select-dropdown.component';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import {
  DataTableComponent,
  TableCardDirective,
  TableColumn,
  TableRowDirective,
} from '../../shared/components/data-table.component';
import { TabBarComponent, TabItem } from '../../shared/components/tab-bar.component';
import { SORT_PRIORITY } from '../../shared/estado.constants';
import { MAIN_WIDE, HDR_WIDE } from '../../shared/layout';

type EstadoCode = 'CD' | 'PRS' | 'AS' | 'AP' | 'RS' | 'RO';
type FiltroTab  = 'accion' | 'todos';
type SortCol    = 'ano' | 'mes' | 'estado';

interface SolicitudMock {
  pagoMensualId: number;
  mes: number;
  mesNombre: string;
  ano: number;
  estado: EstadoCode;
  fechaCreacion: string; // display string, e.g. '1 ago 2025'
}

const MES_NOMBRES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const MES_ABREV = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

const MESES = MES_NOMBRES.map((label, i) => ({ value: i + 1, label }));

// Dynamic year range: current year + 1 as upper bound, 4 years total.
// Recalculated each time the module loads — no stale hardcoded year.
const THIS_YEAR = new Date().getFullYear();
const ANIOS = Array.from({ length: 4 }, (_, i) => THIS_YEAR + 1 - i);

function formatFecha(date: Date): string {
  return `${date.getDate()} ${MES_ABREV[date.getMonth()]} ${date.getFullYear()}`;
}


// All 6 mocks belong to contract 789-2025 — one per month.
// pagoMensualId values are shared with detalle-soporte + informe components.
const MOCK_SOLICITUDES: SolicitudMock[] = [
  { pagoMensualId: 1001, mes: 7, mesNombre: 'Julio',   ano: 2025, estado: 'CD',  fechaCreacion: '1 ago 2025'  },
  { pagoMensualId: 1002, mes: 6, mesNombre: 'Junio',   ano: 2025, estado: 'RS',  fechaCreacion: '3 jul 2025'  },
  { pagoMensualId: 1003, mes: 5, mesNombre: 'Mayo',    ano: 2025, estado: 'PRS', fechaCreacion: '2 jun 2025'  },
  { pagoMensualId: 1004, mes: 4, mesNombre: 'Abril',   ano: 2025, estado: 'AS',  fechaCreacion: '5 may 2025'  },
  { pagoMensualId: 1005, mes: 3, mesNombre: 'Marzo',   ano: 2025, estado: 'AP',  fechaCreacion: '3 abr 2025'  },
  { pagoMensualId: 1006, mes: 2, mesNombre: 'Febrero', ano: 2025, estado: 'RO',  fechaCreacion: '4 mar 2025'  },
];

@Component({
  selector: 'app-solicitudes-contratista',
  standalone: true,
  imports: [EstadoChipComponent, EmptyStateComponent, DataTableComponent, TableRowDirective, TableCardDirective, TabBarComponent, SingleSelectDropdownComponent],
  templateUrl: './solicitudes-contratista.component.html',
})
export class SolicitudesContratistaComponent {
  // ── Layout ────────────────────────────────────────────────────────────────
  readonly mainCls = MAIN_WIDE;
  readonly hdrCls  = HDR_WIDE;

  // ── Literal class strings — TW scanner requires these to be literals ──────
  readonly backBtnCls =
    'inline-flex items-center gap-1.5 text-sm font-medium text-white/80 hover:text-white transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white rounded';

  readonly primaryBtnCls =
    'inline-flex items-center justify-center gap-1.5 rounded-md bg-[#731514] px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#5e1212] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';


  readonly verSoporteBtnCls =
    'inline-flex items-center justify-center gap-1.5 min-w-[10.5rem] rounded-md border border-[#731514] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#731514] transition-colors duration-150 hover:bg-[#731514]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly verEstadoBtnCls =
    'inline-flex items-center justify-center gap-1.5 min-w-[10.5rem] rounded-md border border-gray-900 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-900 transition-colors duration-150 hover:bg-gray-900/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly verSoporteFullBtnCls =
    'w-full inline-flex justify-center items-center gap-1.5 rounded-md border border-[#731514] bg-white px-4 py-2.5 text-sm font-semibold text-[#731514] transition-colors duration-150 hover:bg-[#731514]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly verEstadoFullBtnCls =
    'w-full inline-flex justify-center items-center gap-1.5 rounded-md border border-gray-900 bg-white px-4 py-2.5 text-sm font-medium text-gray-900 transition-colors duration-150 hover:bg-gray-900/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly selectCls =
    'block rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors duration-150 focus:border-[#731514] focus:outline-none focus:ring-2 focus:ring-[#731514]/30';

  // ── Column definitions for DataTableComponent ─────────────────────────────
  readonly tableColumns: TableColumn[] = [
    {
      key: 'numContrato',
      header: 'N° Contrato',
      sortable: false,
      thClass: 'w-32 py-3 pl-5 pr-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500',
      skHdr: 'h-2.5 w-10 animate-pulse rounded bg-gray-200',
      skCell: 'h-4 w-10 animate-pulse rounded bg-gray-100',
    },
    {
      key: 'cdp',
      header: 'CDP',
      sortable: false,
      thClass: 'hidden w-24 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 lg:table-cell',
      skHdr: 'hidden h-2.5 w-16 animate-pulse rounded bg-gray-200 lg:block',
      skCell: 'hidden h-4 w-16 animate-pulse rounded bg-gray-100 lg:block',
    },
    {
      key: 'vigenciaCdp',
      header: 'Vigencia CDP',
      sortable: false,
      thClass: 'hidden w-24 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 lg:table-cell',
      skHdr: 'hidden h-2.5 w-24 animate-pulse rounded bg-gray-200 lg:block',
      skCell: 'hidden h-4 w-24 animate-pulse rounded bg-gray-100 lg:block',
    },
    {
      key: 'ano',
      header: 'Año',
      sortable: true,
      thClass: 'w-16 px-3 py-3 text-center',
      skHdr: 'h-2.5 w-20 animate-pulse rounded bg-gray-200',
      skCell: 'h-4 w-10 animate-pulse rounded bg-gray-100',
    },
    {
      key: 'mes',
      header: 'Mes',
      sortable: true,
      thClass: 'w-28 px-3 py-3 text-center',
      skHdr: 'h-2.5 w-16 animate-pulse rounded bg-gray-200',
      skCell: 'h-4 w-16 animate-pulse rounded bg-gray-100',
    },
    {
      key: 'fechaCreacion',
      header: 'Fecha creación',
      sortable: false,
      thClass: 'w-28 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500',
      skHdr: 'h-2.5 w-24 animate-pulse rounded bg-gray-200',
      skCell: 'h-4 w-24 animate-pulse rounded bg-gray-100',
    },
    {
      key: 'estado',
      header: 'Estado',
      sortable: true,
      thClass: 'w-36 px-3 py-3 text-center',
      skHdr: 'h-2.5 flex-1 animate-pulse rounded bg-gray-200',
      skCell: 'h-5 w-24 animate-pulse rounded-full bg-gray-100',
    },
    {
      key: 'accion',
      header: 'Acción',
      sortable: false,
      thClass: 'w-44 py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500',
      skHdr: 'h-2.5 w-28 animate-pulse rounded bg-gray-200',
      skCell: 'h-8 w-28 animate-pulse rounded-md bg-gray-100',
    },
  ];

  // ── Static data ────────────────────────────────────────────────────────────
  readonly meses = MESES;
  readonly anios = ANIOS;
  readonly aniosOptions: SingleSelectOption[] = ANIOS.map((a) => ({ value: String(a), label: String(a) }));
  readonly mesesOptions: SingleSelectOption[] = MESES.map((m) => ({ value: String(m.value), label: m.label }));

  readonly formAnioStr = computed(() => (this.formAnio() != null ? String(this.formAnio()) : ''));
  readonly formMesStr = computed(() => (this.formMes() != null ? String(this.formMes()) : ''));

  // ── Route params ───────────────────────────────────────────────────────────
  readonly numeroContrato: string;
  readonly cdp: string;
  readonly vigenciaCdp: string;

  // ── State ─────────────────────────────────────────────────────────────────
  readonly cargando = signal(true);
  private readonly _solicitudes = signal<SolicitudMock[]>(MOCK_SOLICITUDES);
  readonly filtroActivo = signal<FiltroTab>('accion');
  readonly sortColumn = signal<SortCol | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly formAnio = signal<number | null>(null);
  readonly formMes = signal<number | null>(null);
  readonly formError = signal<string | null>(null);

  readonly solicitudesFiltradas = computed(() => {
    let list = this._solicitudes();
    if (this.filtroActivo() === 'accion') {
      list = list.filter((s) => s.estado === 'CD' || s.estado === 'RS');
    }
    const col = this.sortColumn();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;
    if (col === 'ano') {
      list = [...list].sort((a, b) => ((a.ano - b.ano) || (a.mes - b.mes)) * dir);
    } else if (col === 'mes') {
      list = [...list].sort((a, b) => ((a.mes - b.mes) || (a.ano - b.ano)) * dir);
    } else if (col === 'estado') {
      list = [...list].sort((a, b) => (SORT_PRIORITY[a.estado] - SORT_PRIORITY[b.estado]) * dir);
    }
    return list;
  });

  readonly accionCount = computed(() =>
    this._solicitudes().filter((s) => s.estado === 'CD' || s.estado === 'RS').length,
  );

  readonly tabItems = computed<TabItem[]>(() => [
    { id: 'accion', label: 'Requieren atención', count: this.accionCount() },
    { id: 'todos', label: 'Todos' },
  ]);

  readonly footerText = computed(() => {
    const n = this.solicitudesFiltradas().length;
    return `${n} ${n === 1 ? 'solicitud' : 'solicitudes'}`;
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.numeroContrato = this.route.snapshot.paramMap.get('numeroContrato') ?? '';
    this.cdp = this.route.snapshot.queryParamMap.get('cdp') ?? '';
    this.vigenciaCdp = this.route.snapshot.queryParamMap.get('vigenciaCdp') ?? '';
    setTimeout(() => this.cargando.set(false), 800);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  sortBy(col: string): void {
    const sortCol = col as SortCol;
    if (this.sortColumn() === sortCol) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(sortCol);
      this.sortDirection.set('asc');
    }
  }

  accionBtnClass(estado: EstadoCode): string {
    return estado === 'CD' || estado === 'RS' ? this.verSoporteBtnCls : this.verEstadoBtnCls;
  }

  accionBtnFullClass(estado: EstadoCode): string {
    return estado === 'CD' || estado === 'RS' ? this.verSoporteFullBtnCls : this.verEstadoFullBtnCls;
  }

  accionBtnLabel(estado: EstadoCode): string {
    if (estado === 'CD') return 'Cargar soportes';
    if (estado === 'RS') return 'Corregir soportes';
    return 'Ver detalle';
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  setFormAnio(val: string): void {
    this.formAnio.set(val ? parseInt(val, 10) : null);
    this.formError.set(null);
  }

  setFormMes(val: string): void {
    this.formMes.set(val ? parseInt(val, 10) : null);
    this.formError.set(null);
  }

  crearSolicitud(): void {
    const mes = this.formMes();
    const ano = this.formAnio();
    if (!mes || !ano) {
      this.formError.set('Selecciona el mes y el año antes de crear.');
      return;
    }
    const duplicado = this._solicitudes().some((s) => s.mes === mes && s.ano === ano);
    if (duplicado) {
      this.formError.set('Ya existe una solicitud para ese período.');
      return;
    }
    this.formError.set(null);
    const nueva: SolicitudMock = {
      pagoMensualId: Date.now(),
      mes,
      mesNombre: MES_NOMBRES[mes - 1],
      ano,
      estado: 'CD',
      fechaCreacion: formatFecha(new Date()),
    };
    this._solicitudes.update((list) => [nueva, ...list]);
    this.formMes.set(null);
    this.formAnio.set(null);
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  volverAContratos(): void {
    this.router.navigate(['/gestion-contratista/contratos']);
  }

  verSoporte(pagoMensualId: number): void {
    this.router.navigate(['/gestion-contratista/detalle-soporte', pagoMensualId]);
  }
}
