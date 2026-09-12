import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CalendarioIntranetComponent } from './pages/calendario/calendario.component';

const routes: Routes = [{ path: '', component: CalendarioIntranetComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CalendarioRoutingModule {}
