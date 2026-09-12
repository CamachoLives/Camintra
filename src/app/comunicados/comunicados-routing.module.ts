import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ComunicadosListaComponent } from './pages/lista/lista.component';
import { ComunicadoDetalleComponent } from './pages/detalle/detalle.component';
import { ComunicadoEditorComponent } from './pages/editor/editor.component';
import { publicadorGuard } from '../guards/publicador.guard';

const routes: Routes = [
  { path: '', component: ComunicadosListaComponent },
  {
    path: 'nuevo',
    component: ComunicadoEditorComponent,
    canActivate: [publicadorGuard],
  },
  { path: ':id', component: ComunicadoDetalleComponent },
  {
    path: ':id/editar',
    component: ComunicadoEditorComponent,
    canActivate: [publicadorGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ComunicadosRoutingModule {}
