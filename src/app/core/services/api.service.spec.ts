import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { environment } from '../../../environments/environment';
import { proveedoresDePrueba } from '../../../testing/proveedores';

describe('ApiService', () => {
  let api: ApiService;
  let http: HttpTestingController;
  const base = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: proveedoresDePrueba() });
    api = TestBed.inject(ApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('desempaquetado de la respuesta', () => {
    it('devuelve data, no el sobre completo', () => {
      let recibido: unknown;
      api.get<{ id: number }>('/comunicados/1').subscribe(d => (recibido = d));

      http.expectOne(`${base}/comunicados/1`).flush({
        success: true,
        message: 'Comunicado obtenido exitosamente',
        data: { id: 1 },
      });

      expect(recibido).toEqual({ id: 1 });
    });

    it('deja pasar una lista vacía tal cual', () => {
      let recibido: unknown = 'sin-asignar';
      api.get<unknown[]>('/comunicados').subscribe(d => (recibido = d));

      http
        .expectOne(`${base}/comunicados`)
        .flush({ success: true, message: 'ok', data: [] });

      expect(recibido).toEqual([]);
    });
  });

  describe('construcción de parámetros', () => {
    it('descarta los filtros vacíos para no mandar ?q=&categoria=', () => {
      api
        .get('/comunicados', {
          q: '',
          categoriaId: null,
          prioridad: undefined,
          page: 2,
        })
        .subscribe();

      const peticion = http.expectOne(r => r.url === `${base}/comunicados`);
      expect(peticion.request.params.keys()).toEqual(['page']);
      expect(peticion.request.params.get('page')).toBe('2');
    });

    it('conserva el cero, que es un valor y no un filtro vacío', () => {
      api.get('/eventos', { departamentoId: 0 }).subscribe();

      const peticion = http.expectOne(r => r.url === `${base}/eventos`);
      expect(peticion.request.params.get('departamentoId')).toBe('0');
    });

    it('sin parámetros no agrega nada a la URL', () => {
      api.get('/eventos').subscribe();

      const peticion = http.expectOne(`${base}/eventos`);
      expect(peticion.request.params.keys().length).toBe(0);
    });
  });

  describe('verbos', () => {
    it('post manda el cuerpo y desempaqueta la respuesta', () => {
      let recibido: unknown;
      api.post('/comunicados', { titulo: 'Aviso' }).subscribe(d => (recibido = d));

      const peticion = http.expectOne(`${base}/comunicados`);
      expect(peticion.request.method).toBe('POST');
      expect(peticion.request.body).toEqual({ titulo: 'Aviso' });

      peticion.flush({ success: true, message: 'ok', data: { id: 5 } });
      expect(recibido).toEqual({ id: 5 });
    });

    it('post sin cuerpo manda un objeto vacío, no null', () => {
      api.post('/comunicados/3/leido').subscribe();

      const peticion = http.expectOne(`${base}/comunicados/3/leido`);
      expect(peticion.request.body).toEqual({});
    });

    it('put usa el método PUT', () => {
      api.put('/comunicados/3', { titulo: 'Otro' }).subscribe();

      expect(http.expectOne(`${base}/comunicados/3`).request.method).toBe('PUT');
    });

    it('delete usa el método DELETE', () => {
      api.delete('/comunicados/3').subscribe();

      expect(http.expectOne(`${base}/comunicados/3`).request.method).toBe(
        'DELETE'
      );
    });
  });

  describe('traducción de errores', () => {
    it('usa el mensaje en español que ya manda el backend', () => {
      let error: Error | undefined;
      api.get('/comunicados/99').subscribe({ error: e => (error = e) });

      http.expectOne(`${base}/comunicados/99`).flush(
        { success: false, message: 'Comunicado no encontrado' },
        { status: 404, statusText: 'Not Found' }
      );

      expect(error?.message).toBe('Comunicado no encontrado');
    });

    it('explica la caída del servidor en vez de mostrar "Error 0"', () => {
      let error: Error | undefined;
      api.get('/comunicados').subscribe({ error: e => (error = e) });

      http
        .expectOne(`${base}/comunicados`)
        .error(new ProgressEvent('error'), { status: 0, statusText: '' });

      expect(error?.message).toBe('No se pudo conectar con el servidor');
    });

    it('si el backend no manda mensaje arma uno con el código', () => {
      let error: Error | undefined;
      api.get('/comunicados').subscribe({ error: e => (error = e) });

      http
        .expectOne(`${base}/comunicados`)
        .flush(null, { status: 500, statusText: 'Internal Server Error' });

      expect(error?.message).toContain('500');
    });

    it('el error llega como Error, no como HttpErrorResponse', () => {
      let error: unknown;
      api.post('/comunicados').subscribe({ error: e => (error = e) });

      http
        .expectOne(`${base}/comunicados`)
        .flush({ message: 'Datos inválidos' }, { status: 400, statusText: '' });

      expect(error instanceof Error).toBe(true);
    });
  });
});
