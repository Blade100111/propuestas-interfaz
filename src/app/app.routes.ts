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
    path: '**',
    redirectTo: 'gestion-contratista/contratos',
  },
];
