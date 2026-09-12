import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ComunicadosService } from '../../comunicados.service';
import { SesionService } from '../../../core/services/sesion.service';
import { Comunicado, Categoria } from '../../../core/models/intranet.models';

@Component({
  selector: 'app-comunicados-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lista.component.html',
})
export class ComunicadosListaComponent implements OnInit {
  private servicio = inject(ComunicadosService);
  private sesion = inject(SesionService);

  readonly puedePublicar = this.sesion.puedePublicar;

  comunicados = signal<Comunicado[]>([]);
  categorias = signal<Categoria[]>([]);
  cargando = signal(true);
  error = signal('');

  total = signal(0);
  noLeidos = signal(0);
  pagina = signal(1);
  totalPaginas = signal(1);

  // Filtros del formulario
  busqueda = '';
  categoriaId: number | null = null;
  prioridad = '';
  soloNoLeidos = false;

  readonly prioridades = [
    { valor: '', etiqueta: 'Todas las prioridades' },
    { valor: 'urgente', etiqueta: 'Urgente' },
    { valor: 'alta', etiqueta: 'Alta' },
    { valor: 'normal', etiqueta: 'Normal' },
    { valor: 'baja', etiqueta: 'Baja' },
  ];

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
        categoriaId: this.categoriaId,
        prioridad: this.prioridad,
        noLeidos: this.soloNoLeidos,
        borradores: this.puedePublicar(),
        page: pagina,
        limit: 9,
      })
      .subscribe({
        next: res => {
          this.comunicados.set(res.items);
          this.total.set(res.total);
          this.noLeidos.set(res.noLeidos);
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

  limpiarFiltros(): void {
    this.busqueda = '';
    this.categoriaId = null;
    this.prioridad = '';
    this.soloNoLeidos = false;
    this.cargar();
  }

  // Colores de la etiqueta de prioridad
  colorPrioridad(prioridad: string): string {
    switch (prioridad) {
      case 'urgente':
        return 'bg-red-100 text-red-700';
      case 'alta':
        return 'bg-orange-100 text-orange-700';
      case 'baja':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  }
}
