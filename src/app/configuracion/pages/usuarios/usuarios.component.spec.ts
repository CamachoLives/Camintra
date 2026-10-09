import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { UsuariosComponent } from './usuarios.component';
import { SesionService } from '../../../core/services/sesion.service';
import { Usuario } from '../../../core/models/intranet.models';
import { environment } from '../../../../environments/environment';
import {
  proveedoresDePrueba,
  limpiarAlmacenamiento,
} from '../../../../testing/proveedores';

const base = environment.apiUrl;

const usuario = (extra: Partial<Usuario> = {}): Usuario =>
  ({
    id: 7,
    nombre: 'Ana Ruiz',
    email: 'ana@camintra.com',
    rol: 'editor',
    activo: true,
    ultimo_acceso: '2026-10-01T10:00:00.000Z',
    ...extra,
  }) as Usuario;

describe('UsuariosComponent', () => {
  let fixture: ComponentFixture<UsuariosComponent>;
  let componente: UsuariosComponent;
  let http: HttpTestingController;

  const sobre = (items: Usuario[], extra: Record<string, number> = {}) => ({
    success: true,
    message: 'ok',
    data: {
      items,
      total: items.length,
      page: 1,
      limit: 10,
      totalPaginas: 1,
      ...extra,
    },
  });

  const pedirListado = () => http.expectOne(r => r.url === `${base}/users`);

  const responderListado = (
    items: Usuario[],
    extra: Record<string, number> = {}
  ) => pedirListado().flush(sobre(items, extra));

  beforeEach(async () => {
    limpiarAlmacenamiento();

    await TestBed.configureTestingModule({
      imports: [UsuariosComponent],
      providers: proveedoresDePrueba(),
    }).compileComponents();

    fixture = TestBed.createComponent(UsuariosComponent);
    componente = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => limpiarAlmacenamiento());

  describe('carga inicial', () => {
    it('pide los usuarios al backend, no los inventa', () => {
      fixture.detectChanges();

      const peticion = pedirListado();
      expect(peticion.request.method).toBe('GET');
      expect(peticion.request.params.get('page')).toBe('1');
      expect(peticion.request.params.get('limit')).toBe('10');

      peticion.flush(sobre([usuario()]));
      expect(componente.items.length).toBe(1);
      expect(componente.items[0].email).toBe('ana@camintra.com');
    });

    it('arranca sin filas inventadas', () => {
      // Antes el componente nacía con Cristian Camacho y Ana Gómez dentro
      expect(componente.items).toEqual([]);
      expect(componente.total).toBe(0);
    });

    it('guarda el total y las páginas que informa el servidor', () => {
      fixture.detectChanges();

      responderListado([usuario()], { total: 47, totalPaginas: 5 });

      expect(componente.total).toBe(47);
      expect(componente.totalPaginas).toBe(5);
      expect(componente.paginas).toEqual([1, 2, 3, 4, 5]);
    });

    it('muestra el mensaje del backend si falla', () => {
      fixture.detectChanges();

      http
        .expectOne(r => r.url === `${base}/users`)
        .flush(
          { success: false, message: 'No tienes permisos' },
          { status: 403, statusText: 'Forbidden' }
        );

      expect(componente.error).toBe('No tienes permisos');
      expect(componente.cargando).toBe(false);
    });
  });

  describe('búsqueda', () => {
    it('la resuelve el servidor y vuelve a la primera página', () => {
      fixture.detectChanges();
      responderListado([usuario()], { totalPaginas: 3 });

      componente.pagina = 3;
      componente.busqueda = '  ana  ';
      componente.buscar();

      const peticion = pedirListado();
      expect(peticion.request.params.get('email')).toBe('ana');
      expect(peticion.request.params.get('page')).toBe('1');
      expect(componente.pagina).toBe(1);

      peticion.flush(sobre([usuario()]));
    });

    it('con la búsqueda vacía no manda el filtro', () => {
      fixture.detectChanges();
      responderListado([usuario()]);

      componente.busqueda = '   ';
      componente.buscar();

      const peticion = pedirListado();
      expect(peticion.request.params.has('email')).toBe(false);

      peticion.flush(sobre([usuario()]));
    });
  });

  describe('paginación', () => {
    it('pide la página que se elige', () => {
      fixture.detectChanges();
      responderListado([usuario()], { totalPaginas: 4 });

      componente.cambiarPagina(3);

      const peticion = pedirListado();
      expect(peticion.request.params.get('page')).toBe('3');

      peticion.flush(sobre([usuario()]));
    });

    it('no vuelve a pedir la página en la que ya está', () => {
      fixture.detectChanges();
      responderListado([usuario()]);

      componente.cambiarPagina(1);

      http.expectNone(r => r.url === `${base}/users`);
    });
  });

  describe('cambiar el rol', () => {
    it('manda un PUT y recarga el listado', () => {
      fixture.detectChanges();
      responderListado([usuario()]);

      componente.cambiarRol(usuario(), 'admin');

      const peticion = http.expectOne(`${base}/users/7`);
      expect(peticion.request.method).toBe('PUT');
      expect(peticion.request.body).toEqual({ rol: 'admin' });

      peticion.flush({ success: true, message: 'ok', data: usuario() });
      expect(componente.mensaje).toContain('admin');

      responderListado([usuario({ rol: 'admin' })]);
    });

    it('si el rol no cambia no manda nada', () => {
      fixture.detectChanges();
      responderListado([usuario()]);

      componente.cambiarRol(usuario({ rol: 'editor' }), 'editor');

      http.expectNone(`${base}/users/7`);
    });

    it('muestra el error del backend sin recargar', () => {
      fixture.detectChanges();
      responderListado([usuario()]);

      componente.cambiarRol(usuario(), 'admin');
      http
        .expectOne(`${base}/users/7`)
        .flush(
          { success: false, message: 'Rol inválido' },
          { status: 400, statusText: 'Bad Request' }
        );

      expect(componente.error).toBe('Rol inválido');
      http.expectNone(r => r.url === `${base}/users`);
    });
  });

  describe('desactivar y reactivar', () => {
    it('desactivar es un DELETE, que en el backend es baja lógica', () => {
      fixture.detectChanges();
      responderListado([usuario()]);

      componente.desactivar(usuario());

      const peticion = http.expectOne(`${base}/users/7`);
      expect(peticion.request.method).toBe('DELETE');

      peticion.flush({ success: true, message: 'ok' });
      expect(componente.mensaje).toContain('desactivado');

      responderListado([usuario({ activo: false })]);
    });

    it('reactivar manda activo: true', () => {
      fixture.detectChanges();
      responderListado([usuario({ activo: false })]);

      componente.reactivar(usuario({ activo: false }));

      const peticion = http.expectOne(`${base}/users/7`);
      expect(peticion.request.method).toBe('PUT');
      expect(peticion.request.body).toEqual({ activo: true });

      peticion.flush({ success: true, message: 'ok', data: usuario() });
      responderListado([usuario()]);
    });
  });

  describe('protección del propio administrador', () => {
    it('reconoce al usuario de la sesión', () => {
      TestBed.inject(SesionService).guardar(usuario({ id: 7, rol: 'admin' }));

      expect(componente.miId).toBe(7);
    });

    it('sin sesión no hay id propio y nada queda bloqueado por error', () => {
      expect(componente.miId).toBeNull();
    });
  });
});
