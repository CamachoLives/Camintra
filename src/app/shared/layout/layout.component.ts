import { Component, OnInit, inject } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { FooterComponent } from '../footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { SesionService } from '../../core/services/sesion.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [HeaderComponent, SidebarComponent, FooterComponent, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css'],
})
export class LayoutComponent implements OnInit {
  private sesion = inject(SesionService);

  readonly user = this.sesion.nombre;
  error = '';

  ngOnInit() {
    // El guard ya suele dejar la sesión cargada; esto cubre un refresco duro
    if (!this.sesion.usuario() && this.sesion.autenticado) {
      this.sesion.refrescar().subscribe({
        error: (err) => {
          this.error = 'No se pudo cargar el usuario';
          console.error(err);
        },
      });
    }
  }
}
