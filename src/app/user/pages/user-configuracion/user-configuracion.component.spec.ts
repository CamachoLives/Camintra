import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserConfiguracionComponent } from './user-configuracion.component';
import { proveedoresDePrueba } from '../../../../testing/proveedores';

describe('UserConfiguracionComponent', () => {
  let component: UserConfiguracionComponent;
  let fixture: ComponentFixture<UserConfiguracionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserConfiguracionComponent],
      providers: proveedoresDePrueba(),
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserConfiguracionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
