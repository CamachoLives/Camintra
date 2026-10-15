import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';

/** Lo que manda el formulario de parametrización */
export interface ParametrizacionPlataforma {
  logo: string;
  favicon: string;
  color: string;
  path: string;
  idioma: string;
  sitionombre: string;
  emailsoporte: string;
  tiemposesion: string | number;
  caducidad: string | number;
  longitudminimapass: string | number;
  maximointentos: string | number;
  autenticacion: boolean | string;
  dashboard: boolean | string;
  carousel: boolean | string;
  Mantenimiento: boolean | string;
}

/** Lo que devuelve la tabla plataforma */
export interface PlataformaGuardada {
  id: number;
  logo_url: string;
  favicon_url: string;
  color_hex: string;
  ruta_almacenamiento: string;
  idioma: string;
  nombre_sitio: string;
  email_soporte: string;
  tiempo_sesion_minutos: number;
  requiere_autenticacion: boolean;
  mostrar_dashboard: boolean;
  mostrar_carousel: boolean;
  pass_longitud_minima: number;
  pass_caducidad_dias: number;
  modo_mantenimiento: boolean;
  max_intentos_login: number;
  updated_at: string;
}

/**
 * Parametrización de la plataforma.
 *
 * Este servicio tenía tres fallos que entre todos hacían imposible guardar
 * la configuración:
 *
 * 1. Mandaba `{ headers, data }` como cuerpo del POST. Las cabeceras iban
 *    dentro del JSON y el backend leía req.body.logo, que era undefined:
 *    cada guardado escribía nulos en todas las columnas.
 * 2. Leía el token de localStorage['token'], pero el login lo guarda en
 *    'authToken', así que la cabecera salía como "Bearer null" y el
 *    endpoint respondía 401.
 * 3. La URL estaba escrita a mano con http://localhost:7000, de modo que
 *    en producción apuntaba a la máquina del usuario.
 *
 * Usando ApiService las tres desaparecen: la base sale de environment, el
 * interceptor pone el token correcto y el cuerpo va donde corresponde.
 */
@Injectable({ providedIn: 'root' })
export class ConfiguracionService {
  private api = inject(ApiService);

  obtener(): Observable<PlataformaGuardada> {
    return this.api.get<PlataformaGuardada>('/parametrizacion/plataforma');
  }

  updatePlatform(
    datos: Partial<ParametrizacionPlataforma>
  ): Observable<PlataformaGuardada> {
    return this.api.post<PlataformaGuardada>(
      '/parametrizacion/plataforma',
      datos
    );
  }
}
