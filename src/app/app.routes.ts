import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'gestion-contratista/contratos',
    pathMatch: 'full',
  },
  {
    path: 'gestion-contratista/contratos',
    loadComponent: () =>
      import('./gestion-contratista/contratos/contratos-contratista.component').then(
        (m) => m.ContratosContratistaComponent,
      ),
  },
  {
    path: 'gestion-contratista/contratos/:numeroContrato/solicitudes',
    loadComponent: () =>
      import('./gestion-contratista/solicitudes/solicitudes-contratista.component').then(
        (m) => m.SolicitudesContratistaComponent,
      ),
  },
  {
    path: 'gestion-contratista/detalle-soporte/:pagoMensualId',
    loadComponent: () =>
      import(
        './gestion-contratista/detalle-soporte/detalle-soporte-contratista.component'
      ).then((m) => m.DetalleSoporteContratistaComponent),
  },
  {
    path: 'gestion-contratista/informe/:pagoMensualId',
    loadComponent: () =>
      import('./gestion-contratista/informe/informe-contratista.component').then(
        (m) => m.InformeContratistaComponent,
      ),
  },
  {
    path: 'gestion-supervisor/bandeja',
    loadComponent: () =>
      import('./gestion-supervisor/bandeja/bandeja-supervisor.component').then(
        (m) => m.BandejaSupervisorComponent,
      ),
  },
  {
    path: 'gestion-ordenador/bandeja',
    loadComponent: () =>
      import('./gestion-ordenador/bandeja/bandeja-ordenador.component').then(
        (m) => m.BandejaOrdenadorComponent,
      ),
  },
  {
    path: 'gestion-ordenador/reversion',
    loadComponent: () =>
      import('./gestion-ordenador/reversion/reversion-ordenador.component').then(
        (m) => m.ReversionOrdenadorComponent,
      ),
  },
  {
    path: 'historico',
    loadComponent: () =>
      import('./historico/historico.component').then((m) => m.HistoricoComponent),
  },
  {
    path: 'cumplidos-aprobados',
    loadComponent: () =>
      import('./cumplidos-aprobados/cumplidos-aprobados.component').then(
        (m) => m.CumplidosAprobadosComponent,
      ),
  },
  {
    path: 'parametrizacion-fechas',
    loadComponent: () =>
      import('./parametrizacion-fechas/parametrizacion-fechas.component').then(
        (m) => m.ParametrizacionFechasComponent,
      ),
  },
  {
    path: '**',
    redirectTo: 'gestion-contratista/contratos',
  },
];
