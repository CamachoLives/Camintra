import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DirectorioService } from '../../directorio.service';
import { Colaborador, Departamento } from '../../../core/models/intranet.models';

@Component({
  selector: 'app-directorio-lista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lista.component.html',
})
export class DirectorioListaComponent implements OnInit {
  private servicio = inject(DirectorioService);

  colaboradores = signal<Colaborador[]>([]);
  departamentos = signal<Departamento[]>([]);
  cargando = signal(true);
  error = signal('');

  total = signal(0);
  pagina = signal(1);
  totalPaginas = signal(1);

  busqueda = '';
  departamentoId: number | null = null;

  ngOnInit(): void {
    this.servicio.departamentos().subscribe({
      next: deps => this.departamentos.set(deps),
      error: () => this.departamentos.set([]),
    });

    this.cargar();
  }

  cargar(pagina = 1): void {
    this.cargando.set(true);
    this.error.set('');

    this.servicio
      .listar({
        q: this.busqueda,
        departamentoId: this.departamentoId,
        page: pagina,
        limit: 12,
      })
      .subscribe({
        next: res => {
          this.colaboradores.set(res.items);
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

  filtrarPorDepartamento(id: number | null): void {
    this.departamentoId = id;
    this.cargar();
  }

  limpiar(): void {
    this.busqueda = '';
    this.departamentoId = null;
    this.cargar();
  }

  /** Iniciales para el avatar cuando no hay foto */
  iniciales(nombre: string): string {
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(parte => parte[0].toUpperCase())
      .join('');
  }
}
