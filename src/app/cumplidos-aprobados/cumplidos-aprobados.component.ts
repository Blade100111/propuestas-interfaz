import { Component, computed, signal } from '@angular/core';
import {
  DataTableComponent,
  TableColumn,
  TableCardDirective,
  TableRowDirective,
} from '../shared/components/data-table.component';
import { EmptyStateComponent } from '../shared/components/empty-state.component';
import { SearchInputComponent } from '../shared/components/search-input.component';
import {
  MultiSelectDropdownComponent,
  MultiSelectOption,
} from '../shared/components/multi-select-dropdown.component';
import {
  SoportesPanelComponent,
  PanelCumplidoData,
  SoporteDocRevisable,
} from '../shared/components/soportes-panel.component';
import { MAIN_WIDE, HDR_WIDE } from '../shared/layout';
import { OUTLINE_NEUTRAL_BTN } from '../shared/action-btn';

interface CumplidoAprobadoItem {
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
  soportes: SoporteDocRevisable[];
}

type SortCol = 'dependencia' | 'contrato' | 'vigencia' | 'ano' | 'mes';

// ── Static filter options ──────────────────────────────────────────────────

const VIGENCIAS_OPTIONS: MultiSelectOption[] = [
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
];

const ANIOS_OPTIONS: MultiSelectOption[] = [
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
];

const MESES_OPTIONS: MultiSelectOption[] = [
  { value: '1',  label: 'Enero' },
  { value: '2',  label: 'Febrero' },
  { value: '3',  label: 'Marzo' },
  { value: '4',  label: 'Abril' },
  { value: '5',  label: 'Mayo' },
  { value: '6',  label: 'Junio' },
  { value: '7',  label: 'Julio' },
  { value: '8',  label: 'Agosto' },
  { value: '9',  label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

// ── Mock soportes ──────────────────────────────────────────────────────────

const S2: SoporteDocRevisable[] = [
  { id: 1, nombre: 'informe-gestion.pdf',            descripcion: 'INFORME DE GESTIÓN',             observacion: '' },
  { id: 2, nombre: 'certificado-cumplimiento.pdf',   descripcion: 'CERTIFICACIÓN DE CUMPLIMIENTO',  observacion: '' },
];

const S3: SoporteDocRevisable[] = [
  ...S2,
  { id: 3, nombre: 'planilla-salud-pension.pdf',     descripcion: 'SALUD Y PENSIÓN',                observacion: '' },
];

const S2B: SoporteDocRevisable[] = [
  { id: 1, nombre: 'informe-gestion.pdf',            descripcion: 'INFORME DE GESTIÓN',             observacion: '' },
  { id: 2, nombre: 'planilla-salud-pension.pdf',     descripcion: 'SALUD Y PENSIÓN',                observacion: '' },
];

// ── Mock data ──────────────────────────────────────────────────────────────

const MOCK_CUMPLIDOS: CumplidoAprobadoItem[] = [
  {
    pagoMensualId: 6001,
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
    soportes: S3,
  },
  {
    pagoMensualId: 6002,
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
    soportes: S2,
  },
  {
    pagoMensualId: 6003,
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
    soportes: S3,
  },
  {
    pagoMensualId: 6004,
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
    soportes: S2,
  },
  {
    pagoMensualId: 6005,
    dependencia: 'DIV. RECURSOS HUMANOS',
    rubro: 'FUNCIONAMIENTO',
    documento: '51.789.012',
    nombreContratista: 'Diana Carolina Vargas Mendez',
    numeroContrato: '310-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 5,
    mesNombre: 'Mayo',
    ano: 2025,
    soportes: S3,
  },
  {
    pagoMensualId: 6006,
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
    soportes: S2B,
  },
  {
    pagoMensualId: 6007,
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
    soportes: S3,
  },
  {
    pagoMensualId: 6008,
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
    soportes: S2,
  },
  {
    pagoMensualId: 6009,
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
    soportes: S3,
  },
  {
    pagoMensualId: 6010,
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
    soportes: S2,
  },
  {
    pagoMensualId: 6011,
    dependencia: 'OF. ASESORA DE TECNOLOGIAS E INFORMACION',
    rubro: 'FUNCIONAMIENTO',
    documento: '67.123.456',
    nombreContratista: 'Ana Lucia Rodriguez Perez',
    numeroContrato: '333-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 7,
    mesNombre: 'Julio',
    ano: 2025,
    soportes: S2B,
  },
  {
    pagoMensualId: 6012,
    dependencia: 'DIV. FINANCIERA',
    rubro: 'INVERSION',
    documento: '23.567.890',
    nombreContratista: 'Roberto Camilo Medina Suarez',
    numeroContrato: '855-2024',
    vigencia: 2024,
    esOtroSi: false,
    mes: 12,
    mesNombre: 'Diciembre',
    ano: 2024,
    soportes: S3,
  },
];

@Component({
  selector: 'app-cumplidos-aprobados',
  standalone: true,
  imports: [
    DataTableComponent,
    TableRowDirective,
    TableCardDirective,
    EmptyStateComponent,
    SearchInputComponent,
    MultiSelectDropdownComponent,
    SoportesPanelComponent,
  ],
  templateUrl: './cumplidos-aprobados.component.html',
})
export class CumplidosAprobadosComponent {
  // ── Layout ─────────────────────────────────────────────────────────────────
  readonly mainCls = MAIN_WIDE;
  readonly hdrCls = HDR_WIDE;

  // ── State ──────────────────────────────────────────────────────────────────
  readonly cargando = signal(true);
  readonly cumplidos = signal<CumplidoAprobadoItem[]>(MOCK_CUMPLIDOS);
  readonly busqueda = signal('');
  readonly filtroVigencias = signal<string[]>([]);
  readonly filtroAnios = signal<string[]>([]);
  readonly filtroMeses = signal<string[]>([]);
  readonly sortColumn = signal<SortCol | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly selectedItem = signal<CumplidoAprobadoItem | null>(null);

  // ── Panel config ───────────────────────────────────────────────────────────
  readonly panelActionableEstados: string[] = [];

  // ── Static filter options ──────────────────────────────────────────────────
  readonly vigenciasOptions = VIGENCIAS_OPTIONS;
  readonly aniosOptions = ANIOS_OPTIONS;
  readonly mesesOptions = MESES_OPTIONS;

  // ── Computed ───────────────────────────────────────────────────────────────
  readonly hayFiltrosActivos = computed(
    () =>
      this.busqueda() !== '' ||
      this.filtroVigencias().length > 0 ||
      this.filtroAnios().length > 0 ||
      this.filtroMeses().length > 0,
  );

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
    if (this.filtroVigencias().length > 0) {
      list = list.filter((c) => this.filtroVigencias().includes(String(c.vigencia)));
    }
    if (this.filtroAnios().length > 0) {
      list = list.filter((c) => this.filtroAnios().includes(String(c.ano)));
    }
    if (this.filtroMeses().length > 0) {
      list = list.filter((c) => this.filtroMeses().includes(String(c.mes)));
    }

    const col = this.sortColumn();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;

    if (col === 'dependencia') {
      list = [...list].sort((a, b) => a.dependencia.localeCompare(b.dependencia) * dir);
    } else if (col === 'contrato') {
      list = [...list].sort((a, b) => a.numeroContrato.localeCompare(b.numeroContrato) * dir);
    } else if (col === 'vigencia') {
      list = [...list].sort((a, b) => (a.vigencia - b.vigencia) * dir);
    } else if (col === 'ano') {
      list = [...list].sort((a, b) => (a.ano - b.ano) * dir);
    } else if (col === 'mes') {
      list = [...list].sort((a, b) => (a.mes - b.mes) * dir);
    }

    return list;
  });

  readonly footerText = computed(() => {
    const n = this.cumplidosFiltrados().length;
    const total = this.cumplidos().length;
    if (n === total) return `${n} cumplido${n !== 1 ? 's' : ''} aprobado${n !== 1 ? 's' : ''}`;
    return `${n} de ${total} cumplidos aprobados`;
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
      estado: 'AP',
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
      key: 'ano',
      header: 'A\u00f1o',
      sortable: true,
      thClass: 'px-3 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500',
      skHdr: 'h-2.5 w-10 animate-pulse rounded bg-gray-200',
      skCell: 'h-4 w-12 animate-pulse rounded bg-gray-100',
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
      key: 'accion',
      header: '',
      sortable: false,
      thClass: 'py-3.5 pl-3 pr-5',
      skHdr: 'h-2.5 w-8 animate-pulse rounded bg-gray-200',
      skCell: 'h-7 w-24 animate-pulse rounded-md bg-gray-100 mx-auto',
    },
  ];

  // ── Literal class strings ──────────────────────────────────────────────────
  readonly labelCls =
    'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400';

  readonly limpiarBtnCls =
    'inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors duration-150 hover:border-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly verBtnCls = OUTLINE_NEUTRAL_BTN;

  readonly rubroInversionCls =
    'inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700';

  readonly rubroFuncionamientoCls =
    'inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600';

  // ── Helpers ────────────────────────────────────────────────────────────────
  rubroBadgeClass(rubro: string): string {
    return rubro === 'INVERSION' ? this.rubroInversionCls : this.rubroFuncionamientoCls;
  }

  rubroLabel(rubro: string): string {
    return rubro === 'INVERSION' ? 'Inversi\u00f3n' : 'Funcionamiento';
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
  abrirPanel(item: CumplidoAprobadoItem): void {
    this.selectedItem.set(item);
  }

  cerrarPanel(): void {
    this.selectedItem.set(null);
  }

  // ── Filters ────────────────────────────────────────────────────────────────
  limpiarFiltros(): void {
    this.busqueda.set('');
    this.filtroVigencias.set([]);
    this.filtroAnios.set([]);
    this.filtroMeses.set([]);
  }

  constructor() {
    setTimeout(() => this.cargando.set(false), 900);
  }
}
