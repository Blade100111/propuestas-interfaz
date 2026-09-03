import { Component, computed, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AutoGrowDirective } from './auto-grow.directive';

export interface EvidenciaItem {
  tipo: 'texto' | 'enlace';
  valor: string;
}

export interface ActividadRealizadaItem {
  actividad: string;
  productoAsociado: string;
  evidencias: EvidenciaItem[];
  activo: boolean;
}

export interface ActividadItem {
  actividadEspecifica: string;
  avance: number;
  activo: boolean;
  expandida: boolean;
  actividadesRealizadas: ActividadRealizadaItem[];
}

interface EstadoConfig {
  label: string;
  chipClass: string;
}

interface InformeData {
  pagoMensualId: number;
  numeroContrato: string;
  mes: string;
  ano: number;
  estado: 'CD' | 'PRS' | 'AS' | 'AP' | 'RS' | 'RO';
  objeto: string;
  actividadesContrato: string;
  fechaInicio: string;
  fechaFin: string;
  proceso: string;
  periodoInformeInicio: string;
  periodoInformeFin: string;
  actividades: ActividadItem[];
}

const ESTADO_CONFIG: Record<string, EstadoConfig> = {
  CD:  { label: 'Creado',           chipClass: 'bg-[#FF9311] text-gray-900' },
  PRS: { label: 'En revisión',      chipClass: 'bg-[#FFB051] text-gray-900' },
  AS:  { label: 'Aprobado Sup.',    chipClass: 'bg-[#218B22] text-white'    },
  AP:  { label: 'Aprobado',         chipClass: 'bg-[#218B22] text-white'    },
  RS:  { label: 'Rechazado Sup.',   chipClass: 'bg-[#930E10] text-white'    },
  RO:  { label: 'Rechazado Ord.',   chipClass: 'bg-gray-500 text-white'     },
};

export const PROCESOS: readonly string[] = [
  'Planeación Estratégica e Institucional',
  'Gestión Integrada',
  'Autoevaluación y Acreditación',
  'Interinstitucionalización e Internacionalización',
  'Comunicaciones',
  'Gestión de Docencia',
  'Gestión de Investigación',
  'Extensión y Proyección Social',
  'Admisiones, Registro y Control',
  'Bienestar Institucional',
  'Gestión de la Información Bibliográfica',
  'Gestión de Laboratorios',
  'Servicio al Ciudadano',
  'Gestión de los Sistemas de Información y las Telecomunicaciones',
  'Gestión y Desarrollo del Talento Humano',
  'Gestión Documental',
  'Gestión de Infraestructura Física',
  'Gestión de Recursos Financieros',
  'Gestión Contractual',
  'Gestión Jurídica',
  'Evaluación y Control',
  'Control Disciplinario',
];

// Hardcoded mock — consistent with bandeja and detalle-soporte (same pagoMensualId, numeroContrato, estado).
const MOCK_INFORMES: InformeData[] = [
  {
    pagoMensualId: 1001,
    numeroContrato: '789-2025',
    mes: 'Julio',
    ano: 2025,
    estado: 'CD',
    objeto:
      'Prestación de servicios profesionales en soporte y mantenimiento de sistemas de información para la Oficina de Sistemas e Informática',
    actividadesContrato:
      'Soporte técnico de primer y segundo nivel a sistemas de información institucionales. Mantenimiento preventivo y correctivo de bases de datos. Documentación de incidencias y procedimientos operativos.',
    fechaInicio: '2025-07-01',
    fechaFin: '2025-07-31',
    proceso: 'Gestión de los Sistemas de Información y las Telecomunicaciones',
    periodoInformeInicio: '2025-07-01',
    periodoInformeFin: '2025-07-31',
    actividades: [
      {
        actividadEspecifica: 'Soporte y mantenimiento de sistemas de información institucionales',
        avance: 80,
        activo: true,
        expandida: true,
        actividadesRealizadas: [
          {
            actividad:
              'Atención de 23 tickets de soporte nivel 1 y 2 para los sistemas SGA y KRONOS',
            productoAsociado: 'Registro de incidencias cerradas en mesa de ayuda institucional',
            evidencias: [{ tipo: 'texto' as const, valor: 'Capturas de pantalla de tickets cerrados; correos de confirmación de usuarios finales' }],
            activo: true,
          },
        ],
      },
      {
        actividadEspecifica: 'Documentación técnica de procedimientos de mantenimiento',
        avance: 60,
        activo: true,
        expandida: false,
        actividadesRealizadas: [
          {
            actividad:
              'Elaboración de manual de procedimiento para respaldo de bases de datos PostgreSQL',
            productoAsociado: 'Manual de procedimiento v1.0 — 12 páginas',
            evidencias: [{ tipo: 'texto' as const, valor: 'Documento en repositorio compartido con el supervisor el 22 jul 2025' }],
            activo: true,
          },
        ],
      },
    ],
  },
  {
    pagoMensualId: 1002,
    numeroContrato: '789-2025',
    mes: 'Junio',
    ano: 2025,
    estado: 'RS',
    objeto:
      'Prestación de servicios profesionales en soporte y mantenimiento de sistemas de información para la Oficina de Sistemas e Informática',
    actividadesContrato:
      'Soporte técnico de primer y segundo nivel a sistemas de información institucionales. Mantenimiento preventivo y correctivo de bases de datos. Documentación de incidencias y procedimientos operativos.',
    fechaInicio: '2025-06-01',
    fechaFin: '2025-06-30',
    proceso: 'Gestión de los Sistemas de Información y las Telecomunicaciones',
    periodoInformeInicio: '2025-06-01',
    periodoInformeFin: '2025-06-30',
    actividades: [
      {
        actividadEspecifica: 'Soporte y mantenimiento de sistemas de información institucionales',
        avance: 40,
        activo: true,
        expandida: true,
        actividadesRealizadas: [
          {
            actividad:
              'Atención de 18 tickets de soporte nivel 1 y 2 para los sistemas SGA y KRONOS',
            productoAsociado: 'Registro de incidencias cerradas en mesa de ayuda institucional',
            evidencias: [{ tipo: 'texto' as const, valor: 'Capturas de pantalla de tickets cerrados; correos de confirmación de usuarios finales' }],
            activo: true,
          },
        ],
      },
    ],
  },
  {
    pagoMensualId: 1003,
    numeroContrato: '789-2025',
    mes: 'Mayo',
    ano: 2025,
    estado: 'PRS',
    objeto:
      'Prestación de servicios profesionales en soporte y mantenimiento de sistemas de información para la Oficina de Sistemas e Informática',
    actividadesContrato:
      'Soporte técnico de primer y segundo nivel a sistemas de información institucionales. Mantenimiento preventivo y correctivo de bases de datos. Documentación de incidencias y procedimientos operativos.',
    fechaInicio: '2025-05-01',
    fechaFin: '2025-05-31',
    proceso: 'Gestión de los Sistemas de Información y las Telecomunicaciones',
    periodoInformeInicio: '2025-05-01',
    periodoInformeFin: '2025-05-31',
    actividades: [
      {
        actividadEspecifica: 'Soporte y mantenimiento de sistemas de información institucionales',
        avance: 100,
        activo: true,
        expandida: false,
        actividadesRealizadas: [
          {
            actividad:
              'Atención de 21 tickets de soporte nivel 1 y 2 para los sistemas SGA y KRONOS',
            productoAsociado: 'Registro de incidencias cerradas en mesa de ayuda institucional',
            evidencias: [{ tipo: 'texto' as const, valor: 'Capturas de pantalla de tickets cerrados; correos de confirmación de usuarios finales' }],
            activo: true,
          },
        ],
      },
      {
        actividadEspecifica: 'Documentación técnica de procedimientos de mantenimiento',
        avance: 100,
        activo: true,
        expandida: false,
        actividadesRealizadas: [
          {
            actividad:
              'Elaboración de manual de procedimiento para restauración de base de datos ante fallos',
            productoAsociado: 'Manual de restauración v1.0 — 8 páginas',
            evidencias: [{ tipo: 'texto' as const, valor: 'Documento en repositorio compartido con el supervisor el 28 may 2025' }],
            activo: true,
          },
        ],
      },
    ],
  },
  {
    pagoMensualId: 1004,
    numeroContrato: '789-2025',
    mes: 'Abril',
    ano: 2025,
    estado: 'AS',
    objeto:
      'Prestación de servicios profesionales en soporte y mantenimiento de sistemas de información para la Oficina de Sistemas e Informática',
    actividadesContrato:
      'Soporte técnico de primer y segundo nivel a sistemas de información institucionales. Mantenimiento preventivo y correctivo de bases de datos. Documentación de incidencias y procedimientos operativos.',
    fechaInicio: '2025-04-01',
    fechaFin: '2025-04-30',
    proceso: 'Gestión de los Sistemas de Información y las Telecomunicaciones',
    periodoInformeInicio: '2025-04-01',
    periodoInformeFin: '2025-04-30',
    actividades: [
      {
        actividadEspecifica: 'Soporte y mantenimiento de sistemas de información institucionales',
        avance: 100,
        activo: true,
        expandida: false,
        actividadesRealizadas: [
          {
            actividad:
              'Atención de 19 tickets de soporte nivel 1 y 2 para los sistemas SGA y KRONOS',
            productoAsociado: 'Registro de incidencias cerradas en mesa de ayuda institucional',
            evidencias: [{ tipo: 'texto' as const, valor: 'Capturas de pantalla de tickets cerrados; correos de confirmación de usuarios finales' }],
            activo: true,
          },
        ],
      },
    ],
  },
  {
    pagoMensualId: 1005,
    numeroContrato: '789-2025',
    mes: 'Marzo',
    ano: 2025,
    estado: 'AP',
    objeto:
      'Prestación de servicios profesionales en soporte y mantenimiento de sistemas de información para la Oficina de Sistemas e Informática',
    actividadesContrato:
      'Soporte técnico de primer y segundo nivel a sistemas de información institucionales. Mantenimiento preventivo y correctivo de bases de datos. Documentación de incidencias y procedimientos operativos.',
    fechaInicio: '2025-03-01',
    fechaFin: '2025-03-31',
    proceso: 'Gestión de los Sistemas de Información y las Telecomunicaciones',
    periodoInformeInicio: '2025-03-01',
    periodoInformeFin: '2025-03-31',
    actividades: [
      {
        actividadEspecifica: 'Soporte y mantenimiento de sistemas de información institucionales',
        avance: 100,
        activo: true,
        expandida: false,
        actividadesRealizadas: [
          {
            actividad:
              'Atención de 25 tickets de soporte nivel 1 y 2 para los sistemas SGA, KRONOS y ARGO',
            productoAsociado: 'Registro de incidencias cerradas en mesa de ayuda institucional',
            evidencias: [{ tipo: 'texto' as const, valor: 'Capturas de pantalla de tickets cerrados; correos de confirmación de usuarios finales' }],
            activo: true,
          },
        ],
      },
      {
        actividadEspecifica: 'Documentación técnica de procedimientos de mantenimiento',
        avance: 100,
        activo: true,
        expandida: false,
        actividadesRealizadas: [
          {
            actividad:
              'Elaboración de guía de configuración de ambientes de desarrollo y pruebas para el equipo de sistemas',
            productoAsociado: 'Guía de configuración v1.0 — 15 páginas',
            evidencias: [{ tipo: 'texto' as const, valor: 'Documento en repositorio compartido con el supervisor el 27 mar 2025' }],
            activo: true,
          },
        ],
      },
    ],
  },
  {
    pagoMensualId: 1006,
    numeroContrato: '789-2025',
    mes: 'Febrero',
    ano: 2025,
    estado: 'RO',
    objeto:
      'Prestación de servicios profesionales en soporte y mantenimiento de sistemas de información para la Oficina de Sistemas e Informática',
    actividadesContrato:
      'Soporte técnico de primer y segundo nivel a sistemas de información institucionales. Mantenimiento preventivo y correctivo de bases de datos. Documentación de incidencias y procedimientos operativos.',
    fechaInicio: '2025-02-01',
    fechaFin: '2025-02-28',
    proceso: 'Gestión de los Sistemas de Información y las Telecomunicaciones',
    periodoInformeInicio: '2025-02-01',
    periodoInformeFin: '2025-02-28',
    actividades: [
      {
        actividadEspecifica: 'Soporte y mantenimiento de sistemas de información institucionales',
        avance: 100,
        activo: true,
        expandida: false,
        actividadesRealizadas: [
          {
            actividad:
              'Atención de 16 tickets de soporte nivel 1 y 2 para los sistemas SGA y KRONOS',
            productoAsociado: 'Registro de incidencias cerradas en mesa de ayuda institucional',
            evidencias: [{ tipo: 'texto' as const, valor: 'Capturas de pantalla de tickets cerrados; correos de confirmación de usuarios finales' }],
            activo: true,
          },
        ],
      },
    ],
  },
];

@Component({
  selector: 'app-informe-contratista',
  standalone: true,
  imports: [AutoGrowDirective],
  templateUrl: './informe-contratista.component.html',
})
export class InformeContratistaComponent {
  // ── Literal class strings — TW scanner must see these at build time ────────
  readonly backBtnCls =
    'inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514] rounded';

  readonly ghostBtnCls =
    'inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors duration-150 hover:bg-gray-50 hover:border-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly primaryBtnCls =
    'inline-flex items-center justify-center gap-2 rounded-md bg-[#731514] px-4 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#5e1212] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly inputCls =
    'block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors duration-150 focus:border-[#731514] focus:outline-none focus:ring-2 focus:ring-[#731514]/30';

  readonly textareaCls =
    'block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm resize-none overflow-y-auto max-h-[24rem] transition-colors duration-150 focus:border-[#731514] focus:outline-none focus:ring-2 focus:ring-[#731514]/30';

  readonly selectCls =
    'block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors duration-150 focus:border-[#731514] focus:outline-none focus:ring-2 focus:ring-[#731514]/30';

  readonly iconBtnCls =
    'inline-flex items-center justify-center w-7 h-7 rounded border border-gray-200 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-700 hover:border-gray-300 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#731514] disabled:opacity-30 disabled:cursor-not-allowed';

  readonly deleteBtnCls =
    'inline-flex items-center justify-center w-7 h-7 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#731514]';

  readonly evidToggleContainerCls =
    'inline-flex shrink-0 rounded-md border border-gray-200 bg-gray-50 p-0.5';
  readonly evidToggleActivoTextoCls =
    'rounded px-2 py-0.5 text-xs font-semibold bg-white text-gray-900 shadow-sm transition-colors duration-100';
  readonly evidToggleActivoEnlaceCls =
    'rounded px-2 py-0.5 text-xs font-semibold bg-white text-[#731514] shadow-sm transition-colors duration-100';
  readonly evidToggleInactivoCls =
    'rounded px-2 py-0.5 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors duration-100';

  // Activity accordion — card styles. Editable items are self-contained cards with gap between them.
  // Expanded editable card gets crimson tint bg; left border accent is applied via inline style binding.
  readonly actividadItemCls =
    'relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-colors duration-200';
  readonly actividadItemExpandidaCls =
    'relative overflow-hidden rounded-xl border border-gray-200 bg-[#731514]/10 shadow-sm transition-colors duration-200';
  // Read-only accordion: same card shape, gray tint when expanded (no crimson — not editable).
  readonly actividadItemROCls =
    'overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-colors duration-200';
  readonly actividadItemROExpandidaCls =
    'overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm transition-colors duration-200';
  // Crimson-ghost: "Agregar" add actions — text + border in crimson to signal intentionality.
  readonly addBtnCls =
    'inline-flex items-center justify-center gap-2 rounded-md border border-[#731514]/25 bg-white px-4 py-2.5 text-sm font-medium text-[#731514] transition-colors duration-150 hover:bg-[#731514]/5 hover:border-[#731514]/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly labelCls = 'block text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1';

  readonly infoPanelCls =
    'flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 mb-5';

  readonly successPanelCls =
    'flex items-start gap-3 rounded-xl border border-[#a5e5a6] bg-[#d6f5d6] p-4 mb-5';

  readonly rsPanelCls = 'rounded-xl border border-[#edaaab] bg-[#f8d9d9] p-4 mb-5';
  readonly roPanelCls = 'rounded-xl border border-[#d8dce4] bg-[#f0f2f5] p-4 mb-5';

  // ── State ─────────────────────────────────────────────────────────────────
  readonly cargando = signal(true);
  readonly contrato = signal<InformeData | null>(null);
  readonly actividades = signal<ActividadItem[]>([]);

  readonly pagoMensualId: number;

  // Top-level form fields — plain class properties (no computed depends on them)
  proceso = '';
  periodoInicio = '';
  periodoFin = '';

  readonly procesos = PROCESOS;

  // CD / RS = editable; PRS / AS / AP / RO = read-only.
  // Unified with detalle-soporte: no editing during active review (PRS).
  // A contratista with an incomplete informe at PRS must wait for resolution;
  // the case is handled with a warning at submission time, not open editing.
  // This is a product decision NOT inherited from legacy (which had no restriction).
  readonly esEditable = computed(() => {
    const e = this.contrato()?.estado;
    return e === 'CD' || e === 'RS';
  });

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
  ) {
    this.pagoMensualId = Number(this.route.snapshot.paramMap.get('pagoMensualId'));
    setTimeout(() => {
      const mock = MOCK_INFORMES.find((m) => m.pagoMensualId === this.pagoMensualId);
      this.contrato.set(mock ?? null);
      if (mock) {
        this.proceso = mock.proceso;
        this.periodoInicio = mock.periodoInformeInicio;
        this.periodoFin = mock.periodoInformeFin;
        this.actividades.set(
          mock.actividades.map((a) => ({
            ...a,
            actividadesRealizadas: a.actividadesRealizadas.map((ar) => ({ ...ar })),
          })),
        );
      }
      this.cargando.set(false);
    }, 900);
  }

  // ── Chip helpers ──────────────────────────────────────────────────────────
  chipClass(estado: string): string {
    const color = ESTADO_CONFIG[estado]?.chipClass ?? 'bg-gray-300 text-gray-800';
    return `${color} inline-flex items-center justify-center min-w-[7.5rem] rounded-full px-2.5 py-0.5 text-xs font-semibold`;
  }

  chipLabel(estado: string): string {
    return ESTADO_CONFIG[estado]?.label ?? estado;
  }

  // ── Accordion toggle ──────────────────────────────────────────────────────
  toggleExpand(index: number): void {
    this.actividades.update((list) =>
      list.map((a, i) => (i === index ? { ...a, expandida: !a.expandida } : a)),
    );
  }

  // ── Level 1 reordering ────────────────────────────────────────────────────
  moverArriba(index: number): void {
    if (index === 0) return;
    this.actividades.update((list) => {
      const r = [...list];
      [r[index - 1], r[index]] = [r[index], r[index - 1]];
      return r;
    });
  }

  moverAbajo(index: number): void {
    this.actividades.update((list) => {
      if (index >= list.length - 1) return list;
      const r = [...list];
      [r[index], r[index + 1]] = [r[index + 1], r[index]];
      return r;
    });
  }

  // ── Level 1 CRUD ──────────────────────────────────────────────────────────
  agregarActividad(): void {
    this.actividades.update((list) => [
      ...list,
      { actividadEspecifica: '', avance: 0, activo: true, expandida: true, actividadesRealizadas: [] },
    ]);
    // Scroll to bottom so the new item is visible
    setTimeout(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }), 50);
  }

  eliminarActividad(index: number): void {
    this.actividades.update((list) => list.filter((_, i) => i !== index));
  }

  // ── Level 1 field updates ─────────────────────────────────────────────────
  onActividadEspecificaInput(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.actividades.update((list) =>
      list.map((a, i) => (i === index ? { ...a, actividadEspecifica: value } : a)),
    );
  }

  onAvanceInput(index: number, event: Event): void {
    const raw = Number((event.target as HTMLInputElement).value);
    const value = Math.min(100, Math.max(0, isNaN(raw) ? 0 : Math.round(raw)));
    this.actividades.update((list) =>
      list.map((a, i) => (i === index ? { ...a, avance: value } : a)),
    );
  }

  // ── Level 2 CRUD ──────────────────────────────────────────────────────────
  agregarActividadRealizada(actIndex: number): void {
    this.actividades.update((list) =>
      list.map((a, i) =>
        i !== actIndex
          ? a
          : {
              ...a,
              actividadesRealizadas: [
                ...a.actividadesRealizadas,
                { actividad: '', productoAsociado: '', evidencias: [], activo: true },
              ],
            },
      ),
    );
  }

  eliminarActividadRealizada(actIndex: number, arIndex: number): void {
    this.actividades.update((list) =>
      list.map((a, i) =>
        i !== actIndex
          ? a
          : { ...a, actividadesRealizadas: a.actividadesRealizadas.filter((_, j) => j !== arIndex) },
      ),
    );
  }

  // ── Level 2 reordering ────────────────────────────────────────────────────
  moverArribaRealizada(actIndex: number, arIndex: number): void {
    if (arIndex === 0) return;
    this.actividades.update((list) =>
      list.map((a, i) => {
        if (i !== actIndex) return a;
        const rs = [...a.actividadesRealizadas];
        [rs[arIndex - 1], rs[arIndex]] = [rs[arIndex], rs[arIndex - 1]];
        return { ...a, actividadesRealizadas: rs };
      }),
    );
  }

  moverAbajoRealizada(actIndex: number, arIndex: number): void {
    this.actividades.update((list) =>
      list.map((a, i) => {
        if (i !== actIndex) return a;
        if (arIndex >= a.actividadesRealizadas.length - 1) return a;
        const rs = [...a.actividadesRealizadas];
        [rs[arIndex], rs[arIndex + 1]] = [rs[arIndex + 1], rs[arIndex]];
        return { ...a, actividadesRealizadas: rs };
      }),
    );
  }

  // ── Level 2 field updates ─────────────────────────────────────────────────
  onActividadRealizadaInput(
    actIndex: number,
    arIndex: number,
    field: 'actividad' | 'productoAsociado',
    event: Event,
  ): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.actividades.update((list) =>
      list.map((a, i) =>
        i !== actIndex
          ? a
          : {
              ...a,
              actividadesRealizadas: a.actividadesRealizadas.map((ar, j) =>
                j !== arIndex ? ar : { ...ar, [field]: value },
              ),
            },
      ),
    );
  }

  // ── Level 3 — Evidencias CRUD & updates ──────────────────────────────────
  agregarEvidencia(actIndex: number, arIndex: number): void {
    this.actividades.update((list) =>
      list.map((a, i) => {
        if (i !== actIndex) return a;
        return {
          ...a,
          actividadesRealizadas: a.actividadesRealizadas.map((ar, j) =>
            j !== arIndex
              ? ar
              : { ...ar, evidencias: [...ar.evidencias, { tipo: 'texto' as const, valor: '' }] },
          ),
        };
      }),
    );
  }

  eliminarEvidencia(actIndex: number, arIndex: number, evIndex: number): void {
    this.actividades.update((list) =>
      list.map((a, i) => {
        if (i !== actIndex) return a;
        return {
          ...a,
          actividadesRealizadas: a.actividadesRealizadas.map((ar, j) =>
            j !== arIndex
              ? ar
              : { ...ar, evidencias: ar.evidencias.filter((_, k) => k !== evIndex) },
          ),
        };
      }),
    );
  }

  onEvidenciaTipo(actIndex: number, arIndex: number, evIndex: number, tipo: 'texto' | 'enlace'): void {
    this.actividades.update((list) =>
      list.map((a, i) => {
        if (i !== actIndex) return a;
        return {
          ...a,
          actividadesRealizadas: a.actividadesRealizadas.map((ar, j) =>
            j !== arIndex
              ? ar
              : {
                  ...ar,
                  evidencias: ar.evidencias.map((ev, k) => k !== evIndex ? ev : { ...ev, tipo }),
                },
          ),
        };
      }),
    );
  }

  onEvidenciaValor(actIndex: number, arIndex: number, evIndex: number, event: Event): void {
    const valor = (event.target as HTMLInputElement).value;
    this.actividades.update((list) =>
      list.map((a, i) => {
        if (i !== actIndex) return a;
        return {
          ...a,
          actividadesRealizadas: a.actividadesRealizadas.map((ar, j) =>
            j !== arIndex
              ? ar
              : {
                  ...ar,
                  evidencias: ar.evidencias.map((ev, k) => k !== evIndex ? ev : { ...ev, valor }),
                },
          ),
        };
      }),
    );
  }

  // ── Navigation ────────────────────────────────────────────────────────────
  volver(): void {
    this.router.navigate(['/gestion-contratista/detalle-soporte', this.pagoMensualId]);
  }
}
