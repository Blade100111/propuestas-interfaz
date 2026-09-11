import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { EmptyStateComponent } from '../../shared/components/empty-state.component';
import { SearchInputComponent } from '../../shared/components/search-input.component';
import {
  DataTableComponent,
  TableCardDirective,
  TableColumn,
  TableRowDirective,
} from '../../shared/components/data-table.component';
import { SessionService } from '../../shared/services/session.service';
import { MAIN_WIDE, HDR_WIDE } from '../../shared/layout';
import { OUTLINE_CRIMSON_BTN } from '../../shared/action-btn';

type SortCol = 'numero' | 'vigencia' | 'tipo' | 'dependencia';

export interface ContratoItem {
  id: number;
  numeroContratoSuscrito: string;
  vigencia: number;
  tipoContrato: string;
  esOtroSi: boolean;
  numeroRp: number;
  numeroCdp: number;
  // VigenciaCdp viene del backend (ContratoDisponibilidadRp). Junto con NumeroCdp
  // forma la clave compuesta que identifica el registro de contrato. Ambos se
  // pasan como query params (?cdp=X&vigenciaCdp=Y) a la ruta de solicitudes.
  vigenciaCdp: number;
  nombreDependencia: string;
}

const MOCK_CONTRATOS: ContratoItem[] = [
  {
    id: 1,
    numeroContratoSuscrito: '789-2025',
    vigencia: 2025,
    tipoContrato: 'INICIAL',
    esOtroSi: false,
    numeroRp: 11546,
    numeroCdp: 4256,
    vigenciaCdp: 2025,
    nombreDependencia: 'OFICINA ASESORA DE TECNOLOGÍAS E INFORMACIÓN',
  },
  {
    id: 2,
    numeroContratoSuscrito: '654-2025',
    vigencia: 2025,
    tipoContrato: 'INICIAL',
    esOtroSi: false,
    numeroRp: 10832,
    numeroCdp: 3981,
    vigenciaCdp: 2025,
    nombreDependencia: 'VICERRECTORÍA ACADÉMICA',
  },
  {
    id: 3,
    numeroContratoSuscrito: '654-2025',
    vigencia: 2025,
    tipoContrato: 'OTRO SÍ 1',
    esOtroSi: true,
    numeroRp: 10833,
    numeroCdp: 3982,
    vigenciaCdp: 2025,
    nombreDependencia: 'VICERRECTORÍA ACADÉMICA',
  },
  {
    id: 4,
    numeroContratoSuscrito: '512-2025',
    vigencia: 2025,
    tipoContrato: 'INICIAL',
    esOtroSi: false,
    numeroRp: 9714,
    numeroCdp: 3540,
    vigenciaCdp: 2025,
    nombreDependencia: 'FACULTAD DE INGENIERÍA',
  },
  {
    id: 5,
    numeroContratoSuscrito: '401-2025',
    vigencia: 2025,
    tipoContrato: 'INICIAL',
    esOtroSi: false,
    numeroRp: 8803,
    vigenciaCdp: 2025,
    numeroCdp: 3128,
    nombreDependencia: 'FACULTAD DE CIENCIAS Y EDUCACIÓN',
  },
  {
    id: 6,
    numeroContratoSuscrito: '310-2025',
    vigencia: 2025,
    tipoContrato: 'INICIAL',
    esOtroSi: false,
    numeroRp: 7621,
    numeroCdp: 2894,
    vigenciaCdp: 2025,
    nombreDependencia: 'DIVISIÓN DE RECURSOS HUMANOS',
  },
  {
    id: 7,
    numeroContratoSuscrito: '201-2025',
    vigencia: 2025,
    tipoContrato: 'INICIAL',
    esOtroSi: false,
    numeroRp: 6430,
    numeroCdp: 2501,
    vigenciaCdp: 2025,
    nombreDependencia: 'DIRECCIÓN DE BIENESTAR INSTITUCIONAL',
  },
];

@Component({
  selector: 'app-contratos-contratista',
  standalone: true,
  imports: [EmptyStateComponent, SearchInputComponent, DataTableComponent, TableRowDirective, TableCardDirective],
  templateUrl: './contratos-contratista.component.html',
})
export class ContratosContratistaComponent {
  protected readonly session = inject(SessionService);

  // ── Layout ────────────────────────────────────────────────────────────────
  readonly mainCls = MAIN_WIDE;
  readonly hdrCls = HDR_WIDE;

  // ── Literal class strings — TW scanner requires these to be literals ──────
  readonly primaryBtnCls = OUTLINE_CRIMSON_BTN;
  readonly primaryBtnFullCls =
    'w-full inline-flex justify-center items-center gap-1.5 rounded-md border border-[#731514] bg-white px-4 py-2.5 text-sm font-semibold text-[#731514] transition-colors duration-150 hover:bg-[#731514]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';
  readonly tipoBadgeInicialCls =
    'inline-flex shrink-0 items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500';
  readonly tipoBadgeOtroSiCls =
    'inline-flex shrink-0 items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700';
  readonly rowNormalCls =
    'transition-colors duration-100 hover:bg-[#731514]/5';
  readonly rowOtroSiCls =
    'bg-gray-50/50 transition-colors duration-100 hover:bg-[#731514]/5';

  // ── Column definitions for DataTableComponent ─────────────────────────────
  // skHdr / skCell deben ser literales aquí para que el scanner de Tailwind
  // los incluya en el bundle (los usa DataTableComponent vía [class] dinámico).
  readonly tableColumns: TableColumn[] = [
    {
      key: 'numero',
      header: 'N° Contrato',
      sortable: true,
      thClass: 'w-36 py-3 pl-5 pr-3 text-center',
      skHdr: 'h-2.5 w-28 animate-pulse rounded bg-gray-200',
      skCell: 'h-4 w-24 animate-pulse rounded bg-gray-100',
    },
    {
      key: 'vigencia',
      header: 'Vigencia',
      sortable: true,
      thClass: 'w-20 px-3 py-3 text-center',
      skHdr: 'h-2.5 w-14 animate-pulse rounded bg-gray-200',
      skCell: 'h-4 w-12 animate-pulse rounded bg-gray-100',
    },
    {
      key: 'tipo',
      header: 'Tipo',
      sortable: true,
      thClass: 'w-36 px-3 py-3 text-center',
      skHdr: 'h-2.5 w-20 animate-pulse rounded bg-gray-200',
      skCell: 'h-5 w-20 animate-pulse rounded-full bg-gray-100',
    },
    {
      key: 'rp',
      header: 'RP',
      sortable: false,
      thClass: 'hidden w-24 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 lg:table-cell',
      skHdr: 'hidden h-2.5 w-14 animate-pulse rounded bg-gray-200 lg:block',
      skCell: 'hidden h-4 w-14 animate-pulse rounded bg-gray-100 lg:block',
    },
    {
      key: 'cdp',
      header: 'CDP',
      sortable: false,
      thClass: 'hidden w-24 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 lg:table-cell',
      skHdr: 'hidden h-2.5 w-14 animate-pulse rounded bg-gray-200 lg:block',
      skCell: 'hidden h-4 w-14 animate-pulse rounded bg-gray-100 lg:block',
    },
    {
      key: 'dependencia',
      header: 'Dependencia',
      sortable: true,
      thClass: 'w-56 px-3 py-3 text-center',
      skHdr: 'h-2.5 flex-1 animate-pulse rounded bg-gray-200',
      skCell: 'h-4 flex-1 animate-pulse rounded bg-gray-100',
    },
    {
      key: 'accion',
      header: 'Acción',
      sortable: false,
      thClass: 'w-44 py-3 px-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500',
      skHdr: 'h-2.5 w-28 animate-pulse rounded bg-gray-200',
      skCell: 'h-8 w-36 animate-pulse rounded-md bg-gray-100',
    },
  ];

  // ── State ─────────────────────────────────────────────────────────────────
  readonly cargando = signal(true);
  readonly contratos = signal<ContratoItem[]>(MOCK_CONTRATOS);
  readonly busqueda = signal('');
  readonly sortColumn = signal<SortCol | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');

  readonly contratosFiltrados = computed(() => {
    const q = this.busqueda().toLowerCase().trim();
    let list = this.contratos();
    if (q) {
      list = list.filter((c) => c.numeroContratoSuscrito.toLowerCase().includes(q));
    }
    const col = this.sortColumn();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;
    if (col === 'numero') {
      list = [...list].sort((a, b) => a.numeroContratoSuscrito.localeCompare(b.numeroContratoSuscrito) * dir);
    } else if (col === 'vigencia') {
      list = [...list].sort((a, b) => (a.vigencia - b.vigencia) * dir);
    } else if (col === 'tipo') {
      list = [...list].sort((a, b) => a.tipoContrato.localeCompare(b.tipoContrato) * dir);
    } else if (col === 'dependencia') {
      list = [...list].sort((a, b) => a.nombreDependencia.localeCompare(b.nombreDependencia) * dir);
    }
    return list;
  });

  // Footer text para DataTableComponent.
  // Desktop: incluye "filtrando N totales" cuando hay búsqueda activa.
  // Mobile: solo el conteo (sin la parte de filtrando).
  readonly footerText = computed(() => {
    const n = this.contratosFiltrados().length;
    let txt = `${n} ${n === 1 ? 'contrato activo' : 'contratos activos'}`;
    if (this.busqueda().trim()) {
      txt += ` \u2014 filtrando ${this.contratos().length} totales`;
    }
    return txt;
  });

  readonly mobileFooterText = computed(() => {
    const n = this.contratosFiltrados().length;
    return `${n} ${n === 1 ? 'contrato activo' : 'contratos activos'}`;
  });

  // Función de clase de fila — OtroSí tiene fondo diferenciado.
  readonly contratoRowClass = (row: ContratoItem): string =>
    row.esOtroSi ? this.rowOtroSiCls : this.rowNormalCls;

  constructor(private readonly router: Router) {
    setTimeout(() => this.cargando.set(false), 1100);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  tipoBadgeClass(contrato: ContratoItem): string {
    return contrato.esOtroSi ? this.tipoBadgeOtroSiCls : this.tipoBadgeInicialCls;
  }

  sortBy(col: string): void {
    const sortCol = col as SortCol;
    if (this.sortColumn() === sortCol) {
      this.sortDirection.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortColumn.set(sortCol);
      this.sortDirection.set('asc');
    }
  }

  // ESQUEMA TEMPORAL: NumeroCdp + VigenciaCdp como query params porque el endpoint
  // contratos_contratista/{doc} no devuelve un ID de BD por registro. Pendiente
  // confirmar con la oficina si CDP+vigencia es la clave definitiva en cumplidos_mf
  // o si se expondrá un ID estable (ver DIAGNOSTICO_ARQUITECTURA.md § 5).
  solicitarCumplido(contrato: ContratoItem): void {
    this.router.navigate(
      ['/gestion-contratista/contratos', contrato.numeroContratoSuscrito, 'solicitudes'],
      { queryParams: { cdp: contrato.numeroCdp, vigenciaCdp: contrato.vigenciaCdp } },
    );
  }
}
