import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { Evento, Departamento } from '../core/models/intranet.models';

export interface FiltrosEventos {
  desde?: string;
  hasta?: string;
  tipo?: string;
  departamentoId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class CalendarioService {
  private api = inject(ApiService);

  listar(filtros: FiltrosEventos = {}): Observable<Evento[]> {
    return this.api.get<Evento[]>('/eventos', filtros);
  }

  proximos(limite = 5): Observable<Evento[]> {
    return this.api.get<Evento[]>('/eventos/proximos', { limite });
  }

  obtener(id: number): Observable<Evento> {
    return this.api.get<Evento>(`/eventos/${id}`);
  }

  crear(datos: Partial<Evento>): Observable<Evento> {
    return this.api.post<Evento>('/eventos', datos);
  }

  actualizar(id: number, datos: Partial<Evento>): Observable<Evento> {
    return this.api.put<Evento>(`/eventos/${id}`, datos);
  }

  eliminar(id: number): Observable<void> {
    return this.api.delete<void>(`/eventos/${id}`);
  }

  departamentos(): Observable<Departamento[]> {
    return this.api.get<Departamento[]>('/directorio/departamentos');
  }
}
