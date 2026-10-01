import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ConfiguracionService } from './parametrizacion.service';
import { environment } from '../../../environments/environment';
import { proveedoresDePrueba } from '../../../testing/proveedores';

describe('ConfiguracionService', () => {
  let servicio: ConfiguracionService;
  let http: HttpTestingController;
  const ruta = `${environment.apiUrl}/parametrizacion/plataforma`;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: proveedoresDePrueba() });
    servicio = TestBed.inject(ConfiguracionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('updatePlatform', () => {
    it('manda el formulario como cuerpo, no las cabeceras', () => {
      servicio.updatePlatform({ sitionombre: 'Intranet', tiemposesion: '30' }).subscribe();

      const peticion = http.expectOne(ruta);
      // El bug anterior enviaba { headers, data } y el backend leía
      // req.body.sitionombre, que era undefined
      expect(peticion.request.body).toEqual({
        sitionombre: 'Intranet',
        tiemposesion: '30',
      });
      expect(peticion.request.body.headers).toBeUndefined();
      peticion.flush({ success: true, message: 'ok', data: { id: 1 } });
    });

    it('usa la base de environment, no una URL escrita a mano', () => {
      servicio.updatePlatform({ idioma: 'es' }).subscribe();

      const peticion = http.expectOne(ruta);
      expect(peticion.request.url).not.toContain('localhost:7000');
      expect(peticion.request.url.startsWith(environment.apiUrl)).toBe(true);
      peticion.flush({ success: true, message: 'ok', data: { id: 1 } });
    });

    it('cuelga de /api/parametrizacion como el resto de la API', () => {
      servicio.updatePlatform({ idioma: 'es' }).subscribe();

      const peticion = http.expectOne(ruta);
      expect(peticion.request.url).toContain('/parametrizacion/plataforma');
      peticion.flush({ success: true, message: 'ok', data: { id: 1 } });
    });

    it('no pone la cabecera a mano: eso es del interceptor', () => {
      // Antes la leía de localStorage['token'], una clave que el login no
      // usa, y mandaba "Bearer null"
      localStorage.setItem('token', 'clave-equivocada');

      servicio.updatePlatform({ idioma: 'es' }).subscribe();

      const peticion = http.expectOne(ruta);
      expect(peticion.request.headers.get('Authorization')).not.toBe(
        'Bearer clave-equivocada'
      );
      peticion.flush({ success: true, message: 'ok', data: { id: 1 } });
      localStorage.removeItem('token');
    });

    it('devuelve la fila guardada, ya desempaquetada', () => {
      let recibido: unknown;
      servicio.updatePlatform({ idioma: 'es' }).subscribe(d => (recibido = d));

      http.expectOne(ruta).flush({
        success: true,
        message: 'Parametrización actualizada correctamente',
        data: { id: 1, idioma: 'es', nombre_sitio: 'Intranet Camintra' },
      });

      expect(recibido).toEqual({
        id: 1,
        idioma: 'es',
        nombre_sitio: 'Intranet Camintra',
      });
    });

    it('propaga el mensaje del backend cuando el dato es inválido', () => {
      let error: Error | undefined;
      servicio
        .updatePlatform({ tiemposesion: 'mucho' })
        .subscribe({ error: e => (error = e) });

      http.expectOne(ruta).flush(
        { success: false, message: 'El campo tiemposesion debe ser un número entero' },
        { status: 400, statusText: 'Bad Request' }
      );

      expect(error?.message).toContain('número entero');
    });
  });

  describe('obtener', () => {
    it('pide la parametrización actual con GET', () => {
      servicio.obtener().subscribe();

      const peticion = http.expectOne(ruta);
      expect(peticion.request.method).toBe('GET');
      peticion.flush({ success: true, message: 'ok', data: { id: 1 } });
    });

    it('devuelve la fila desempaquetada', () => {
      let recibido: any;
      servicio.obtener().subscribe(d => (recibido = d));

      http.expectOne(ruta).flush({
        success: true,
        message: 'ok',
        data: { id: 1, color_hex: '#1d4ed8' },
      });

      expect(recibido.color_hex).toBe('#1d4ed8');
    });
  });
});
