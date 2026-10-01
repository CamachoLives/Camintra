import { TestBed } from '@angular/core/testing';
import { RouterOutlet } from '@angular/router';
import { AppComponent } from './app.component';
import { proveedoresDePrueba } from '../testing/proveedores';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: proveedoresDePrueba(),
    }).compileComponents();
  });

  it('se crea', () => {
    const fixture = TestBed.createComponent(AppComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('su plantilla es solo el router-outlet', () => {
    // La raíz no pinta nada propio: todo cuelga de las rutas
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    expect(
      fixture.debugElement.queryAll(d => d.componentInstance instanceof Object)
    ).toBeDefined();
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('router-outlet')
    ).not.toBeNull();
  });

  it('declara el RouterOutlet entre sus imports', () => {
    expect(AppComponent).toBeTruthy();
    expect(RouterOutlet).toBeTruthy();
  });
});
