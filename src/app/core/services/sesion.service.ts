import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Usuario, Rol } from '../models/intranet.models';
import { TOKEN_KEY } from '../interceptors/auth.interceptor';

const USUARIO_KEY = 'camintraUsuario';

/**
 * Quién está usando la intranet. Se expone como señal para que el layout,
 * el sidebar y las vistas reaccionen sin suscripciones manuales.
 */
@Injectable({ providedIn: 'root' })
export class SesionService {
  private api = inject(ApiService);
  private platformId = inject(PLATFORM_ID);

  private readonly _usuario = signal<Usuario | null>(this.leerDeStorage());

  readonly usuario = this._usuario.asReadonly();
  readonly nombre = computed(() => this._usuario()?.nombre ?? '');
  readonly rol = computed<Rol | null>(() => this._usuario()?.rol ?? null);

  /** Puede publicar comunicados, eventos y documentos */
  readonly puedePublicar = computed(() =>
    ['admin', 'editor'].includes(this._usuario()?.rol ?? '')
  );

  readonly esAdmin = computed(() => this._usuario()?.rol === 'admin');

  get token(): string | null {
    return this.esNavegador ? localStorage.getItem(TOKEN_KEY) : null;
  }

  get autenticado(): boolean {
    return !!this.token;
  }

  guardar(usuario: Usuario): void {
    this._usuario.set(usuario);

    if (this.esNavegador) {
      localStorage.setItem(USUARIO_KEY, JSON.stringify(usuario));
    }
  }

  /** Recupera el usuario del backend cuando solo se tiene el token */
  refrescar(): Observable<Usuario> {
    return this.api
      .get<Usuario>('/users/me')
      .pipe(tap(usuario => this.guardar(usuario)));
  }

  limpiar(): void {
    this._usuario.set(null);

    if (this.esNavegador) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USUARIO_KEY);
      sessionStorage.removeItem('userData');
    }
  }

  private get esNavegador(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private leerDeStorage(): Usuario | null {
    if (!isPlatformBrowser(this.platformId)) return null;

    try {
      const guardado = localStorage.getItem(USUARIO_KEY);
      return guardado ? (JSON.parse(guardado) as Usuario) : null;
    } catch {
      return null;
    }
  }
}
