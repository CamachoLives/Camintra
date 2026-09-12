import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { SesionService } from '../../core/services/sesion.service';
import { ResumenIntranet } from '../../core/models/intranet.models';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
})
export class inicioComponent implements OnInit {
  private dashboard = inject(DashboardService);
  private sesion = inject(SesionService);

  readonly nombre = this.sesion.nombre;

  resumen = signal<ResumenIntranet | null>(null);
  cargando = signal(true);
  error = signal('');

  /** La barra de la gráfica se escala contra el área más poblada */
  readonly maxPorDepartamento = computed(() => {
    const datos = this.resumen()?.colaboradoresPorDepartamento ?? [];
    return Math.max(1, ...datos.map(d => d.total));
  });

  ngOnInit(): void {
    this.dashboard.resumen().subscribe({
      next: datos => {
        this.resumen.set(datos);
        this.cargando.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.cargando.set(false);
      },
    });
  }

  get saludo(): string {
    const hora = new Date().getHours();

    if (hora < 12) return 'Buenos días';
    if (hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
  }

  anchoBarra(total: number): string {
    return `${(total / this.maxPorDepartamento()) * 100}%`;
  }
}
