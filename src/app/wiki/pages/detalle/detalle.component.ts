import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WikiService } from '../../wiki.service';
import { SesionService } from '../../../core/services/sesion.service';
import { Documento } from '../../../core/models/intranet.models';

@Component({
  selector: 'app-wiki-detalle',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './detalle.component.html',
})
export class WikiDetalleComponent implements OnInit {
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);
  private servicio = inject(WikiService);
  private sesion = inject(SesionService);

  documento = signal<Documento | null>(null);
  cargando = signal(true);
  error = signal('');
  puedeEditar = signal(false);

  ngOnInit(): void {
    const slug = this.ruta.snapshot.paramMap.get('slug');
    if (!slug) {
      this.error.set('Documento no encontrado');
      this.cargando.set(false);
      return;
    }

    this.servicio.obtenerPorSlug(slug).subscribe({
      next: d => {
        this.documento.set(d);
        this.puedeEditar.set(
          this.sesion.esAdmin() || d.autor_id === this.sesion.usuario()?.id
        );
        this.cargando.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.cargando.set(false);
      },
    });
  }

  eliminar(): void {
    const d = this.documento();
    if (!d) return;

    if (!confirm(`¿Eliminar el documento "${d.titulo}"?`)) return;

    this.servicio.eliminar(d.id).subscribe({
      next: () => this.router.navigate(['/wiki']),
      error: err => this.error.set(err.message),
    });
  }
}
