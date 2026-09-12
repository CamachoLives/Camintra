import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SesionService } from '../../core/services/sesion.service';
import { ComunicadosService } from '../../comunicados/comunicados.service';
import { AuthService } from '../../services/auth.service';

interface ItemMenu {
  etiqueta: string;
  ruta: string;
  icono: string;
  /** Solo se muestra a quien puede publicar */
  soloPublicadores?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterModule, CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent implements OnInit {
  private sesion = inject(SesionService);
  private comunicados = inject(ComunicadosService);
  private auth = inject(AuthService);

  readonly usuario = this.sesion.usuario;
  readonly nombre = this.sesion.nombre;
  readonly rol = this.sesion.rol;
  readonly esAdmin = this.sesion.esAdmin;

  /** Badge de comunicados sin leer */
  readonly noLeidos = this.comunicados.noLeidos;

  isSidebarOpen = false;

  // Los iconos son paths de Heroicons, que es lo que ya usaba la plantilla
  readonly menu: ItemMenu[] = [
    {
      etiqueta: 'Inicio',
      ruta: '/Inicio',
      icono:
        'M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21m0 0h4.5V3.545M12.75 21h7.5V10.75M2.25 21h1.5m18 0h-18M2.25 9l4.5-1.636M18.75 3l-1.5.545m0 6.205 3 1m1.5.5-1.5-.5M6.75 7.364V3h-3v18m3-13.636 10.5-3.819',
    },
    {
      etiqueta: 'Comunicados',
      ruta: '/comunicados',
      icono:
        'M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z',
    },
    {
      etiqueta: 'Calendario',
      ruta: '/calendario',
      icono:
        'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5',
    },
    {
      etiqueta: 'Directorio',
      ruta: '/directorio',
      icono:
        'M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z',
    },
    {
      etiqueta: 'Wiki',
      ruta: '/wiki',
      icono:
        'M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25',
    },
    {
      etiqueta: 'Configuración',
      ruta: '/configuracion',
      soloPublicadores: true,
      icono:
        'M11.42 15.17 17.25 21A2.652 2.652 0 0 0 21 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 1 1-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 0 0 4.486-6.336l-3.276 3.277a3.004 3.004 0 0 1-2.25-2.25l3.276-3.276a4.5 4.5 0 0 0-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26',
    },
  ];

  ngOnInit(): void {
    // Trae el contador de no leidos para el badge
    this.comunicados.listar({ limit: 1 }).subscribe({ error: () => undefined });
  }

  get itemsVisibles(): ItemMenu[] {
    return this.menu.filter(
      item => !item.soloPublicadores || this.sesion.puedePublicar()
    );
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  cerrarSesion(): void {
    this.auth.logout();
  }

  iniciales(nombre: string): string {
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(parte => parte[0].toUpperCase())
      .join('');
  }
}
