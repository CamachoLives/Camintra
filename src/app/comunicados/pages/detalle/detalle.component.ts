import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ComunicadosService } from '../../comunicados.service';
import { SesionService } from '../../../core/services/sesion.service';
import { Comunicado } from '../../../core/models/intranet.models';

@Component({
  selector: 'app-comunicado-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle.component.html',
})
export class ComunicadoDetalleComponent implements OnInit {
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);
  private servicio = inject(ComunicadosService);
  private sesion = inject(SesionService);

  comunicado = signal<Comunicado | null>(null);
  cargando = signal(true);
  error = signal('');

  /** Solo el autor o un admin ven los botones de edición */
  puedeEditar = signal(false);

  ngOnInit(): void {
    const id = this.ruta.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Comunicado no encontrado');
      this.cargando.set(false);
      return;
    }

    this.servicio.obtener(id).subscribe({
      next: c => {
        this.comunicado.set(c);
        this.puedeEditar.set(
          this.sesion.esAdmin() || c.autor_id === this.sesion.usuario()?.id
        );
        this.cargando.set(false);

        // Abrirlo cuenta como leerlo
        if (!c.leido) {
          this.servicio.marcarLeido(c.id).subscribe({
            next: () => this.comunicado.set({ ...c, leido: true }),
            error: () => undefined,
          });
        }
      },
      error: err => {
        this.error.set(err.message);
        this.cargando.set(false);
      },
    });
  }

  eliminar(): void {
    const c = this.comunicado();
    if (!c) return;

    if (!confirm(`¿Eliminar el comunicado "${c.titulo}"?`)) return;

    this.servicio.eliminar(c.id).subscribe({
      next: () => this.router.navigate(['/comunicados']),
      error: err => this.error.set(err.message),
    });
  }
}
