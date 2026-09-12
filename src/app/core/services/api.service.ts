import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/intranet.models';

/**
 * Envoltorio único sobre HttpClient para hablar con RestCamintra.
 *
 * Desempaca el sobre { success, message, data } para que los componentes
 * reciban directamente el dato, y traduce los errores del backend a un
 * Error con el mensaje que el servidor ya envía en español.
 */
@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  get<T>(ruta: string, params?: Record<string, any>): Observable<T> {
    return this.http
      .get<ApiResponse<T>>(`${this.base}${ruta}`, {
        params: this.construirParams(params),
      })
      .pipe(map(res => res.data), catchError(this.manejarError));
  }

  post<T>(ruta: string, body: unknown = {}): Observable<T> {
    return this.http
      .post<ApiResponse<T>>(`${this.base}${ruta}`, body)
      .pipe(map(res => res.data), catchError(this.manejarError));
  }

  put<T>(ruta: string, body: unknown = {}): Observable<T> {
    return this.http
      .put<ApiResponse<T>>(`${this.base}${ruta}`, body)
      .pipe(map(res => res.data), catchError(this.manejarError));
  }

  delete<T>(ruta: string): Observable<T> {
    return this.http
      .delete<ApiResponse<T>>(`${this.base}${ruta}`)
      .pipe(map(res => res.data), catchError(this.manejarError));
  }

  // Descarta los filtros vacíos para no mandar ?q=&categoria=
  private construirParams(params?: Record<string, any>): HttpParams {
    let httpParams = new HttpParams();

    if (!params) return httpParams;

    Object.entries(params).forEach(([clave, valor]) => {
      if (valor !== undefined && valor !== null && valor !== '') {
        httpParams = httpParams.set(clave, String(valor));
      }
    });

    return httpParams;
  }

  private manejarError(error: HttpErrorResponse) {
    const mensaje =
      error.error?.message ||
      (error.status === 0
        ? 'No se pudo conectar con el servidor'
        : `Error ${error.status}: ${error.statusText}`);

    return throwError(() => new Error(mensaje));
  }
}
