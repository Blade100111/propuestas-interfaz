import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

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

interface EstadoConfig {
  label: string;
  chipClass: string;
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

const ESTADO_CONFIG: Record<string, EstadoConfig> = {
  CD:  { label: 'Creado',         chipClass: 'bg-[#FF9311] text-gray-900' },
  PRS: { label: 'En revisión',    chipClass: 'bg-[#FFB051] text-gray-900' },
  AS:  { label: 'Aprobado Sup.',  chipClass: 'bg-[#218B22] text-white'    },
  AP:  { label: 'Aprobado',       chipClass: 'bg-[#218B22] text-white'    },
  RS:  { label: 'Rechazado Sup.', chipClass: 'bg-[#930E10] text-white'    },
  RO:  { label: 'Rechazado Ord.', chipClass: 'bg-gray-500 text-white'     },
};

const SORT_PRIORITY: Record<string, number> = {
  CD: 1, RS: 2, PRS: 3, AS: 4, AP: 5, RO: 6,
};

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
  imports: [],
  templateUrl: './solicitudes-contratista.component.html',
})
export class SolicitudesContratistaComponent {
  // ── Literal class strings — TW scanner requires these to be literals ──────
  readonly backBtnCls =
    'inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514] rounded';

  // Form "Crear solicitud" button
  readonly primaryBtnCls =
    'inline-flex items-center justify-center gap-1.5 rounded-md bg-[#731514] px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#5e1212] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  // Mobile full-width action button
  readonly primaryBtnFullCls =
    'w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#731514] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#5e1212] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  // Row action — crimson for actionable states (CD/RS): contratista must act
  // min-w + justify-center normalizes all variants to the width of the longest label
  readonly verSoporteBtnCls =
    'inline-flex items-center justify-center gap-1.5 min-w-[10.5rem] rounded-md bg-[#731514] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#5e1212] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  // Row action — ghost for non-actionable states (PRS/AS/AP/RO): just view
  readonly verEstadoBtnCls =
    'inline-flex items-center justify-center gap-1.5 min-w-[10.5rem] rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50 hover:border-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly selectCls =
    'block rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors duration-150 focus:border-[#731514] focus:outline-none focus:ring-2 focus:ring-[#731514]/30';

  readonly tabActiveCls =
    'border-b-2 border-[#731514] px-3 pb-3 pt-3 text-sm font-semibold text-[#731514] focus-visible:outline-none whitespace-nowrap';

  readonly tabInactiveCls =
    'border-b-2 border-transparent px-3 pb-3 pt-3 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors duration-150 focus-visible:outline-none whitespace-nowrap';

  readonly sortBtnCls =
    'flex w-full items-center justify-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors duration-150 focus-visible:outline-none';

  // ── Static data ────────────────────────────────────────────────────────────
  readonly meses = MESES;
  readonly anios = ANIOS;

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
  chipClass(estado: string): string {
    const color = ESTADO_CONFIG[estado]?.chipClass ?? 'bg-gray-300 text-gray-800';
    return `${color} inline-flex items-center justify-center min-w-[7.5rem] rounded-full px-2.5 py-0.5 text-xs font-semibold`;
  }

  chipLabel(estado: string): string {
    return ESTADO_CONFIG[estado]?.label ?? estado;
  }

  tabClass(tab: FiltroTab): string {
    return this.filtroActivo() === tab ? this.tabActiveCls : this.tabInactiveCls;
  }

  sortBy(col: SortCol): void {
    if (this.sortColumn() === col) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(col);
      this.sortDirection.set('asc');
    }
  }

  sortIcon(col: SortCol): string {
    if (this.sortColumn() !== col) return '↕';
    return this.sortDirection() === 'asc' ? '↑' : '↓';
  }

  accionBtnClass(estado: EstadoCode): string {
    return estado === 'CD' || estado === 'RS' ? this.verSoporteBtnCls : this.verEstadoBtnCls;
  }

  accionBtnLabel(estado: EstadoCode): string {
    if (estado === 'CD') return 'Cargar soportes';
    if (estado === 'RS') return 'Corregir soportes';
    return 'Ver detalle';
  }

  // ── Form ──────────────────────────────────────────────────────────────────
  setFormAnio(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
    this.formAnio.set(val ? parseInt(val, 10) : null);
    this.formError.set(null);
  }

  setFormMes(event: Event): void {
    const val = (event.target as HTMLSelectElement).value;
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
