import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { Notificacion } from '../models/intranet.models';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  private api = inject(ApiService);

  readonly items = signal<Notificacion[]>([]);
  readonly noLeidas = signal(0);

  cargar(limite = 10): Observable<{ items: Notificacion[]; noLeidas: number }> {
    return this.api
      .get<{ items: Notificacion[]; noLeidas: number }>('/notificaciones', {
        limite,
      })
      .pipe(
        tap(res => {
          this.items.set(res.items);
          this.noLeidas.set(res.noLeidas);
        })
      );
  }

  marcarLeida(id: number): Observable<{ noLeidas: number }> {
    return this.api
      .post<{ noLeidas: number }>(`/notificaciones/${id}/leida`)
      .pipe(
        tap(res => {
          this.noLeidas.set(res.noLeidas);
          this.items.update(items =>
            items.map(n => (n.id === id ? { ...n, leida: true } : n))
          );
        })
      );
  }

  marcarTodas(): Observable<{ marcadas: number; noLeidas: number }> {
    return this.api
      .post<{ marcadas: number; noLeidas: number }>('/notificaciones/leer-todas')
      .pipe(
        tap(() => {
          this.noLeidas.set(0);
          this.items.update(items => items.map(n => ({ ...n, leida: true })));
        })
      );
  }
}
