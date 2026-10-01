import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { HttpTestingController } from '@angular/common/http/testing';
import { Observable } from 'rxjs';
import { authGuard } from './auth.guard';
import { adminGuard } from './admin.guard';
import { publicadorGuard } from './publicador.guard';
import { SesionService } from '../core/services/sesion.service';
import { Usuario } from '../core/models/intranet.models';
import { TOKEN_KEY } from '../core/interceptors/auth.interceptor';
import { environment } from '../../environments/environment';
import {
  proveedoresDePrueba,
  limpiarAlmacenamiento,
} from '../../testing/proveedores';

const ruta = {} as ActivatedRouteSnapshot;
const estado = {} as RouterStateSnapshot;

const ana = (rol: string): Usuario =>
  ({
    id: 7,
    nombre: 'Ana Ruiz',
    email: 'ana@camintra.com',
    rol,
    activo: true,
  }) as Usuario;

const esRedirectA = (resultado: unknown, destino: string): boolean =>
  resultado instanceof UrlTree && resultado.toString() === destino;

describe('guards de rutas', () => {
  beforeEach(limpiarAlmacenamiento);
  afterEach(limpiarAlmacenamiento);

  const configurar = (extra: unknown[] = []) =>
    TestBed.configureTestingModule({
      providers: proveedoresDePrueba(extra as never[]),
    });

  describe('authGuard', () => {
    it('sin token manda al ingreso', () => {
      configurar();

      const resultado = TestBed.runInInjectionContext(() =>
        authGuard(ruta, estado)
      );

      expect(esRedirectA(resultado, '/Ingreso')).toBe(true);
    });

    it('con usuario ya cargado deja pasar sin volver a preguntar', () => {
      configurar();
      localStorage.setItem(TOKEN_KEY, 'token-bueno');
      TestBed.inject(SesionService).guardar(ana('colaborador'));
      const http = TestBed.inject(HttpTestingController);

      const resultado = TestBed.runInInjectionContext(() =>
        authGuard(ruta, estado)
      );

      expect(resultado).toBe(true);
      http.expectNone(`${environment.apiUrl}/users/me`);
    });

    it('con token pero sin usuario espera la respuesta del servidor', done => {
      configurar();
      localStorage.setItem(TOKEN_KEY, 'token-bueno');
      const http = TestBed.inject(HttpTestingController);

      const resultado = TestBed.runInInjectionContext(() =>
        authGuard(ruta, estado)
      ) as Observable<boolean | UrlTree>;

      // Antes el guard devolvía true de inmediato y un token vencido
      // entraba hasta que fallaba la primera petición
      resultado.subscribe((valor: boolean | UrlTree) => {
        expect(valor).toBe(true);
        done();
      });

      http
        .expectOne(`${environment.apiUrl}/users/me`)
        .flush({ success: true, message: 'ok', data: ana('editor') });
    });

    it('en SSR deja renderizar: ahí no hay localStorage', () => {
      configurar([{ provide: PLATFORM_ID, useValue: 'server' }]);

      const resultado = TestBed.runInInjectionContext(() =>
        authGuard(ruta, estado)
      );

      expect(resultado).toBe(true);
    });
  });

  describe('adminGuard', () => {
    const conRol = (rol: string) => {
      configurar();
      TestBed.inject(SesionService).guardar(ana(rol));
    };

    it('deja entrar al administrador', () => {
      conRol('admin');

      expect(
        TestBed.runInInjectionContext(() => adminGuard(ruta, estado))
      ).toBe(true);
    });


    it('al editor lo devuelve al inicio', () => {
      conRol('editor');

      const resultado = TestBed.runInInjectionContext(() =>
        adminGuard(ruta, estado)
      );

      expect(esRedirectA(resultado, '/Inicio')).toBe(true);
    });

    it('al colaborador lo devuelve al inicio', () => {
      conRol('colaborador');

      const resultado = TestBed.runInInjectionContext(() =>
        adminGuard(ruta, estado)
      );

      expect(esRedirectA(resultado, '/Inicio')).toBe(true);
    });

    it('sin sesión no deja pasar', () => {
      configurar();

      const resultado = TestBed.runInInjectionContext(() =>
        adminGuard(ruta, estado)
      );

      expect(esRedirectA(resultado, '/Inicio')).toBe(true);
    });
  });

  describe('publicadorGuard', () => {
    const conRol = (rol: string) => {
      configurar();
      TestBed.inject(SesionService).guardar(ana(rol));
    };

    it('deja pasar al administrador', () => {
      conRol('admin');

      expect(
        TestBed.runInInjectionContext(() => publicadorGuard(ruta, estado))
      ).toBe(true);
    });

    it('deja pasar al editor', () => {
      conRol('editor');

      expect(
        TestBed.runInInjectionContext(() => publicadorGuard(ruta, estado))
      ).toBe(true);
    });

    it('al colaborador no le muestra el formulario', () => {
      conRol('colaborador');

      const resultado = TestBed.runInInjectionContext(() =>
        publicadorGuard(ruta, estado)
      );

      expect(esRedirectA(resultado, '/Inicio')).toBe(true);
    });
  });

  describe('Router', () => {
    it('el redirect es un UrlTree, no una navegación imperativa', () => {
      configurar();

      const router = TestBed.inject(Router);
      expect(router.createUrlTree(['/Ingreso']).toString()).toBe('/Ingreso');
    });
  });
});
