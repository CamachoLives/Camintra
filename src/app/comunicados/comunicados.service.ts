import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import {
  Comunicado,
  ListadoComunicados,
  Categoria,
} from '../core/models/intranet.models';

export interface FiltrosComunicados {
  q?: string;
  categoriaId?: number | null;
  prioridad?: string;
  noLeidos?: boolean;
  borradores?: boolean;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class ComunicadosService {
  private api = inject(ApiService);

  /** Alimenta el badge del sidebar; se actualiza en cada listado */
  readonly noLeidos = signal(0);

  listar(filtros: FiltrosComunicados = {}): Observable<ListadoComunicados> {
    return this.api
      .get<ListadoComunicados>('/comunicados', {
        q: filtros.q,
        categoriaId: filtros.categoriaId,
        prioridad: filtros.prioridad,
        noLeidos: filtros.noLeidos ? 'true' : '',
        borradores: filtros.borradores ? 'true' : '',
        page: filtros.page,
        limit: filtros.limit,
      })
      .pipe(tap(res => this.noLeidos.set(res.noLeidos)));
  }

  obtener(id: number | string): Observable<Comunicado> {
    return this.api.get<Comunicado>(`/comunicados/${id}`);
  }

  categorias(): Observable<Categoria[]> {
    return this.api.get<Categoria[]>('/comunicados/categorias');
  }

  crear(datos: Partial<Comunicado>): Observable<Comunicado> {
    return this.api.post<Comunicado>('/comunicados', datos);
  }

  actualizar(id: number, datos: Partial<Comunicado>): Observable<Comunicado> {
    return this.api.put<Comunicado>(`/comunicados/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.api.delete<void>(`/comunicados/${id}`);
  }

  marcarLeido(id: number): Observable<{ noLeidos: number }> {
    return this.api
      .post<{ noLeidos: number }>(`/comunicados/${id}/leido`)
      .pipe(tap(res => this.noLeidos.set(res.noLeidos)));
  }
}
