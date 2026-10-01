import { TestBed } from '@angular/core/testing';
import {
  HttpTestingController,
  TestRequest,
} from '@angular/common/http/testing';
import { ComunicadosService } from '../../comunicados/comunicados.service';
import { WikiService } from '../../wiki/wiki.service';
import { DirectorioService } from '../../directorio/directorio.service';
import { CalendarioService } from '../../calendario/calendario.service';
import { NotificacionesService } from './notificaciones.service';
import { environment } from '../../../environments/environment';
import { proveedoresDePrueba } from '../../../testing/proveedores';

const base = environment.apiUrl;

/** Responde una peticion con el sobre que arma el backend */
const responder = (peticion: TestRequest, data: unknown) =>
  peticion.flush({ success: true, message: 'ok', data });

describe('servicios de las secciones', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: proveedoresDePrueba() });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('ComunicadosService', () => {
    let servicio: ComunicadosService;

    beforeEach(() => (servicio = TestBed.inject(ComunicadosService)));

    it('traduce los filtros booleanos a lo que espera la API', () => {
      servicio
        .listar({ noLeidos: true, borradores: false, q: 'nomina' })
        .subscribe();

      const peticion = http.expectOne(r => r.url === `${base}/comunicados`);
      expect(peticion.request.params.get('noLeidos')).toBe('true');
      // false se manda vacio y ApiService lo descarta
      expect(peticion.request.params.has('borradores')).toBe(false);
      expect(peticion.request.params.get('q')).toBe('nomina');

      responder(peticion, { items: [], total: 0, noLeidos: 0 });
    });

    it('el listado alimenta el badge del sidebar', () => {
      servicio.listar().subscribe();

      responder(http.expectOne(r => r.url === `${base}/comunicados`), {
        items: [],
        total: 0,
        noLeidos: 4,
      });

      expect(servicio.noLeidos()).toBe(4);
    });

    it('marcar como leido actualiza el contador que devuelve el backend', () => {
      servicio.marcarLeido(3).subscribe();

      responder(http.expectOne(`${base}/comunicados/3/leido`), { noLeidos: 2 });

      expect(servicio.noLeidos()).toBe(2);
    });

    it('las categorias tienen su propia ruta, no van por el detalle', () => {
      servicio.categorias().subscribe();

      const peticion = http.expectOne(`${base}/comunicados/categorias`);
      expect(peticion.request.method).toBe('GET');
      responder(peticion, []);
    });

    it('eliminar usa DELETE sobre el id', () => {
      servicio.eliminar(9).subscribe();

      const peticion = http.expectOne(`${base}/comunicados/9`);
      expect(peticion.request.method).toBe('DELETE');
      responder(peticion, null);
    });
  });

  describe('WikiService', () => {
    let servicio: WikiService;

    beforeEach(() => (servicio = TestBed.inject(WikiService)));

    it('el detalle va por slug, que es lo que se ve en la URL', () => {
      servicio.obtenerPorSlug('politica-de-vacaciones-2026').subscribe();

      const peticion = http.expectOne(
        `${base}/documentos/politica-de-vacaciones-2026`
      );
      expect(peticion.request.method).toBe('GET');
      responder(peticion, { id: 1 });
    });

    it('pide los borradores solo cuando se le piden', () => {
      servicio.listar({ borradores: true, categoria: 'RRHH' }).subscribe();

      const peticion = http.expectOne(r => r.url === `${base}/documentos`);
      expect(peticion.request.params.get('borradores')).toBe('true');
      expect(peticion.request.params.get('categoria')).toBe('RRHH');
      responder(peticion, { items: [], total: 0 });
    });

    it('actualizar manda PUT con el id', () => {
      servicio.actualizar(4, { titulo: 'Otro' }).subscribe();

      const peticion = http.expectOne(`${base}/documentos/4`);
      expect(peticion.request.method).toBe('PUT');
      expect(peticion.request.body).toEqual({ titulo: 'Otro' });
      responder(peticion, { id: 4 });
    });
  });

  describe('DirectorioService', () => {
    let servicio: DirectorioService;

    beforeEach(() => (servicio = TestBed.inject(DirectorioService)));

    it('busca por texto y departamento', () => {
      servicio.listar({ q: 'ana', departamentoId: 3 }).subscribe();

      const peticion = http.expectOne(r => r.url === `${base}/directorio`);
      expect(peticion.request.params.get('q')).toBe('ana');
      expect(peticion.request.params.get('departamentoId')).toBe('3');
      responder(peticion, { items: [], total: 0 });
    });

    it('guardar la ficha es un PUT sobre el usuario', () => {
      servicio.guardarFicha(7, { cargo: 'Analista' } as never).subscribe();

      const peticion = http.expectOne(`${base}/directorio/7`);
      expect(peticion.request.method).toBe('PUT');
      responder(peticion, { usuario_id: 7 });
    });
  });

  describe('CalendarioService', () => {
    let servicio: CalendarioService;

    beforeEach(() => (servicio = TestBed.inject(CalendarioService)));

    it('pide el rango de fechas que ve el calendario', () => {
      servicio.listar({ desde: '2026-09-01', hasta: '2026-09-30' }).subscribe();

      const peticion = http.expectOne(r => r.url === `${base}/eventos`);
      expect(peticion.request.params.get('desde')).toBe('2026-09-01');
      expect(peticion.request.params.get('hasta')).toBe('2026-09-30');
      responder(peticion, []);
    });

    it('los proximos eventos traen un limite por defecto', () => {
      servicio.proximos().subscribe();

      const peticion = http.expectOne(r => r.url === `${base}/eventos/proximos`);
      expect(peticion.request.params.get('limite')).toBe('5');
      responder(peticion, []);
    });

    it('comparte los departamentos con el directorio, sin duplicar endpoint', () => {
      servicio.departamentos().subscribe();

      responder(http.expectOne(`${base}/directorio/departamentos`), []);
    });
  });

  describe('NotificacionesService', () => {
    let servicio: NotificacionesService;

    beforeEach(() => (servicio = TestBed.inject(NotificacionesService)));

    const cargarCon = (items: unknown[], noLeidas: number) => {
      servicio.cargar().subscribe();
      responder(http.expectOne(r => r.url === `${base}/notificaciones`), {
        items,
        noLeidas,
      });
    };

    it('cargar llena la lista y el contador de la campanita', () => {
      cargarCon([{ id: 1, leida: false }], 1);

      expect(servicio.items().length).toBe(1);
      expect(servicio.noLeidas()).toBe(1);
    });

    it('marcar una como leida la actualiza sin recargar la lista', () => {
      cargarCon(
        [
          { id: 1, leida: false },
          { id: 2, leida: false },
        ],
        2
      );

      servicio.marcarLeida(1).subscribe();
      responder(http.expectOne(`${base}/notificaciones/1/leida`), {
        noLeidas: 1,
      });

      expect(servicio.items().find(n => n.id === 1)?.leida).toBe(true);
      expect(servicio.items().find(n => n.id === 2)?.leida).toBe(false);
      expect(servicio.noLeidas()).toBe(1);
    });

    it('marcar todas deja el contador en cero', () => {
      cargarCon([{ id: 1, leida: false }], 1);

      servicio.marcarTodas().subscribe();
      responder(http.expectOne(`${base}/notificaciones/leer-todas`), {
        marcadas: 1,
        noLeidas: 0,
      });

      expect(servicio.noLeidas()).toBe(0);
      expect(servicio.items().every(n => n.leida)).toBe(true);
    });
  });
});
