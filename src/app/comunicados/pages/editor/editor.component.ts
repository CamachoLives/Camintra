import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ComunicadosService } from '../../comunicados.service';
import { Categoria, Comunicado } from '../../../core/models/intranet.models';

@Component({
  selector: 'app-comunicado-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './editor.component.html',
})
export class ComunicadoEditorComponent implements OnInit {
  private ruta = inject(ActivatedRoute);
  private router = inject(Router);
  private servicio = inject(ComunicadosService);

  categorias = signal<Categoria[]>([]);
  guardando = signal(false);
  error = signal('');
  id = signal<number | null>(null);

  modelo: Partial<Comunicado> = {
    titulo: '',
    resumen: '',
    contenido: '',
    categoria_id: null,
    imagen_url: '',
    prioridad: 'normal',
    estado: 'borrador',
    fijado: false,
    expira_en: null,
  };

  ngOnInit(): void {
    this.servicio.categorias().subscribe({
      next: cats => this.categorias.set(cats),
      error: () => this.categorias.set([]),
    });

    const id = this.ruta.snapshot.paramMap.get('id');
    if (!id) return;

    this.id.set(Number(id));
    this.servicio.obtener(id).subscribe({
      next: c =>
        (this.modelo = {
          ...c,
          // El input date solo acepta yyyy-MM-dd
          expira_en: c.expira_en ? c.expira_en.substring(0, 10) : null,
        }),
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

    const datos: Partial<Comunicado> = {
      ...this.modelo,
      estado: publicar ? 'publicado' : this.modelo.estado,
    };

    const id = this.id();
    const peticion = id
      ? this.servicio.actualizar(id, datos)
      : this.servicio.crear(datos);

    peticion.subscribe({
      next: c => {
        this.guardando.set(false);
        this.router.navigate(['/comunicados', c.id]);
      },
      error: err => {
        this.error.set(err.message);
        this.guardando.set(false);
      },
    });
  }
}
