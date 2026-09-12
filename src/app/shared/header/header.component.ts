import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { NotificacionesService } from '../../core/services/notificaciones.service';
import { Notificacion } from '../../core/models/intranet.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  private notificaciones = inject(NotificacionesService);

  readonly items = this.notificaciones.items;
  readonly noLeidas = this.notificaciones.noLeidas;

  currentRoute = '';
  panelAbierto = signal(false);

  ngOnInit(): void {
    this.currentRoute = this.titulo(this.router.url);

    this.router.events
      .pipe(filter(evento => evento instanceof NavigationEnd))
      .subscribe(evento => {
        this.currentRoute = this.titulo((evento as NavigationEnd).urlAfterRedirects);
      });

    this.notificaciones.cargar().subscribe({ error: () => undefined });
  }

  togglePanel(): void {
    this.panelAbierto.update(abierto => !abierto);
  }

  abrir(n: Notificacion): void {
    this.panelAbierto.set(false);

    if (!n.leida) {
      this.notificaciones.marcarLeida(n.id).subscribe({ error: () => undefined });
    }

    if (n.enlace) {
      this.router.navigateByUrl(n.enlace);
    }
  }

  marcarTodas(): void {
    this.notificaciones.marcarTodas().subscribe({ error: () => undefined });
  }

  /** "/comunicados/3" -> "Comunicados" */
  private titulo(url: string): string {
    const segmento = url.split('?')[0].split('/').filter(Boolean)[0] ?? 'Inicio';

    return segmento.charAt(0).toUpperCase() + segmento.slice(1);
  }
}
