import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { WikiService } from '../../wiki.service';
import { DirectorioService } from '../../../directorio/directorio.service';
import { Documento, Departamento } from '../../../core/models/intranet.models';

@Component({
  selector: 'app-wiki-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './editor.component.html',
})
export class WikiEditorComponent implements OnInit {
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);
  private servicio = inject(WikiService);
  private directorio = inject(DirectorioService);

  departamentos = signal<Departamento[]>([]);
  guardando = signal(false);
  error = signal('');
  id = signal<number | null>(null);

  /** Las etiquetas se escriben separadas por coma */
  etiquetasTexto = '';

  modelo: Partial<Documento> = {
    titulo: '',
    resumen: '',
    contenido: '',
    categoria: 'General',
    estado: 'borrador',
    departamento_id: null,
  };

  ngOnInit(): void {
    this.directorio.departamentos().subscribe({
      next: deps => this.departamentos.set(deps),
      error: () => this.departamentos.set([]),
    });

    const slug = this.ruta.snapshot.paramMap.get('slug');
    if (!slug) return;

    this.servicio.obtenerPorSlug(slug).subscribe({
      next: d => {
        this.modelo = { ...d };
        this.id.set(d.id);
        this.etiquetasTexto = (d.etiquetas ?? []).join(', ');
      },
      error: err => this.error.set(err.message),
    });
  }

  guardar(publicar = false): void {
    if (!this.modelo.titulo?.trim() || !this.modelo.contenido?.trim()) {
      this.error.set('El título y el contenido son obligatorios');
      return;
    }

    this.guardando.set(true);
    this.error.set('');

    const datos: Partial<Documento> = {
      titulo: this.modelo.titulo,
      resumen: this.modelo.resumen,
      contenido: this.modelo.contenido,
      categoria: this.modelo.categoria,
      departamento_id: this.modelo.departamento_id,
      estado: publicar ? 'publicado' : this.modelo.estado,
      etiquetas: this.etiquetasTexto
        .split(',')
        .map(e => e.trim())
        .filter(Boolean),
    };

    const id = this.id();
    const peticion = id
      ? this.servicio.actualizar(id, datos)
      : this.servicio.crear(datos);

    peticion.subscribe({
      next: d => {
        this.guardando.set(false);
        this.router.navigate(['/wiki', d.slug]);
      },
      error: err => {
        this.error.set(err.message);
        this.guardando.set(false);
      },
    });
  }
}
