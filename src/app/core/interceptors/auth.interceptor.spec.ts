import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { authInterceptor, TOKEN_KEY } from './auth.interceptor';
import { limpiarAlmacenamiento } from '../../../testing/proveedores';

describe('authInterceptor', () => {
  let http: HttpClient;
  let simulado: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    limpiarAlmacenamiento();
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: router },
      ],
    });

    http = TestBed.inject(HttpClient);
    simulado = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    simulado.verify();
    limpiarAlmacenamiento();
  });

  describe('cabecera Authorization', () => {
    it('adjunta el token guardado por el login', () => {
      localStorage.setItem(TOKEN_KEY, 'abc.def.ghi');

      http.get('/api/comunicados').subscribe();

      const peticion = simulado.expectOne('/api/comunicados');
      expect(peticion.request.headers.get('Authorization')).toBe(
        'Bearer abc.def.ghi'
      );
      peticion.flush({});
    });

    it('sin token la petición sale sin cabecera, no con "Bearer null"', () => {
      http.get('/api/comunicados').subscribe();

      const peticion = simulado.expectOne('/api/comunicados');
      expect(peticion.request.headers.has('Authorization')).toBe(false);
      peticion.flush({});
    });
  });

  describe('sesión vencida', () => {
    beforeEach(() => localStorage.setItem(TOKEN_KEY, 'token-vencido'));

    it('con 401 borra el token y manda al ingreso', () => {
      http.get('/api/comunicados').subscribe({ error: () => {} });

      simulado
        .expectOne('/api/comunicados')
        .flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/Ingreso']);
    });

    it('con 403 también cierra la sesión', () => {
      http.get('/api/users/3').subscribe({ error: () => {} });

      simulado
        .expectOne('/api/users/3')
        .flush({}, { status: 403, statusText: 'Forbidden' });

      expect(router.navigate).toHaveBeenCalledWith(['/Ingreso']);
    });

    it('limpia también el rastro en sessionStorage', () => {
      sessionStorage.setItem('userData', '{}');

      http.get('/api/comunicados').subscribe({ error: () => {} });
      simulado
        .expectOne('/api/comunicados')
        .flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(sessionStorage.getItem('userData')).toBeNull();
    });

    it('propaga el error para que la vista pueda mostrarlo', () => {
      let status: number | undefined;
      http
        .get('/api/comunicados')
        .subscribe({ error: e => (status = e.status) });

      simulado
        .expectOne('/api/comunicados')
        .flush({}, { status: 401, statusText: 'Unauthorized' });

      expect(status).toBe(401);
    });
  });

  describe('casos que no deben cerrar la sesión', () => {
    it('un 401 del propio login no redirige: el usuario ya está ahí', () => {
      localStorage.setItem(TOKEN_KEY, 'viejo');

      http
        .post('/api/auth/login', { email: 'a@b.c', password: 'mala' })
        .subscribe({ error: () => {} });

      simulado
        .expectOne('/api/auth/login')
        .flush(
          { message: 'Credenciales inválidas' },
          { status: 401, statusText: 'Unauthorized' }
        );

      expect(router.navigate).not.toHaveBeenCalled();
      // Y no le borra un token que podría seguir sirviendo
      expect(localStorage.getItem(TOKEN_KEY)).toBe('viejo');
    });

    it('un 500 no saca al usuario de la intranet', () => {
      localStorage.setItem(TOKEN_KEY, 'bueno');

      http.get('/api/comunicados').subscribe({ error: () => {} });

      simulado
        .expectOne('/api/comunicados')
        .flush({}, { status: 500, statusText: 'Internal Server Error' });

      expect(router.navigate).not.toHaveBeenCalled();
      expect(localStorage.getItem(TOKEN_KEY)).toBe('bueno');
    });

    it('un 404 tampoco', () => {
      localStorage.setItem(TOKEN_KEY, 'bueno');

      http.get('/api/comunicados/99').subscribe({ error: () => {} });

      simulado
        .expectOne('/api/comunicados/99')
        .flush({}, { status: 404, statusText: 'Not Found' });

      expect(router.navigate).not.toHaveBeenCalled();
    });
  });
});
