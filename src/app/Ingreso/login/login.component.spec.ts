import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import LoginComponent from './login.component';
import { environment } from '../../../environments/environment';
import {
  proveedoresDePrueba,
  limpiarAlmacenamiento,
} from '../../../testing/proveedores';

const base = environment.apiUrl;

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let componente: LoginComponent;
  let http: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  const respuestaLogin = {
    success: true,
    message: 'Inicio de sesión exitoso',
    data: { token: 'abc.def.ghi', id: 7, nombre: 'Ana Ruiz', rol: 'editor' },
  };

  beforeEach(async () => {
    limpiarAlmacenamiento();
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: proveedoresDePrueba([{ provide: Router, useValue: router }]),
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    componente = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => limpiarAlmacenamiento());

  describe('onLogin', () => {
    it('entra y lleva al inicio', () => {
      componente.email = 'ana@camintra.com';
      componente.password = 'Secreta123';

      componente.onLogin();
      http.expectOne(`${base}/auth/login`).flush(respuestaLogin);

      expect(router.navigate).toHaveBeenCalledWith(['/Inicio']);
      expect(componente.error).toBe('');
    });

    it('muestra el mensaje del backend sin navegar', () => {
      componente.email = 'ana@camintra.com';
      componente.password = 'mala';

      componente.onLogin();
      http
        .expectOne(`${base}/auth/login`)
        .flush(
          { success: false, message: 'Credenciales inválidas' },
          { status: 401, statusText: 'Unauthorized' }
        );

      expect(componente.error).toBe('Credenciales inválidas');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('si el servidor no responde explica que no hay conexión', () => {
      componente.email = 'ana@camintra.com';
      componente.password = 'Secreta123';

      componente.onLogin();
      http
        .expectOne(`${base}/auth/login`)
        .error(new ProgressEvent('error'), { status: 0, statusText: '' });

      expect(componente.error).toBe('No se pudo conectar con el servidor');
    });
  });

  describe('onRegister: validaciones en el navegador', () => {
    beforeEach(() => {
      componente.nombrer = 'Ana Ruiz';
      componente.emailr = 'ana@camintra.com';
      componente.passwordr = 'Secreta123';
    });

    it('rechaza un nombre de menos de 3 letras sin llamar al backend', () => {
      componente.nombrer = 'An';

      componente.onRegister();

      expect(componente.errorr).toContain('nombre');
      http.expectNone(`${base}/auth/register`);
    });

    it('rechaza un nombre de solo espacios', () => {
      componente.nombrer = '     ';

      componente.onRegister();

      expect(componente.errorr).toContain('nombre');
      http.expectNone(`${base}/auth/register`);
    });


    it('rechaza un correo sin arroba', () => {
      componente.emailr = 'ana-camintra.com';

      componente.onRegister();

      expect(componente.errorr).toContain('correo');
      http.expectNone(`${base}/auth/register`);
    });

    it('rechaza un correo sin dominio', () => {
      componente.emailr = 'ana@camintra';

      componente.onRegister();

      expect(componente.errorr).toContain('correo');
      http.expectNone(`${base}/auth/register`);
    });

    it('rechaza una contraseña de menos de 6 caracteres', () => {
      componente.passwordr = 'Ab1';

      componente.onRegister();

      expect(componente.errorr).toContain('contraseña');
      http.expectNone(`${base}/auth/register`);
    });
  });

  describe('onRegister: alta correcta', () => {
    beforeEach(() => {
      componente.nombrer = 'Ana Ruiz';
      componente.emailr = 'ana@camintra.com';
      componente.passwordr = 'Secreta123';
    });

    it('llama al backend y deja la pestaña de ingreso lista', () => {
      componente.rightPanelActive = true;

      componente.onRegister();
      http
        .expectOne(`${base}/auth/register`)
        .flush({ success: true, message: 'ok', data: { user: { id: 11 } } });

      // Registrarse no autentica: se vuelve a la pestaña de ingreso con el
      // correo ya escrito
      expect(componente.rightPanelActive).toBe(false);
      expect(componente.email).toBe('ana@camintra.com');
      expect(componente.errorr).toBe('');
      expect(router.navigate).not.toHaveBeenCalled();
    });

    it('con el email repetido deja al usuario en la pestaña de registro', () => {
      componente.rightPanelActive = true;

      componente.onRegister();
      http
        .expectOne(`${base}/auth/register`)
        .flush(
          { success: false, message: 'El email ya está en uso' },
          { status: 409, statusText: 'Conflict' }
        );

      expect(componente.errorr).toBe('El email ya está en uso');
      // No tiene sentido devolverlo a ingresar: tiene que corregir el correo
      expect(componente.rightPanelActive).toBe(true);
    });
  });

  describe('cambio de pestaña', () => {
    it('alterna entre ingreso y registro', () => {
      expect(componente.rightPanelActive).toBe(false);

      componente.toggleSignUp();
      expect(componente.rightPanelActive).toBe(true);

      componente.toggleSignIn();
      expect(componente.rightPanelActive).toBe(false);
    });
  });
});
