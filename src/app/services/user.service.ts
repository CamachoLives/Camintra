// src/app/services/user.service.ts
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { SesionService } from '../core/services/sesion.service';
import { Usuario, Paginado } from '../core/models/intranet.models';

/**
 * Usuarios de la intranet.
 *
 * La sesión vive en SesionService; aquí quedan las consultas al backend.
 * El token ya no se arma a mano: lo pone el interceptor.
 */
@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = inject(ApiService);
  private sesion = inject(SesionService);

  /** Datos del usuario del token */
  getInformation(): Observable<Usuario> {
    return this.sesion.refrescar();
  }

  listar(filtros?: {
    email?: string;
    rol?: string;
    page?: number;
    limit?: number;
  }): Observable<Usuario[]> {
    return this.api.get<Usuario[]>('/users', filtros);
  }

  obtener(id: number): Observable<Usuario> {
    return this.api.get<Usuario>(`/users/${id}`);
  }

  actualizar(id: number, datos: Partial<Usuario>): Observable<Usuario> {
    return this.api.put<Usuario>(`/users/${id}`, datos);
  }

  desactivar(id: number): Observable<void> {
    return this.api.delete<void>(`/users/${id}`);
  }

  setUser(usuario: Usuario): void {
    this.sesion.guardar(usuario);
  }

  getUser(): Usuario | null {
    return this.sesion.usuario();
  }

  loadUser(): Usuario | null {
    return this.sesion.usuario();
  }

  clearUser(): void {
    this.sesion.limpiar();
  }
}
