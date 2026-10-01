import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfiguracionComponent } from './configuracion.component';
import { proveedoresDePrueba } from '../../../../testing/proveedores';

describe('ConfiguracionComponent', () => {
  let component: ConfiguracionComponent;
  let fixture: ComponentFixture<ConfiguracionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfiguracionComponent],
      providers: proveedoresDePrueba(),
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConfiguracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
