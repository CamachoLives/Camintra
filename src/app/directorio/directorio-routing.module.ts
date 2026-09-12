import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DirectorioListaComponent } from './pages/lista/lista.component';
import { DirectorioFichaComponent } from './pages/ficha/ficha.component';

const routes: Routes = [
  { path: '', component: DirectorioListaComponent },
  { path: ':usuarioId', component: DirectorioFichaComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DirectorioRoutingModule {}
