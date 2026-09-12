import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DirectorioService } from '../../directorio.service';
import { SesionService } from '../../../core/services/sesion.service';
import { Colaborador, Departamento } from '../../../core/models/intranet.models';

@Component({
  selector: 'app-directorio-ficha',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './ficha.component.html',
})
export class DirectorioFichaComponent implements OnInit {
  private ruta = inject(ActivatedRoute);
  private servicio = inject(DirectorioService);
  private sesion = inject(SesionService);

  colaborador = signal<Colaborador | null>(null);
  departamentos = signal<Departamento[]>([]);
  cargando = signal(true);
  guardando = signal(false);
  error = signal('');
  mensaje = signal('');
  editando = signal(false);

  /** La misma regla del backend: la propia ficha, o cualquiera si es admin */
  puedeEditar = signal(false);

  modelo: Partial<Colaborador> = {};

  ngOnInit(): void {
    const usuarioId = this.ruta.snapshot.paramMap.get('usuarioId');
    if (!usuarioId) {
      this.error.set('Colaborador no encontrado');
      this.cargando.set(false);
      return;
    }

    this.servicio.obtener(usuarioId).subscribe({
      next: c => {
        this.colaborador.set(c);
        this.modelo = { ...c };
        this.puedeEditar.set(
          this.sesion.esAdmin() || c.usuario_id === this.sesion.usuario()?.id
        );
        this.cargando.set(false);
      },
      error: err => {
        this.error.set(err.message);
        this.cargando.set(false);
      },
    });

    this.servicio.departamentos().subscribe({
      next: deps => this.departamentos.set(deps),
      error: () => this.departamentos.set([]),
    });
  }

  editar(): void {
    this.modelo = { ...this.colaborador() };
    this.editando.set(true);
    this.mensaje.set('');
  }

  cancelar(): void {
    this.editando.set(false);
    this.error.set('');
  }

  guardar(): void {
    const actual = this.colaborador();
    if (!actual) return;

    this.guardando.set(true);
    this.error.set('');

    this.servicio
      .guardarFicha(actual.usuario_id, {
        cargo: this.modelo.cargo,
        departamento_id: this.modelo.departamento_id,
        extension: this.modelo.extension,
        celular: this.modelo.celular,
        sede: this.modelo.sede,
        fecha_ingreso: this.modelo.fecha_ingreso,
      })
      .subscribe({
        next: c => {
          this.colaborador.set(c);
          this.editando.set(false);
          this.guardando.set(false);
          this.mensaje.set('Ficha actualizada');
        },
        error: err => {
          this.error.set(err.message);
          this.guardando.set(false);
        },
      });
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
