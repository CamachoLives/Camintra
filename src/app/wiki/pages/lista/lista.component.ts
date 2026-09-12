import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { WikiService, CategoriaWiki } from '../../wiki.service';
import { SesionService } from '../../../core/services/sesion.service';
import { Documento } from '../../../core/models/intranet.models';

@Component({
  selector: 'app-wiki-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lista.component.html',
})
export class WikiListaComponent implements OnInit {
  private servicio = inject(WikiService);
  private sesion = inject(SesionService);

  readonly puedePublicar = this.sesion.puedePublicar;

  documentos = signal<Documento[]>([]);
  categorias = signal<CategoriaWiki[]>([]);
  cargando = signal(true);
  error = signal('');

  total = signal(0);
  pagina = signal(1);
  totalPaginas = signal(1);

  busqueda = '';
  categoria = '';
  etiqueta = '';

  ngOnInit(): void {
    this.servicio.categorias().subscribe({
      next: cats => this.categorias.set(cats),
      error: () => this.categorias.set([]),
    });

    this.cargar();
  }

  cargar(pagina = 1): void {
    this.cargando.set(true);
    this.error.set('');

    this.servicio
      .listar({
        q: this.busqueda,
        categoria: this.categoria,
        etiqueta: this.etiqueta,
        borradores: this.puedePublicar(),
        page: pagina,
        limit: 10,
      })
      .subscribe({
        next: res => {
          this.documentos.set(res.items);
          this.total.set(res.total);
          this.pagina.set(res.page);
          this.totalPaginas.set(res.totalPaginas);
          this.cargando.set(false);
        },
        error: err => {
          this.error.set(err.message);
          this.cargando.set(false);
        },
      });
  }

  filtrarPorCategoria(nombre: string): void {
    this.categoria = this.categoria === nombre ? '' : nombre;
    this.cargar();
  }

  filtrarPorEtiqueta(nombre: string): void {
    this.etiqueta = nombre;
    this.cargar();
  }

  limpiar(): void {
    this.busqueda = '';
    this.categoria = '';
    this.etiqueta = '';
    this.cargar();
  }
}
