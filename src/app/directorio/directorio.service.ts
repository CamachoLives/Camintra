import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import {
  Colaborador,
  Departamento,
  Paginado,
} from '../core/models/intranet.models';

export interface FiltrosDirectorio {
  q?: string;
  departamentoId?: number | null;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class DirectorioService {
  private api = inject(ApiService);

  listar(filtros: FiltrosDirectorio = {}): Observable<Paginado<Colaborador>> {
    return this.api.get<Paginado<Colaborador>>('/directorio', {
      q: filtros.q,
      departamentoId: filtros.departamentoId,
      page: filtros.page,
      limit: filtros.limit,
    });
  }

  obtener(usuarioId: number | string): Observable<Colaborador> {
    return this.api.get<Colaborador>(`/directorio/${usuarioId}`);
  }

  guardarFicha(
    usuarioId: number,
    datos: Partial<Colaborador>
  ): Observable<Colaborador> {
    return this.api.put<Colaborador>(`/directorio/${usuarioId}`, datos);
  }

  departamentos(): Observable<Departamento[]> {
    return this.api.get<Departamento[]>('/directorio/departamentos');
  }

  crearDepartamento(datos: {
    nombre: string;
    descripcion?: string;
    colorHex?: string;
  }): Observable<Departamento> {
    return this.api.post<Departamento>('/directorio/departamentos', datos);
  }
}
