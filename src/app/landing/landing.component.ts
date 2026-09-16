import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TabBarComponent, TabItem } from '../shared/components/tab-bar.component';

type IconoClave = 'contratos' | 'bandeja' | 'historico' | 'fechas' | 'reversion' | 'aprobados';
type TipoSeccion = 'accion' | 'consulta' | 'config';

interface TarjetaRuta {
  titulo: string;
  descripcion: string;
  ruta: string;
  icono: IconoClave;
}

interface SeccionRol {
  titulo: string;
  tipo: TipoSeccion;
  tarjetas: TarjetaRuta[];
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, TabBarComponent],
  templateUrl: './landing.component.html',
})
export class LandingComponent {
  readonly rolTabs: TabItem[] = [
    { id: 'CONTRATISTA', label: 'Contratista' },
    { id: 'SUPERVISOR', label: 'Supervisor' },
    { id: 'ORDENADOR', label: 'Ordenador del Gasto' },
  ];

  readonly rolActivo = signal<string>('CONTRATISTA');

  // Literales completas para el scanner de Tailwind.

  readonly gridCardCls =
    'group flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-gray-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#731514]/30 focus-visible:ring-offset-2';

  readonly horizCardClsLabeled =
    'group flex w-full max-w-2xl items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-gray-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#731514]/30 focus-visible:ring-offset-2';

  readonly horizCardClsCentered =
    'group flex w-full max-w-lg items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all hover:border-gray-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#731514]/30 focus-visible:ring-offset-2';

  // Icono contenedor horizontal (sin mb) — accion=crimson, resto=blanco+borde
  readonly iconoClsH: Record<TipoSeccion, string> = {
    accion:
      'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#731514] text-white transition-colors group-hover:bg-[#5e1212]',
    consulta:
      'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition-colors group-hover:bg-gray-50',
    config:
      'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition-colors group-hover:bg-gray-50',
  };

  // Icono contenedor grid (con mb-2)
  readonly iconoClsG: Record<TipoSeccion, string> = {
    accion:
      'mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#731514] text-white transition-colors group-hover:bg-[#5e1212]',
    consulta:
      'mb-2 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition-colors group-hover:bg-gray-50',
    config:
      'mb-2 flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 transition-colors group-hover:bg-gray-50',
  };

  // Paths SVG Heroicons outline 24. Un único path por icono → [attr.d] en template.
  readonly iconPaths: Record<IconoClave, string> = {
    contratos:
      'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z',
    bandeja:
      'M2.25 13.5h3.86a2.251 2.251 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.251 2.251 0 0 1 2.012-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z',
    historico: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
    fechas:
      'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z',
    reversion: 'M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3',
    aprobados: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  };

  private readonly REVISION_CUMPLIDOS: TarjetaRuta = {
    titulo: 'Revisión de cumplidos',
    descripcion: 'Revisión y aprobación de los cumplidos pendientes de tus contratistas',
    ruta: '/gestion-supervisor/bandeja',
    icono: 'bandeja',
  };

  private readonly HISTORICO: TarjetaRuta = {
    titulo: 'Histórico',
    descripcion: 'Consulta del estado e historial de cumplidos',
    ruta: '/historico',
    icono: 'historico',
  };

  private readonly PARAMETRIZACION: TarjetaRuta = {
    titulo: 'Parametrización de fechas',
    descripcion: 'Configura las fechas en que tus contratistas pueden cargar sus cumplidos',
    ruta: '/parametrizacion-fechas',
    icono: 'fechas',
  };

  private readonly seccionesPorRol: Record<string, SeccionRol[]> = {
    CONTRATISTA: [
      {
        titulo: '',
        tipo: 'accion',
        tarjetas: [
          {
            titulo: 'Mis contratos',
            descripcion: 'Gestión de tus contratos y solicitudes de pago mensual',
            ruta: '/gestion-contratista/contratos',
            icono: 'contratos',
          },
        ],
      },
    ],
    SUPERVISOR: [
      { titulo: 'Bandejas de trabajo', tipo: 'accion', tarjetas: [this.REVISION_CUMPLIDOS] },
      { titulo: 'Consulta', tipo: 'consulta', tarjetas: [this.HISTORICO] },
      { titulo: 'Configuración', tipo: 'config', tarjetas: [this.PARAMETRIZACION] },
    ],
    ORDENADOR: [
      {
        titulo: 'Bandejas de trabajo',
        tipo: 'accion',
        tarjetas: [
          this.REVISION_CUMPLIDOS,
          {
            titulo: 'Bandeja del ordenador',
            descripcion: 'Aprobación de pago de los cumplidos ya revisados por el supervisor',
            ruta: '/gestion-ordenador/bandeja',
            icono: 'bandeja',
          },
          {
            titulo: 'Reversión de aprobación',
            descripcion: 'Revertir una aprobación de pago ya dada',
            ruta: '/gestion-ordenador/reversion',
            icono: 'reversion',
          },
        ],
      },
      {
        titulo: 'Consulta',
        tipo: 'consulta',
        tarjetas: [
          this.HISTORICO,
          {
            titulo: 'Cumplidos aprobados',
            descripcion: 'Consulta de los cumplidos ya aprobados',
            ruta: '/cumplidos-aprobados',
            icono: 'aprobados',
          },
        ],
      },
      { titulo: 'Configuración', tipo: 'config', tarjetas: [this.PARAMETRIZACION] },
    ],
  };

  readonly secciones = computed(() => this.seccionesPorRol[this.rolActivo()] ?? []);
}
