import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { SesionService } from '../../../core/services/sesion.service';
import { Usuario, Rol } from '../../../core/models/intranet.models';

/**
 * Panel de usuarios.
 *
 * Mostraba dos filas inventadas en código -- Cristian Camacho de MiEmpresa
 * y Ana Gómez de TechCorp -- con columnas que la intranet no tiene
 * (empresa, cédula, edad, grupo). "Editar" abría un alert() y "Eliminar"
 * borraba del array local, así que al recargar la página volvía todo.
 *
 * Ahora lee /api/users, que pagina en el servidor, y las acciones son las
 * que el backend realmente permite: cambiar el rol y desactivar (baja
 * lógica, porque el usuario es autor de comunicados y documentos).
 */
@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent implements OnInit {
  private usuarios = inject(UserService);
  private sesion = inject(SesionService);

  readonly roles: Rol[] = ['admin', 'editor', 'colaborador'];

  items: Usuario[] = [];
  total = 0;
  pagina = 1;
  readonly porPagina = 10;
  totalPaginas = 1;

  busqueda = '';
  cargando = false;
  error = '';
  mensaje = '';

  /** Para no dejar que un admin se quite su propio rol por accidente */
  get miId(): number | null {
    return this.sesion.usuario()?.id ?? null;
  }

  get paginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando = true;
    this.error = '';

    this.usuarios
      .listar({
        email: this.busqueda.trim() || undefined,
        page: this.pagina,
        limit: this.porPagina,
      })
      .subscribe({
        next: pagina => {
          this.items = pagina.items;
          this.total = pagina.total;
          this.totalPaginas = pagina.totalPaginas;
          this.cargando = false;
        },
        error: (err: Error) => {
          this.error = err.message;
          this.cargando = false;
        },
      });
  }

  // La búsqueda la resuelve el servidor: filtrar en el navegador solo
  // encontraría coincidencias dentro de la página que ya se trajo.
  buscar(): void {
    this.pagina = 1;
    this.cargar();
  }

  cambiarPagina(pagina: number): void {
    if (pagina === this.pagina) return;

    this.pagina = pagina;
    this.cargar();
  }

  cambiarRol(usuario: Usuario, rol: Rol): void {
    if (rol === usuario.rol) return;

    this.aplicar(
      this.usuarios.actualizar(usuario.id, { rol }),
      `Rol de ${usuario.nombre} actualizado a ${rol}`
    );
  }

  desactivar(usuario: Usuario): void {
    this.aplicar(
      this.usuarios.desactivar(usuario.id),
      `${usuario.nombre} quedó desactivado`
    );
  }

  reactivar(usuario: Usuario): void {
    this.aplicar(
      this.usuarios.actualizar(usuario.id, { activo: true }),
      `${usuario.nombre} quedó activo`
    );
  }

  // Las tres acciones hacen lo mismo con la respuesta: avisar y recargar
  private aplicar(peticion: Observable<unknown>, exito: string): void {
    this.mensaje = '';
    this.error = '';

    peticion.subscribe({
      next: () => {
        this.mensaje = exito;
        this.cargar();
      },
      error: (err: Error) => (this.error = err.message),
    });
  }
}
