import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WikiListaComponent } from './pages/lista/lista.component';
import { WikiDetalleComponent } from './pages/detalle/detalle.component';
import { WikiEditorComponent } from './pages/editor/editor.component';
import { publicadorGuard } from '../guards/publicador.guard';

const routes: Routes = [
  { path: '', component: WikiListaComponent },
  {
    path: 'nuevo',
    component: WikiEditorComponent,
    canActivate: [publicadorGuard],
  },
  { path: ':slug', component: WikiDetalleComponent },
  {
    path: ':slug/editar',
    component: WikiEditorComponent,
    canActivate: [publicadorGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class WikiRoutingModule {}
