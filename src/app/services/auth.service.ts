import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { ApiService } from '../core/services/api.service';
import { SesionService } from '../core/services/sesion.service';
import { TOKEN_KEY } from '../core/interceptors/auth.interceptor';
import { Usuario, Rol } from '../core/models/intranet.models';

export interface LoginData {
  token: string;
  id: number;
  nombre: string;
  rol: Rol;
}

export interface RegisterData {
  user: {
    id: number;
    nombre: string;
    email: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private api = inject(ApiService);
  private sesion = inject(SesionService);
  private router = inject(Router);

  login(email: string, password: string): Observable<LoginData> {
    return this.api
      .post<LoginData>('/auth/login', { email, password })
      .pipe(
        tap(data => {
          this.saveToken(data.token);
          this.sesion.guardar({
            id: data.id,
            nombre: data.nombre,
            email,
            rol: data.rol,
            activo: true,
          } as Usuario);
        })
      );
  }

  register(
    nombre: string,
    email: string,
    password: string
  ): Observable<RegisterData> {
    return this.api.post<RegisterData>('/auth/register', {
      nombre,
      email: email.trim().toLowerCase(),
      password,
    });
  }

  verifyToken(): Observable<{ user: Usuario }> {
    return this.api.get<{ user: Usuario }>('/auth/verify');
  }

  saveToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  getToken(): string | null {
    return this.sesion.token;
  }

  logout(): void {
    this.sesion.limpiar();
    this.router.navigate(['/Ingreso']);
  }

  isAuthenticated(): boolean {
    return this.sesion.autenticado;
  }
}
