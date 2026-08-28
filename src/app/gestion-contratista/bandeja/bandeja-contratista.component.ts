import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface ContratoMock {
  id: number;
  numeroContrato: string;
  objeto: string;
  tipoContrato: string;
  vigencia: number;
  mes: string;
  estado: 'CD' | 'PRS' | 'AS' | 'AP' | 'RS' | 'RO';
  pagoMensualId: number;
}

export type EstadoFilter = 'todos' | 'accionables' | 'CD' | 'PRS' | 'AS' | 'AP' | 'RS' | 'RO';

interface EstadoConfig {
  label: string;
  /** Full Tailwind class string — must be literal so TW scanner compiles it. */
  chipClass: string;
  esAccionable: boolean;
}

const ESTADO_CONFIG: Record<string, EstadoConfig> = {
  CD:  { label: 'Creado',           chipClass: 'bg-[#FF9311] text-gray-900',  esAccionable: true  },
  PRS: { label: 'En revisión',      chipClass: 'bg-[#FFB051] text-gray-900',  esAccionable: false },
  AS:  { label: 'Aprobado Sup.',    chipClass: 'bg-[#218B22] text-white',     esAccionable: false },
  AP:  { label: 'Aprobado',         chipClass: 'bg-[#218B22] text-white',     esAccionable: false },
  RS:  { label: 'Rechazado Sup.',   chipClass: 'bg-[#930E10] text-white',     esAccionable: true  },
  RO:  { label: 'Rechazado Ord.',   chipClass: 'bg-gray-500 text-white',      esAccionable: false },
};

/** Accionables (CD, RS) aparecen primero; AP y RO van al fondo. */
const SORT_PRIORITY: Record<string, number> = {
  CD: 1, RS: 2, PRS: 3, AS: 4, AP: 5, RO: 6,
};

const MOCK_CONTRATOS: ContratoMock[] = [
  {
    id: 1,
    numeroContrato: '789-2025',
    objeto: 'Prestación de servicios profesionales en soporte y mantenimiento de sistemas de información para la Oficina de Sistemas e Informática',
    tipoContrato: 'Prestación de Servicios',
    vigencia: 2025,
    mes: 'Julio',
    estado: 'CD',
    pagoMensualId: 1001,
  },
  {
    id: 2,
    numeroContrato: '654-2025',
    objeto: 'Apoyo técnico en actividades de digitalización y gestión documental del archivo central universitario',
    tipoContrato: 'Prestación de Servicios',
    vigencia: 2025,
    mes: 'Julio',
    estado: 'RS',
    pagoMensualId: 1002,
  },
  {
    id: 3,
    numeroContrato: '512-2025',
    objeto: 'Servicios profesionales de consultoría en diseño curricular para el programa de Ingeniería de Sistemas',
    tipoContrato: 'Consultoría',
    vigencia: 2025,
    mes: 'Julio',
    estado: 'PRS',
    pagoMensualId: 1003,
  },
  {
    id: 4,
    numeroContrato: '401-2025',
    objeto: 'Prestación de servicios de apoyo en la coordinación académica y logística de eventos institucionales de la Facultad de Ingeniería',
    tipoContrato: 'Prestación de Servicios',
    vigencia: 2025,
    mes: 'Junio',
    estado: 'AS',
    pagoMensualId: 1004,
  },
  {
    id: 5,
    numeroContrato: '310-2025',
    objeto: 'Servicios especializados en desarrollo de contenidos pedagógicos para plataforma de educación virtual',
    tipoContrato: 'Consultoría',
    vigencia: 2025,
    mes: 'Junio',
    estado: 'AP',
    pagoMensualId: 1005,
  },
  {
    id: 6,
    numeroContrato: '201-2025',
    objeto: 'Prestación de servicios técnicos en mantenimiento preventivo y correctivo de infraestructura de red de datos',
    tipoContrato: 'Prestación de Servicios',
    vigencia: 2025,
    mes: 'Mayo',
    estado: 'RO',
    pagoMensualId: 1006,
  },
];

@Component({
  selector: 'app-bandeja-contratista',
  standalone: true,
  imports: [],
  templateUrl: './bandeja-contratista.component.html',
})
export class BandejaContratistaComponent {
  // ── Literal class strings kept here so TW scanner compiles them ──────────
  readonly activeTabCls =
    'flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-semibold border-b-2 border-[#731514] text-[#731514] transition-colors duration-150 focus-visible:outline-none';
  readonly inactiveTabCls =
    'flex items-center gap-1.5 whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300 transition-colors duration-150 focus-visible:outline-none';
  readonly activeBadgeCls =
    'rounded-full px-1.5 py-px text-xs font-bold leading-none bg-[#f3e8e8] text-[#731514]';
  readonly inactiveBadgeCls =
    'rounded-full px-1.5 py-px text-xs font-semibold leading-none bg-gray-100 text-gray-500';
  readonly primaryBtnCls =
    'inline-flex items-center gap-1.5 rounded-md bg-[#731514] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#5e1212] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';
  readonly secondaryBtnCls =
    'inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50 hover:border-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';
  readonly primaryBtnFullCls =
    'w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#731514] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#5e1212] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';
  readonly secondaryBtnFullCls =
    'w-full inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50 hover:border-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  // ── Tabs ─────────────────────────────────────────────────────────────────
  readonly tabs: { key: EstadoFilter; label: string }[] = [
    { key: 'accionables', label: 'Requieren acción' },
    { key: 'todos',       label: 'Todos'            },
  ];

  // ── State ────────────────────────────────────────────────────────────────
  readonly filtroActivo = signal<EstadoFilter>('accionables');
  readonly cargando = signal(true);

  private readonly _contratos = signal<ContratoMock[]>(MOCK_CONTRATOS);

  readonly contratosFiltrados = computed(() => {
    const filtro = this.filtroActivo();
    const lista =
      filtro === 'todos'
        ? [...this._contratos()]
        : filtro === 'accionables'
          ? this._contratos().filter((c) => c.estado === 'CD' || c.estado === 'RS')
          : this._contratos().filter((c) => c.estado === filtro);
    return lista.sort(
      (a, b) => (SORT_PRIORITY[a.estado] ?? 99) - (SORT_PRIORITY[b.estado] ?? 99),
    );
  });

  readonly conteosPorEstado = computed(() => {
    const cuentas: Record<string, number> = { todos: 0, accionables: 0 };
    for (const c of this._contratos()) {
      cuentas['todos']++;
      cuentas[c.estado] = (cuentas[c.estado] ?? 0) + 1;
      if (c.estado === 'CD' || c.estado === 'RS') {
        cuentas['accionables']++;
      }
    }
    return cuentas;
  });

  constructor(private readonly router: Router) {
    // Simulate async data fetch
    setTimeout(() => this.cargando.set(false), 1100);
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  tabClass(key: EstadoFilter): string {
    return this.filtroActivo() === key ? this.activeTabCls : this.inactiveTabCls;
  }

  badgeClass(key: EstadoFilter): string {
    return this.filtroActivo() === key ? this.activeBadgeCls : this.inactiveBadgeCls;
  }

  chipClass(estado: string): string {
    return ESTADO_CONFIG[estado]?.chipClass ?? 'bg-gray-300 text-gray-800';
  }

  chipLabel(estado: string): string {
    return ESTADO_CONFIG[estado]?.label ?? estado;
  }

  esAccionable(estado: string): boolean {
    return ESTADO_CONFIG[estado]?.esAccionable ?? false;
  }

  tabAriaLabel(key: EstadoFilter): string {
    return key === 'accionables'
      ? 'Filtrar: contratos que requieren acción'
      : 'Ver todos los contratos';
  }

  seleccionarFiltro(key: EstadoFilter): void {
    this.filtroActivo.set(key);
  }

  verSoporte(pagoMensualId: number): void {
    this.router.navigate(['/gestion-contratista/detalle-soporte', pagoMensualId]);
  }
}
