import { TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { SesionService } from './sesion.service';
import { Usuario } from '../models/intranet.models';
import { TOKEN_KEY } from '../interceptors/auth.interceptor';
import { environment } from '../../../environments/environment';
import {
  proveedoresDePrueba,
  limpiarAlmacenamiento,
} from '../../../testing/proveedores';

const USUARIO_KEY = 'camintraUsuario';

const ana: Usuario = {
  id: 7,
  nombre: 'Ana Ruiz',
  email: 'ana@camintra.com',
  rol: 'editor',
  activo: true,
} as Usuario;

const crearSesion = (): SesionService => {
  TestBed.configureTestingModule({ providers: proveedoresDePrueba() });
  return TestBed.inject(SesionService);
};

describe('SesionService', () => {
  beforeEach(limpiarAlmacenamiento);
  afterEach(limpiarAlmacenamiento);

  describe('estado inicial', () => {
    it('sin nada guardado no hay usuario', () => {
      const sesion = crearSesion();

      expect(sesion.usuario()).toBeNull();
      expect(sesion.nombre()).toBe('');
      expect(sesion.rol()).toBeNull();
    });

    it('rehidrata el usuario guardado para que un refresco no lo pierda', () => {
      localStorage.setItem(USUARIO_KEY, JSON.stringify(ana));

      const sesion = crearSesion();

      expect(sesion.usuario()).toEqual(ana);
      expect(sesion.nombre()).toBe('Ana Ruiz');
    });

    it('con un JSON corrupto arranca sin usuario en vez de reventar', () => {
      localStorage.setItem(USUARIO_KEY, '{esto no es json');

      // El TestBed solo se configura una vez por prueba
      let sesion: SesionService | undefined;
      expect(() => (sesion = crearSesion())).not.toThrow();
      expect(sesion!.usuario()).toBeNull();
    });
  });

  describe('permisos', () => {
    const conRol = (rol: string) => {
      const sesion = crearSesion();
      sesion.guardar({ ...ana, rol } as Usuario);
      return sesion;
    };

    it('admin puede publicar y es admin', () => {
      const sesion = conRol('admin');

      expect(sesion.puedePublicar()).toBe(true);
      expect(sesion.esAdmin()).toBe(true);
    });

    it('editor puede publicar pero no es admin', () => {
      const sesion = conRol('editor');

      expect(sesion.puedePublicar()).toBe(true);
      expect(sesion.esAdmin()).toBe(false);
    });

    it('colaborador no publica', () => {
      const sesion = conRol('colaborador');

      expect(sesion.puedePublicar()).toBe(false);
      expect(sesion.esAdmin()).toBe(false);
    });

    it('sin sesión no publica', () => {
      expect(crearSesion().puedePublicar()).toBe(false);
    });
  });

  describe('token', () => {
    it('lee la misma clave que escribe el login', () => {
      localStorage.setItem(TOKEN_KEY, 'abc.def.ghi');
      const sesion = crearSesion();

      expect(sesion.token).toBe('abc.def.ghi');
      expect(sesion.autenticado).toBe(true);
    });

    it('sin token no está autenticado', () => {
      const sesion = crearSesion();

      expect(sesion.token).toBeNull();
      expect(sesion.autenticado).toBe(false);
    });
  });

  describe('guardar', () => {
    it('actualiza la señal y persiste para el próximo arranque', () => {
      const sesion = crearSesion();

      sesion.guardar(ana);

      expect(sesion.usuario()).toEqual(ana);
      expect(JSON.parse(localStorage.getItem(USUARIO_KEY)!)).toEqual(ana);
    });
  });

  describe('refrescar', () => {
    it('pide /users/me y guarda lo que responda', () => {
      const sesion = crearSesion();
      const http = TestBed.inject(HttpTestingController);

      sesion.refrescar().subscribe();

      http
        .expectOne(`${environment.apiUrl}/users/me`)
        .flush({ success: true, message: 'ok', data: ana });

      expect(sesion.usuario()).toEqual(ana);
      http.verify();
    });
  });

  describe('limpiar', () => {
    it('borra el usuario, el token y el rastro en sessionStorage', () => {
      const sesion = crearSesion();
      sesion.guardar(ana);
      localStorage.setItem(TOKEN_KEY, 'abc');
      sessionStorage.setItem('userData', '{}');

      sesion.limpiar();

      expect(sesion.usuario()).toBeNull();
      expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
      expect(localStorage.getItem(USUARIO_KEY)).toBeNull();
      expect(sessionStorage.getItem('userData')).toBeNull();
    });
  });
});
