import { Component, computed, signal } from '@angular/core';
import { Router } from '@angular/router';

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
  imports: [],
  templateUrl: './contratos-contratista.component.html',
})
export class ContratosContratistaComponent {
  // ── Literal class strings — TW scanner requires these to be literals ──────
  readonly primaryBtnCls =
    'inline-flex items-center gap-1.5 rounded-md bg-[#731514] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#5e1212] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';
  readonly primaryBtnFullCls =
    'w-full inline-flex items-center justify-center gap-2 rounded-md bg-[#731514] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#5e1212] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';
  readonly tipoBadgeInicialCls =
    'inline-flex shrink-0 items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500';
  readonly tipoBadgeOtroSiCls =
    'inline-flex shrink-0 items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-700';
  readonly rowNormalCls =
    'transition-colors duration-100 hover:bg-[#731514]/5';
  readonly rowOtroSiCls =
    'bg-gray-50/50 transition-colors duration-100 hover:bg-[#731514]/5';
  readonly searchInputCls =
    'block w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors duration-150 focus:border-[#731514] focus:outline-none focus:ring-2 focus:ring-[#731514]/20';
  readonly sortBtnCls =
    'flex w-full items-center justify-center gap-1 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors duration-150 focus-visible:outline-none';

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
      list = list.filter(
        (c) =>
          c.numeroContratoSuscrito.toLowerCase().includes(q) ||
          c.nombreDependencia.toLowerCase().includes(q),
      );
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

  constructor(private readonly router: Router) {
    setTimeout(() => this.cargando.set(false), 1100);
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  tipoBadgeClass(contrato: ContratoItem): string {
    return contrato.esOtroSi ? this.tipoBadgeOtroSiCls : this.tipoBadgeInicialCls;
  }

  rowClass(contrato: ContratoItem): string {
    return contrato.esOtroSi ? this.rowOtroSiCls : this.rowNormalCls;
  }

  setBusqueda(event: Event): void {
    this.busqueda.set((event.target as HTMLInputElement).value);
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
