import { Component, computed, signal } from '@angular/core';
import {
  SingleSelectDropdownComponent,
  SingleSelectOption,
} from '../shared/components/single-select-dropdown.component';
import { MAIN_WIDE, HDR_WIDE } from '../shared/layout';

// ── Option values (match backend: "0001-01-01T00:00:00Z" → no_periodo) ────────
type Opcion = 'no_periodo' | 'periodo' | '';

// ── Domain interface ───────────────────────────────────────────────────────────
interface FechaParametrizada {
  id: number;
  anio: number;
  mes: number;
  mesNombre: string;
  tipo: 'no_periodo' | 'periodo';
  fechaInicio: string | null; // 'YYYY-MM-DD'
  fechaFin: string | null;
}

// ── Static helpers ─────────────────────────────────────────────────────────────
const MES_NOMBRES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const THIS_YEAR = new Date().getFullYear();

// Legacy: only current year + previous year (2 options)
const ANIOS_OPTIONS: SingleSelectOption[] = [
  { value: String(THIS_YEAR),     label: String(THIS_YEAR) },
  { value: String(THIS_YEAR - 1), label: String(THIS_YEAR - 1) },
];

const MESES_OPTIONS: SingleSelectOption[] = MES_NOMBRES.map((label, i) => ({
  value: String(i + 1),
  label,
}));

// ── Mock data: dependencia fija del supervisor (OF. ASESORA DE TECNOLOGIAS) ───
// Mezcla de "sin límite" y "período" en dos vigencias para mostrar tabla con contenido real.
let NEXT_ID = 10;
const MOCK_FECHAS: FechaParametrizada[] = [
  // 2025
  { id: 1,  anio: 2025, mes: 1,  mesNombre: 'Enero',      tipo: 'no_periodo', fechaInicio: null,         fechaFin: null         },
  { id: 2,  anio: 2025, mes: 2,  mesNombre: 'Febrero',    tipo: 'periodo',    fechaInicio: '2025-02-01', fechaFin: '2025-02-15'  },
  { id: 3,  anio: 2025, mes: 3,  mesNombre: 'Marzo',      tipo: 'no_periodo', fechaInicio: null,         fechaFin: null         },
  { id: 4,  anio: 2025, mes: 4,  mesNombre: 'Abril',      tipo: 'periodo',    fechaInicio: '2025-04-01', fechaFin: '2025-04-30'  },
  { id: 5,  anio: 2025, mes: 5,  mesNombre: 'Mayo',       tipo: 'no_periodo', fechaInicio: null,         fechaFin: null         },
  { id: 6,  anio: 2025, mes: 6,  mesNombre: 'Junio',      tipo: 'periodo',    fechaInicio: '2025-06-02', fechaFin: '2025-06-20'  },
  { id: 7,  anio: 2025, mes: 7,  mesNombre: 'Julio',      tipo: 'no_periodo', fechaInicio: null,         fechaFin: null         },
  // 2024
  { id: 8,  anio: 2024, mes: 11, mesNombre: 'Noviembre',  tipo: 'periodo',    fechaInicio: '2024-11-05', fechaFin: '2024-11-25'  },
  { id: 9,  anio: 2024, mes: 12, mesNombre: 'Diciembre',  tipo: 'no_periodo', fechaInicio: null,         fechaFin: null         },
];

function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

@Component({
  selector: 'app-parametrizacion-fechas',
  standalone: true,
  imports: [SingleSelectDropdownComponent],
  templateUrl: './parametrizacion-fechas.component.html',
})
export class ParametrizacionFechasComponent {
  // ── Layout ────────────────────────────────────────────────────────────────
  readonly mainCls = MAIN_WIDE;
  readonly hdrCls  = HDR_WIDE;

  // ── Supervisor (hardcoded sandbox session) ────────────────────────────────
  readonly supervisor = {
    nombre:     'María Fernanda Ospina Ruiz',
    cargo:      'Coordinadora de Sistemas',
    dependencia: 'OF. ASESORA DE TECNOLOGIAS E INFORMACION',
  };

  // ── Options ───────────────────────────────────────────────────────────────
  readonly aniosOptions = ANIOS_OPTIONS;
  readonly mesesOptions = MESES_OPTIONS;

  // ── Selector state ────────────────────────────────────────────────────────
  readonly selectedAnio = signal('');
  readonly selectedMes  = signal('');

  // ── Panel visibility ──────────────────────────────────────────────────────
  readonly mostrar      = signal(false);
  readonly fechaExiste  = signal(false);
  readonly fechaId      = signal<number | null>(null);

  // ── Form state ────────────────────────────────────────────────────────────
  readonly opcion       = signal<Opcion>('');
  readonly fechaInicio  = signal('');
  readonly fechaFin     = signal('');
  readonly formError    = signal<string | null>(null);
  readonly guardadoOk   = signal(false);

  // ── Data ──────────────────────────────────────────────────────────────────
  private readonly _fechas = signal<FechaParametrizada[]>([...MOCK_FECHAS]);

  readonly fechasOrdenadas = computed(() =>
    [...this._fechas()].sort((a, b) => b.anio - a.anio || b.mes - a.mes),
  );

  // ── Computed helpers ──────────────────────────────────────────────────────
  readonly selAnioLabel = computed(() => {
    const v = this.selectedAnio();
    return v ? v : null;
  });

  readonly selMesLabel = computed(() => {
    const v = this.selectedMes();
    return v ? MES_NOMBRES[parseInt(v, 10) - 1] : null;
  });

  readonly puedeCargar = computed(() => !!this.selectedAnio() && !!this.selectedMes());

  readonly periodoValido = computed(() => {
    if (this.opcion() !== 'periodo') return true;
    const fi = this.fechaInicio();
    const ff = this.fechaFin();
    if (!fi || !ff) return true; // caught separately
    return fi <= ff;
  });

  // ── Literal class strings ─────────────────────────────────────────────────
  readonly cargarBtnCls =
    'inline-flex items-center justify-center gap-1.5 rounded-md border border-[#731514] bg-white px-3 py-2 text-sm font-semibold text-[#731514] transition-colors duration-150 hover:bg-[#731514]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514] disabled:opacity-40 disabled:cursor-not-allowed';

  readonly guardarBtnCls =
    'inline-flex items-center justify-center gap-1.5 rounded-md border border-[#731514] bg-white px-4 py-2 text-sm font-semibold text-[#731514] transition-colors duration-150 hover:bg-[#731514]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly opcionActivaCls =
    'flex flex-col items-start gap-0.5 rounded-lg border-2 border-[#731514] bg-[#731514]/5 px-4 py-3 text-left transition-colors duration-150 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly opcionInactivaCls =
    'flex flex-col items-start gap-0.5 rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition-colors duration-150 cursor-pointer hover:border-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  readonly inputCls =
    'block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors duration-150 focus:border-[#731514] focus:outline-none focus:ring-2 focus:ring-[#731514]/30';

  readonly labelCls = 'mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-400';

  readonly tipoBadgeSinLimiteCls =
    'inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600';

  readonly tipoBadgePeriodoCls =
    'inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700';

  readonly editarFilaBtnCls =
    'inline-flex items-center justify-center gap-1.5 rounded-md border border-[#731514] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#731514] transition-colors duration-150 hover:bg-[#731514]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#731514]';

  // ── Methods ───────────────────────────────────────────────────────────────

  cargarFechas(): void {
    if (!this.puedeCargar()) return;
    this.formError.set(null);
    this.guardadoOk.set(false);

    const anio = parseInt(this.selectedAnio(), 10);
    const mes  = parseInt(this.selectedMes(), 10);
    const existente = this._fechas().find((f) => f.anio === anio && f.mes === mes);

    if (existente) {
      this.fechaExiste.set(true);
      this.fechaId.set(existente.id);
      this.opcion.set(existente.tipo);
      this.fechaInicio.set(existente.fechaInicio ?? '');
      this.fechaFin.set(existente.fechaFin ?? '');
    } else {
      this.fechaExiste.set(false);
      this.fechaId.set(null);
      this.opcion.set('');
      this.fechaInicio.set('');
      this.fechaFin.set('');
    }

    this.mostrar.set(true);
  }

  guardarFechas(): void {
    this.formError.set(null);
    this.guardadoOk.set(false);

    if (!this.opcion()) {
      this.formError.set('Selecciona una opción: Sin límite o Período.');
      return;
    }
    if (this.opcion() === 'periodo') {
      if (!this.fechaInicio() || !this.fechaFin()) {
        this.formError.set('Completa la fecha de inicio y fin del período.');
        return;
      }
      if (!this.periodoValido()) {
        this.formError.set('La fecha de inicio no puede ser posterior a la fecha de fin.');
        return;
      }
    }

    const anio = parseInt(this.selectedAnio(), 10);
    const mes  = parseInt(this.selectedMes(), 10);
    const esPeriodo = this.opcion() === 'periodo';

    if (this.fechaExiste()) {
      // PUT — update existing
      this._fechas.update((list) =>
        list.map((f) =>
          f.id !== this.fechaId()
            ? f
            : {
                ...f,
                tipo:        esPeriodo ? 'periodo' : 'no_periodo',
                fechaInicio: esPeriodo ? this.fechaInicio() : null,
                fechaFin:    esPeriodo ? this.fechaFin()    : null,
              },
        ),
      );
    } else {
      // POST — create new
      const nuevo: FechaParametrizada = {
        id:          NEXT_ID++,
        anio,
        mes,
        mesNombre:   MES_NOMBRES[mes - 1],
        tipo:        esPeriodo ? 'periodo' : 'no_periodo',
        fechaInicio: esPeriodo ? this.fechaInicio() : null,
        fechaFin:    esPeriodo ? this.fechaFin()    : null,
      };
      this._fechas.update((list) => [...list, nuevo]);
      this.fechaExiste.set(true);
      this.fechaId.set(nuevo.id);
    }

    this.guardadoOk.set(true);
  }

  // Cargar un registro existente desde la tabla directamente al formulario
  cargarDesdeTabla(f: FechaParametrizada): void {
    this.selectedAnio.set(String(f.anio));
    this.selectedMes.set(String(f.mes));
    this.opcion.set(f.tipo);
    this.fechaInicio.set(f.fechaInicio ?? '');
    this.fechaFin.set(f.fechaFin ?? '');
    this.fechaExiste.set(true);
    this.fechaId.set(f.id);
    this.mostrar.set(true);
    this.formError.set(null);
    this.guardadoOk.set(false);
  }

  fmtDate(iso: string | null): string {
    return iso ? fmtDate(iso) : '—';
  }
}
