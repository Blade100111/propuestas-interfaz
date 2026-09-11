import { Component, computed, signal } from '@angular/core';
import {
  DataTableComponent,
  TableColumn,
  TableCardDirective,
  TableRowDirective,
} from '../shared/components/data-table.component';
import { EstadoChipComponent } from '../shared/components/estado-chip.component';
import { EmptyStateComponent } from '../shared/components/empty-state.component';
import {
  HistoricoDetallePanelComponent,
  CumplidoHistoricoItem,
  SoporteHistorico,
} from './historico-detalle-panel.component';
import {
  MultiSelectDropdownComponent,
  MultiSelectOption,
} from '../shared/components/multi-select-dropdown.component';
import { MAIN_WIDE, HDR_WIDE } from '../shared/layout';
import { SORT_PRIORITY, ESTADO_CONFIG } from '../shared/estado.constants';

type SortCol = 'dependencia' | 'contrato' | 'mes' | 'ano' | 'estado';

// ── Static filter options ──────────────────────────────────────────────────

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

const VIGENCIAS_OPTIONS: MultiSelectOption[] = [
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
];

const ESTADOS_OPTIONS: MultiSelectOption[] = Object.entries(ESTADO_CONFIG).map(
  ([code, cfg]) => ({ value: code, label: `${cfg.label} (${code})` }),
);

// Includes both current and old dependencia names (per instructivo)
const DEPENDENCIAS_OPTIONS: MultiSelectOption[] = [
  { value: 'DIV. FINANCIERA',                          label: 'DIV. FINANCIERA' },
  { value: 'DIV. RECURSOS HUMANOS',                    label: 'DIV. RECURSOS HUMANOS' },
  { value: 'FACULTAD DE INGENIERIA',                   label: 'FACULTAD DE INGENIERIA' },
  { value: 'OF. ASESORA DE TECNOLOGIAS E INFORMACION', label: 'OF. ASESORA DE TECNOLOGIAS E INFORMACION' },
  { value: 'OF. SISTEMATIZACION E INFORMATICA',        label: 'OF. SISTEMATIZACION E INFORMATICA (ant.)' },
];

// ── Mock data ──────────────────────────────────────────────────────────────

const S2: SoporteHistorico[] = [
  { id: 1, nombre: 'informe-gestion.pdf', descripcion: 'Informe de gestion del periodo correspondiente' },
  { id: 2, nombre: 'soporte-actividades.pdf', descripcion: 'Evidencias de actividades realizadas segun objeto contractual' },
];

const S3: SoporteHistorico[] = [
  ...S2,
  { id: 3, nombre: 'certificado-pago.pdf', descripcion: 'Certificado de no mora con entidades de seguridad social' },
];

const MOCK_CUMPLIDOS: CumplidoHistoricoItem[] = [
  {
    pagoMensualId: 5001,
    numeroCps: '5001',
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
    estado: 'AP',
    historial: [
      { estado: 'CD',  responsable: 'Sistema',                       cargo: 'Automatico',                 fecha: '2025-07-01' },
      { estado: 'PRS', responsable: 'Carlos Andres Martinez Lopez',   cargo: 'CONTRATISTA',                fecha: '2025-07-05' },
      { estado: 'AS',  responsable: 'Maria Fernanda Ospina Ruiz',     cargo: 'Coordinadora de Sistemas',   fecha: '2025-08-02' },
      { estado: 'AP',  responsable: 'Jorge Enrique Ramirez Castillo', cargo: 'Ordenador del Gasto',        fecha: '2025-09-01' },
    ],
    soportes: S3,
  },
  {
    pagoMensualId: 5002,
    numeroCps: '5002',
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
    estado: 'PRS',
    historial: [
      { estado: 'CD',  responsable: 'Sistema',                     cargo: 'Automatico',  fecha: '2025-07-01' },
      { estado: 'PRS', responsable: 'Laura Sofia Restrepo Diaz',   cargo: 'CONTRATISTA', fecha: '2025-07-06' },
    ],
    soportes: S2,
  },
  {
    pagoMensualId: 5003,
    numeroCps: '5003',
    dependencia: 'OF. SISTEMATIZACION E INFORMATICA',
    rubro: 'INVERSION',
    documento: '52.345.678',
    nombreContratista: 'Carlos Andres Martinez Lopez',
    numeroContrato: '789-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 5,
    mesNombre: 'Mayo',
    ano: 2025,
    estado: 'AP',
    historial: [
      { estado: 'CD',  responsable: 'Sistema',                       cargo: 'Automatico',                 fecha: '2025-05-01' },
      { estado: 'PRS', responsable: 'Carlos Andres Martinez Lopez',   cargo: 'CONTRATISTA',                fecha: '2025-05-08' },
      { estado: 'AS',  responsable: 'Maria Fernanda Ospina Ruiz',     cargo: 'Coordinadora de Sistemas',   fecha: '2025-06-03' },
      { estado: 'AP',  responsable: 'Jorge Enrique Ramirez Castillo', cargo: 'Ordenador del Gasto',        fecha: '2025-06-28' },
    ],
    soportes: S3,
  },
  {
    pagoMensualId: 5004,
    numeroCps: '5004',
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
    estado: 'RS',
    historial: [
      { estado: 'CD',  responsable: 'Sistema',                     cargo: 'Automatico',                fecha: '2025-07-01' },
      { estado: 'PRS', responsable: 'Juan David Herrera Ruiz',     cargo: 'CONTRATISTA',               fecha: '2025-07-04' },
      { estado: 'RS',  responsable: 'Maria Fernanda Ospina Ruiz',  cargo: 'Coordinadora de Sistemas',  fecha: '2025-07-28' },
    ],
    soportes: S2,
  },
  {
    pagoMensualId: 5005,
    numeroCps: '5005',
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
    historial: [
      { estado: 'CD',  responsable: 'Sistema',                     cargo: 'Automatico',                fecha: '2025-07-01' },
      { estado: 'PRS', responsable: 'Andrea Milena Parra Torres',  cargo: 'CONTRATISTA',               fecha: '2025-07-07' },
      { estado: 'AS',  responsable: 'Maria Fernanda Ospina Ruiz',  cargo: 'Coordinadora de Sistemas',  fecha: '2025-08-01' },
    ],
    soportes: S3,
  },
  {
    pagoMensualId: 5006,
    numeroCps: '5006',
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
    estado: 'RO',
    historial: [
      { estado: 'CD',  responsable: 'Sistema',                       cargo: 'Automatico',                fecha: '2025-07-01' },
      { estado: 'PRS', responsable: 'Diana Carolina Vargas Mendez',  cargo: 'CONTRATISTA',               fecha: '2025-07-03' },
      { estado: 'AS',  responsable: 'Maria Fernanda Ospina Ruiz',    cargo: 'Coordinadora de Sistemas',  fecha: '2025-08-05' },
      { estado: 'RO',  responsable: 'Jorge Enrique Ramirez Castillo', cargo: 'Ordenador del Gasto',      fecha: '2025-09-02' },
    ],
    soportes: S2,
  },
  {
    pagoMensualId: 5007,
    numeroCps: '5007',
    dependencia: 'DIV. RECURSOS HUMANOS',
    rubro: 'FUNCIONAMIENTO',
    documento: '79.345.123',
    nombreContratista: 'Felipe Santiago Ortiz Gomez',
    numeroContrato: '201-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 6,
    mesNombre: 'Junio',
    ano: 2025,
    estado: 'AP',
    historial: [
      { estado: 'CD',  responsable: 'Sistema',                       cargo: 'Automatico',                fecha: '2025-06-01' },
      { estado: 'PRS', responsable: 'Felipe Santiago Ortiz Gomez',   cargo: 'CONTRATISTA',               fecha: '2025-06-05' },
      { estado: 'AS',  responsable: 'Maria Fernanda Ospina Ruiz',    cargo: 'Coordinadora de Sistemas',  fecha: '2025-07-02' },
      { estado: 'AP',  responsable: 'Jorge Enrique Ramirez Castillo', cargo: 'Ordenador del Gasto',      fecha: '2025-08-01' },
    ],
    soportes: S3,
  },
  {
    pagoMensualId: 5008,
    numeroCps: '5008',
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
    estado: 'CD',
    historial: [
      { estado: 'CD', responsable: 'Sistema', cargo: 'Automatico', fecha: '2025-07-01' },
    ],
    soportes: [],
  },
  {
    pagoMensualId: 5009,
    numeroCps: '5009',
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
    estado: 'AP',
    historial: [
      { estado: 'CD',  responsable: 'Sistema',                       cargo: 'Automatico',                fecha: '2025-06-01' },
      { estado: 'PRS', responsable: 'Juan David Herrera Ruiz',       cargo: 'CONTRATISTA',               fecha: '2025-06-04' },
      { estado: 'AS',  responsable: 'Maria Fernanda Ospina Ruiz',    cargo: 'Coordinadora de Sistemas',  fecha: '2025-07-01' },
      { estado: 'AP',  responsable: 'Jorge Enrique Ramirez Castillo', cargo: 'Ordenador del Gasto',      fecha: '2025-08-01' },
    ],
    soportes: S3,
  },
  {
    pagoMensualId: 5010,
    numeroCps: '5010',
    dependencia: 'OF. SISTEMATIZACION E INFORMATICA',
    rubro: 'FUNCIONAMIENTO',
    documento: '67.123.456',
    nombreContratista: 'Ana Lucia Rodriguez Perez',
    numeroContrato: '333-2025',
    vigencia: 2025,
    esOtroSi: false,
    mes: 8,
    mesNombre: 'Agosto',
    ano: 2025,
    estado: 'PRS',
    historial: [
      { estado: 'CD',  responsable: 'Sistema',                    cargo: 'Automatico',  fecha: '2025-08-01' },
      { estado: 'PRS', responsable: 'Ana Lucia Rodriguez Perez',  cargo: 'CONTRATISTA', fecha: '2025-08-06' },
    ],
    soportes: S2,
  },
];

@Component({
  selector: 'app-historico',
  standalone: true,
  imports: [
    DataTableComponent,
    TableRowDirective,
    TableCardDirective,
    EstadoChipComponent,
    EmptyStateComponent,
    HistoricoDetallePanelComponent,
    MultiSelectDropdownComponent,
  ],
  templateUrl: './historico.component.html',
})
export class HistoricoComponent {
  // ── Layout ─────────────────────────────────────────────────────────────────
  readonly mainCls = MAIN_WIDE;
  readonly hdrCls = HDR_WIDE;

  // ── Filter state ───────────────────────────────────────────────────────────
  readonly filtroAnios = signal<string[]>([]);
  readonly filtroMeses = signal<string[]>([]);
  readonly filtroVigencias = signal<string[]>([]);
  readonly filtroDocumento = signal('');
  readonly filtroEstados = signal<string[]>([]);
  readonly filtroDependencias = signal<string[]>([]);
  readonly filtroContrato = signal('');
  readonly formError = signal('');
  readonly formColapsado = signal(false);

  // ── Results state ──────────────────────────────────────────────────────────
  readonly resultados = signal<CumplidoHistoricoItem[]>([]);
  readonly buscado = signal(false);
  readonly sortColumn = signal<SortCol | null>(null);
  readonly sortDirection = signal<'asc' | 'desc'>('asc');
  readonly selectedItem = signal<CumplidoHistoricoItem | null>(null);

  // ── Static filter options ──────────────────────────────────────────────────
  readonly aniosOptions = ANIOS_OPTIONS;
  readonly mesesOptions = MESES_OPTIONS;
  readonly vigenciasOptions = VIGENCIAS_OPTIONS;
  readonly estadosOptions = ESTADOS_OPTIONS;
  readonly dependenciasOptions = DEPENDENCIAS_OPTIONS;

  // ── Computed ───────────────────────────────────────────────────────────────
  readonly filtroResumen = computed((): Array<{ label: string; valor: string }> => {
    const pills: Array<{ label: string; valor: string }> = [];

    const deps = this.filtroDependencias();
    if (deps.length === 1) pills.push({ label: 'Dependencia', valor: deps[0] });
    else if (deps.length > 1) pills.push({ label: 'Dependencia', valor: `${deps.length} seleccionadas` });

    const ests = this.filtroEstados();
    if (ests.length === 1) {
      const cfg = ESTADO_CONFIG[ests[0]];
      pills.push({ label: 'Estado', valor: cfg ? `${cfg.label} (${ests[0]})` : ests[0] });
    } else if (ests.length > 1) {
      pills.push({ label: 'Estado', valor: `${ests.length} seleccionados` });
    }

    const anios = this.filtroAnios();
    if (anios.length === 1) pills.push({ label: 'A\u00f1o', valor: anios[0] });
    else if (anios.length > 1) pills.push({ label: 'A\u00f1o', valor: `${anios.length} seleccionados` });

    const meses = this.filtroMeses();
    if (meses.length === 1) {
      const m = MESES_OPTIONS.find((o) => o.value === meses[0]);
      pills.push({ label: 'Mes', valor: m?.label ?? meses[0] });
    } else if (meses.length > 1) {
      pills.push({ label: 'Mes', valor: `${meses.length} seleccionados` });
    }

    const vigs = this.filtroVigencias();
    if (vigs.length === 1) pills.push({ label: 'Vigencia', valor: vigs[0] });
    else if (vigs.length > 1) pills.push({ label: 'Vigencia', valor: `${vigs.length} seleccionadas` });

    const doc = this.filtroDocumento().trim();
    if (doc) pills.push({ label: 'Documento', valor: doc });

    const cont = this.filtroContrato().trim();
    if (cont) pills.push({ label: 'Contrato', valor: cont });

    return pills;
  });

  readonly cumplidosFiltrados = computed(() => {
    const col = this.sortColumn();
    const dir = this.sortDirection() === 'asc' ? 1 : -1;
    let list = this.resultados();

    if (col === 'dependencia') {
      list = [...list].sort((a, b) => a.dependencia.localeCompare(b.dependencia) * dir);
    } else if (col === 'contrato') {
      list = [...list].sort((a, b) => a.numeroContrato.localeCompare(b.numeroContrato) * dir);
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
    const n = this.resultados().length;
    return `${n} cumplido${n !== 1 ? 's' : ''}`;
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
      sortable: false,
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
      skHdr: 'h-2.5 w-28 animate-pulse rounded bg-gray-200',
      skCell: 'h-8 w-36 animate-pulse rounded-md bg-gray-100',
    },
  ];

  // ── Literal class strings ──────────────────────────────────────────────────
  readonly labelCls =
    'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400';

  readonly inputCls =
    'block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors duration-150 focus:border-[#731514] focus:outline-none focus:ring-2 focus:ring-[#731514]/30';

  readonly buscarBtnCls =
    'inline-flex items-center gap-1.5 rounded-md bg-[#731514] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#5e1212] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly limpiarBtnCls =
    'inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors duration-150 hover:border-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly editarFiltrosBtnCls =
    'inline-flex items-center gap-1.5 rounded-md bg-[#731514] px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors duration-150 hover:bg-[#5e1212] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly verDetalleBtnCls =
    'inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors duration-150 hover:border-gray-300 hover:bg-gray-50';

  readonly descargarBtnCls =
    'inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors duration-150 hover:border-gray-300 hover:bg-gray-50';

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
  abrirDetalle(item: CumplidoHistoricoItem): void {
    this.selectedItem.set(item);
  }

  cerrarDetalle(): void {
    this.selectedItem.set(null);
  }

  descargarSoportes(_item: CumplidoHistoricoItem): void {
    // sin comportamiento real (pendiente de backend)
  }

  // ── Buscar / Filtros ────────────────────────────────────────────────────────
  buscar(): void {
    if (this.filtroDependencias().length === 0) {
      this.formError.set(
        'El campo Dependencia es obligatorio. Selecciona al menos una.',
      );
      return;
    }
    this.formError.set('');

    let list = MOCK_CUMPLIDOS.filter((c) =>
      this.filtroDependencias().includes(c.dependencia),
    );

    if (this.filtroAnios().length > 0) {
      list = list.filter((c) => this.filtroAnios().includes(String(c.ano)));
    }
    if (this.filtroMeses().length > 0) {
      list = list.filter((c) => this.filtroMeses().includes(String(c.mes)));
    }
    if (this.filtroVigencias().length > 0) {
      list = list.filter((c) =>
        this.filtroVigencias().includes(String(c.vigencia)),
      );
    }
    if (this.filtroEstados().length > 0) {
      list = list.filter((c) => this.filtroEstados().includes(c.estado));
    }
    if (this.filtroDocumento().trim()) {
      list = list.filter((c) =>
        c.documento.includes(this.filtroDocumento().trim()),
      );
    }
    if (this.filtroContrato().trim()) {
      list = list.filter((c) =>
        c.numeroContrato
          .toLowerCase()
          .includes(this.filtroContrato().toLowerCase().trim()),
      );
    }

    this.resultados.set(list);
    this.buscado.set(true);
    this.formColapsado.set(true);
    this.sortColumn.set(null);
  }

  editarFiltros(): void {
    this.formColapsado.set(false);
  }

  limpiarFiltros(): void {
    this.filtroAnios.set([]);
    this.filtroMeses.set([]);
    this.filtroVigencias.set([]);
    this.filtroDocumento.set('');
    this.filtroEstados.set([]);
    this.filtroDependencias.set([]);
    this.filtroContrato.set('');
    this.formError.set('');
    this.resultados.set([]);
    this.buscado.set(false);
    this.formColapsado.set(false);
    this.sortColumn.set(null);
  }
}
