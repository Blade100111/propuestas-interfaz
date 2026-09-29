import { Component, computed, inject, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
import { TabBarComponent, TabItem } from '../../shared/components/tab-bar.component';
import { MAIN_WIDE, HDR_WIDE } from '../../shared/layout';
import { SORT_PRIORITY } from '../../shared/estado.constants';
import { LOGO_UD_ESCUDO } from './logo-escudo-ud';
import {
  crearCertificacionPDF,
  buildCertFilename,
  calcMesSeguridadSocial,
  CertificacionRow,
} from './generar-certificacion';

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
  rubro: string;
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
  'OFICINA ASESORA DE TECNOLOGÍAS E INFORMACIÓN',
  'FACULTAD DE INGENIERÍA',
  'DIVISIÓN DE RECURSOS HUMANOS',
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
    dependencia: 'OFICINA ASESORA DE TECNOLOGÍAS E INFORMACIÓN',
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
    rubro: 'Inversión',
    soportes: SOPORTES_3,
  },
  {
    pagoMensualId: 2002,
    dependencia: 'OFICINA ASESORA DE TECNOLOGÍAS E INFORMACIÓN',
    documento: '41.876.543',
    nombreContratista: 'Laura Sofía Restrepo Diaz',
    numeroContrato: '654-2025',
    vigencia: 2025,
    cdp: 3981,
    tipoContrato: 'INICIAL',
    esOtroSi: false,
    mes: 7,
    mesNombre: 'Julio',
    ano: 2025,
    estado: 'PRS',
    rubro: 'Funcionamiento',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 2004,
    dependencia: 'FACULTAD DE INGENIERÍA',
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
    rubro: 'Inversión',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 2005,
    dependencia: 'FACULTAD DE INGENIERÍA',
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
    rubro: 'Inversión',
    soportes: SOPORTES_3,
  },
  {
    pagoMensualId: 2006,
    dependencia: 'FACULTAD DE INGENIERÍA',
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
    rubro: 'Inversión',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 2007,
    dependencia: 'DIVISIÓN DE RECURSOS HUMANOS',
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
    rubro: 'Funcionamiento',
    soportes: SOPORTES_3,
  },
  {
    pagoMensualId: 2008,
    dependencia: 'DIVISIÓN DE RECURSOS HUMANOS',
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
    rubro: 'Funcionamiento',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 2009,
    dependencia: 'OFICINA ASESORA DE TECNOLOGÍAS E INFORMACIÓN',
    documento: '41.876.543',
    nombreContratista: 'Laura Sofía Restrepo Diaz',
    numeroContrato: '654-2025',
    vigencia: 2025,
    cdp: 3982,
    tipoContrato: 'OTRO SI 1',
    esOtroSi: true,
    mes: 7,
    mesNombre: 'Julio',
    ano: 2025,
    estado: 'PRS',
    rubro: 'Funcionamiento',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 2011,
    dependencia: 'DIVISIÓN DE RECURSOS HUMANOS',
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
    rubro: 'Funcionamiento',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 2012,
    dependencia: 'OFICINA ASESORA DE TECNOLOGÍAS E INFORMACIÓN',
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
    rubro: 'Inversión',
    soportes: SOPORTES_3,
  },
  {
    pagoMensualId: 2013,
    dependencia: 'OFICINA ASESORA DE TECNOLOGÍAS E INFORMACIÓN',
    documento: '41.876.543',
    nombreContratista: 'Laura Sofía Restrepo Diaz',
    numeroContrato: '654-2025',
    vigencia: 2025,
    cdp: 3983,
    tipoContrato: 'INICIAL',
    esOtroSi: false,
    mes: 5,
    mesNombre: 'Mayo',
    ano: 2025,
    estado: 'AS',
    rubro: 'Inversión',
    soportes: SOPORTES_BASE,
  },
  {
    pagoMensualId: 2014,
    dependencia: 'OFICINA ASESORA DE TECNOLOGÍAS E INFORMACIÓN',
    documento: '79.012.345',
    nombreContratista: 'Ricardo Enrique Salazar Pena',
    numeroContrato: '823-2025',
    vigencia: 2025,
    cdp: 4510,
    tipoContrato: 'INICIAL',
    esOtroSi: false,
    mes: 5,
    mesNombre: 'Mayo',
    ano: 2025,
    estado: 'AP',
    rubro: 'Funcionamiento',
    soportes: SOPORTES_3,
  },
  {
    pagoMensualId: 2015,
    dependencia: 'FACULTAD DE INGENIERÍA',
    documento: '80.234.567',
    nombreContratista: 'Juan David Herrera Ruiz',
    numeroContrato: '512-2025',
    vigencia: 2025,
    cdp: 3541,
    tipoContrato: 'INICIAL',
    esOtroSi: false,
    mes: 5,
    mesNombre: 'Mayo',
    ano: 2025,
    estado: 'AP',
    rubro: 'Inversión',
    soportes: SOPORTES_BASE,
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
    TabBarComponent,
  ],
  templateUrl: './bandeja-supervisor.component.html',
})
export class BandejaSupervisorComponent {
  // ── Layout ─────────────────────────────────────────────────────────────────
  readonly mainCls = MAIN_WIDE;
  readonly hdrCls = HDR_WIDE;

  // ── Services ───────────────────────────────────────────────────────────────
  private readonly confirmSvc = inject(ConfirmDialogService);
  private readonly sanitizer = inject(DomSanitizer);

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

  // ── Cert PDF viewer state ──────────────────────────────────────────────────
  readonly visorAbierto = signal(false);
  readonly visorTab = signal<'inversion' | 'funcionamiento'>('inversion');
  readonly visorTabs = signal<TabItem[]>([]);
  readonly pdfDataUrlInversion = signal<SafeResourceUrl>('');
  readonly pdfDataUrlFuncionamiento = signal<SafeResourceUrl>('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pdfDocInversion: any = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private pdfDocFuncionamiento: any = null;
  private pdfFilenameInversion = '';
  private pdfFilenameFuncionamiento = '';

  readonly activePdfUrl = computed(() =>
    this.visorTab() === 'inversion'
      ? this.pdfDataUrlInversion()
      : this.pdfDataUrlFuncionamiento(),
  );

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

  readonly visorPrimaryBtnCls =
    'inline-flex items-center justify-center gap-2 rounded-md bg-[#731514] px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#5e1212] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly visorGhostBtnCls =
    'inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50 hover:border-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

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
    const dep = this.certDependencia();
    const mesStr = this.certMes();
    const anoStr = this.certAnio();
    const fecha = this.certFecha();

    if (!dep || !mesStr || !anoStr || !fecha) {
      await this.confirmSvc.confirm({
        title: 'Campos incompletos',
        message:
          'Seleccione la dependencia, mes, ano y fecha de aprobacion para generar el certificado.',
        variant: 'info',
        cancelLabel: 'Entendido',
      });
      return;
    }

    const mes = parseInt(mesStr, 10);
    const ano = parseInt(anoStr, 10);

    const elegibles = this.cumplidos().filter(
      (c) =>
        c.dependencia === dep &&
        c.mes === mes &&
        c.ano === ano &&
        (c.estado === 'AS' || c.estado === 'AP'),
    );

    if (elegibles.length === 0) {
      await this.confirmSvc.confirm({
        title: 'Sin resultados',
        message: 'No hay cumplidos aprobados para la dependencia, mes y ano seleccionados.',
        variant: 'info',
        cancelLabel: 'Entendido',
      });
      return;
    }

    const inversion = elegibles.filter((c) => c.rubro === 'Inversión');
    const funcionamiento = elegibles.filter((c) => c.rubro === 'Funcionamiento');
    const mesNombre = MES_NOMBRES_CERT[mes - 1];
    const ss = calcMesSeguridadSocial(mes, ano);
    const nombreSupervisor = 'MARIA FERNANDA OSPINA RUIZ';

    const toRow = (c: CumplidoBandejaItem): CertificacionRow => ({
      documento: c.documento,
      nombre: c.nombreContratista,
      contrato: c.numeroContrato,
      cdp: c.cdp,
      vigencia: c.vigencia,
      rubro: c.rubro,
    });

    const tabs: TabItem[] = [];

    if (inversion.length > 0) {
      this.pdfDocInversion = crearCertificacionPDF({
        rubro: 'Inversión',
        dependencia: dep,
        mesNombre,
        ano,
        mesNombreSS: ss.mesNombre,
        anoSS: ss.ano,
        nombreSupervisor,
        rows: inversion.map(toRow),
        logoImage: LOGO_UD_ESCUDO,
      });
      this.pdfFilenameInversion = buildCertFilename('Inversión');
      tabs.push({ id: 'inversion', label: 'Inversión', count: inversion.length });
    }

    if (funcionamiento.length > 0) {
      this.pdfDocFuncionamiento = crearCertificacionPDF({
        rubro: 'Funcionamiento',
        dependencia: dep,
        mesNombre,
        ano,
        mesNombreSS: ss.mesNombre,
        anoSS: ss.ano,
        nombreSupervisor,
        rows: funcionamiento.map(toRow),
        logoImage: LOGO_UD_ESCUDO,
      });
      this.pdfFilenameFuncionamiento = buildCertFilename('Funcionamiento');
      tabs.push({ id: 'funcionamiento', label: 'Funcionamiento', count: funcionamiento.length });
    }

    this.visorTabs.set(tabs);
    this.visorTab.set(tabs[0].id as 'inversion' | 'funcionamiento');

    const promises: Promise<void>[] = [];
    if (this.pdfDocInversion) {
      promises.push(
        (this.pdfDocInversion.getDataUrl() as Promise<string>).then((url: string) => {
          this.pdfDataUrlInversion.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        }),
      );
    }
    if (this.pdfDocFuncionamiento) {
      promises.push(
        (this.pdfDocFuncionamiento.getDataUrl() as Promise<string>).then((url: string) => {
          this.pdfDataUrlFuncionamiento.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
        }),
      );
    }

    await Promise.all(promises);
    this.visorAbierto.set(true);
  }

  descargarPDFs(): void {
    if (this.pdfDocInversion) {
      this.pdfDocInversion.download(this.pdfFilenameInversion);
    }
    if (this.pdfDocFuncionamiento) {
      this.pdfDocFuncionamiento.download(this.pdfFilenameFuncionamiento);
    }
  }

  cerrarVisor(): void {
    this.visorAbierto.set(false);
    this.pdfDataUrlInversion.set('');
    this.pdfDataUrlFuncionamiento.set('');
    this.pdfDocInversion = null;
    this.pdfDocFuncionamiento = null;
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
