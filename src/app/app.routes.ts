import { Routes, RouterModule } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { LayoutComponent } from './shared/layout/layout.component';

export const routes: Routes = [
  {
    path: 'Ingreso',
    loadChildren: () =>
      import('./Ingreso/Ingreso.module').then((m) => m.IngresoModule),
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'Inicio',
        loadChildren: () =>
          import('./Inicio/inicio.module').then((m) => m.inicioModule),
      },
      {
        path: 'comunicados',
        loadChildren: () =>
          import('./comunicados/comunicados.module').then(
            (m) => m.ComunicadosModule
          ),
      },
      {
        path: 'directorio',
        loadChildren: () =>
          import('./directorio/directorio.module').then(
            (m) => m.DirectorioModule
          ),
      },
      {
        path: 'user',
        loadChildren: () =>
          import('./user/user.module').then((m) => m.UserModule),
      },
      {
        path: 'configuracion',
        loadChildren: () =>
          import('./configuracion/configuracion.module').then((m) => m.ConfiguracionModule),
      },
      {
        path: 'layout',
        loadChildren: () =>
          import('./shared/shared.module').then((m) => m.SharedModule),
      },
      { path: '', redirectTo: 'Inicio', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: 'Ingreso' },
];

export const AppRoutingModule = RouterModule.forRoot(routes);
