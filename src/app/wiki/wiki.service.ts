import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { Documento, Paginado } from '../core/models/intranet.models';

export interface FiltrosWiki {
  q?: string;
  categoria?: string;
  etiqueta?: string;
  borradores?: boolean;
  page?: number;
  limit?: number;
}

export interface CategoriaWiki {
  nombre: string;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class WikiService {
  private api = inject(ApiService);

  listar(filtros: FiltrosWiki = {}): Observable<Paginado<Documento>> {
    return this.api.get<Paginado<Documento>>('/documentos', {
      q: filtros.q,
      categoria: filtros.categoria,
      etiqueta: filtros.etiqueta,
      borradores: filtros.borradores ? 'true' : '',
      page: filtros.page,
      limit: filtros.limit,
    });
  }

  /** El detalle va por slug, que es lo que se ve en la URL */
  obtenerPorSlug(slug: string): Observable<Documento> {
    return this.api.get<Documento>(`/documentos/${slug}`);
  }

  categorias(): Observable<CategoriaWiki[]> {
    return this.api.get<CategoriaWiki[]>('/documentos/categorias');
  }

  crear(datos: Partial<Documento>): Observable<Documento> {
    return this.api.post<Documento>('/documentos', datos);
  }

  actualizar(id: number, datos: Partial<Documento>): Observable<Documento> {
    return this.api.put<Documento>(`/documentos/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.api.delete<void>(`/documentos/${id}`);
  }
}
