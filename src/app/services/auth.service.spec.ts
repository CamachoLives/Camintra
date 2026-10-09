import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { SesionService } from '../core/services/sesion.service';
import { TOKEN_KEY } from '../core/interceptors/auth.interceptor';
import { environment } from '../../environments/environment';
import {
  proveedoresDePrueba,
  limpiarAlmacenamiento,
} from '../../testing/proveedores';

const base = environment.apiUrl;

describe('AuthService', () => {
  let auth: AuthService;
  let sesion: SesionService;
  let http: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    limpiarAlmacenamiento();
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: proveedoresDePrueba([{ provide: Router, useValue: router }]),
    });

    auth = TestBed.inject(AuthService);
    sesion = TestBed.inject(SesionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    limpiarAlmacenamiento();
  });

  describe('login', () => {
    const respuesta = {
      success: true,
      message: 'Inicio de sesión exitoso',
      data: { token: 'abc.def.ghi', id: 7, nombre: 'Ana Ruiz', rol: 'editor' },
    };

    it('manda email y contraseña al endpoint de la API', () => {
      auth.login('ana@camintra.com', 'Secreta123').subscribe();

      const peticion = http.expectOne(`${base}/auth/login`);
      expect(peticion.request.method).toBe('POST');
      expect(peticion.request.body).toEqual({
        email: 'ana@camintra.com',
        password: 'Secreta123',
      });

      peticion.flush(respuesta);
    });

    it('guarda el token en la clave que lee el interceptor', () => {
      auth.login('ana@camintra.com', 'Secreta123').subscribe();
      http.expectOne(`${base}/auth/login`).flush(respuesta);

      expect(localStorage.getItem(TOKEN_KEY)).toBe('abc.def.ghi');
    });

    it('deja la sesión lista para el sidebar y los guards', () => {
      auth.login('ana@camintra.com', 'Secreta123').subscribe();
      http.expectOne(`${base}/auth/login`).flush(respuesta);

      expect(sesion.usuario()).toEqual(
        jasmine.objectContaining({
        id: 7,
        nombre: 'Ana Ruiz',
        email: 'ana@camintra.com',
          rol: 'editor',
        })
      );
      expect(sesion.autenticado).toBe(true);
      expect(sesion.puedePublicar()).toBe(true);
    });

    it('con credenciales malas no guarda nada', () => {
      let error: Error | undefined;
      auth
        .login('ana@camintra.com', 'mala')
        .subscribe({ error: e => (error = e) });

      http
        .expectOne(`${base}/auth/login`)
        .flush(
          { success: false, message: 'Credenciales inválidas' },
          { status: 401, statusText: 'Unauthorized' }
        );

      expect(error?.message).toBe('Credenciales inválidas');
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(sesion.usuario()).toBeNull();
    });
  });

  describe('register', () => {
    it('normaliza el email antes de mandarlo', () => {
      auth
        .register('Ana Ruiz', '  Ana@Camintra.COM ', 'Secreta123')
        .subscribe();

      const peticion = http.expectOne(`${base}/auth/register`);
      expect(peticion.request.body).toEqual({
        nombre: 'Ana Ruiz',
        email: 'ana@camintra.com',
        password: 'Secreta123',
      });

      peticion.flush({ success: true, message: 'ok', data: { user: {} } });
    });

    it('registrarse no autentica: no guarda token ni sesión', () => {
      auth.register('Ana', 'ana@camintra.com', 'Secreta123').subscribe();

      http.expectOne(`${base}/auth/register`).flush({
        success: true,
        message: 'Usuario creado exitosamente',
        data: { user: { id: 11, nombre: 'Ana', email: 'ana@camintra.com' } },
      });

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(sesion.usuario()).toBeNull();
    });

    it('propaga el mensaje del backend si el email ya existe', () => {
      let error: Error | undefined;
      auth
        .register('Ana', 'ana@camintra.com', 'Secreta123')
        .subscribe({ error: e => (error = e) });

      http
        .expectOne(`${base}/auth/register`)
        .flush(
          { success: false, message: 'El email ya está en uso' },
          { status: 409, statusText: 'Conflict' }
        );

      expect(error?.message).toBe('El email ya está en uso');
    });
  });

  describe('logout', () => {
    it('limpia la sesión y manda al ingreso', () => {
      localStorage.setItem(TOKEN_KEY, 'abc');
      sesion.guardar({
        id: 7,
        nombre: 'Ana',
        email: 'ana@camintra.com',
        rol: 'editor',
        activo: true,
      });

      auth.logout();

      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(sesion.usuario()).toBeNull();
      expect(router.navigate).toHaveBeenCalledWith(['/Ingreso']);
    });
  });

  describe('consultas de estado', () => {
    it('getToken y isAuthenticated leen la sesión, no su propia copia', () => {
      expect(auth.getToken()).toBeNull();
      expect(auth.isAuthenticated()).toBe(false);

      localStorage.setItem(TOKEN_KEY, 'abc');

      expect(auth.getToken()).toBe('abc');
      expect(auth.isAuthenticated()).toBe(true);
    });

    it('verifyToken pregunta al backend por el usuario del token', () => {
      auth.verifyToken().subscribe();

      const peticion = http.expectOne(`${base}/auth/verify`);
      expect(peticion.request.method).toBe('GET');

      peticion.flush({ success: true, message: 'ok', data: { user: {} } });
    });
  });
});
