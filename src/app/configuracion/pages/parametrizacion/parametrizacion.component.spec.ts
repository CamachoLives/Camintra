import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametrizacionComponent } from './parametrizacion.component';
import { proveedoresDePrueba } from '../../../../testing/proveedores';

describe('ParametrizacionComponent', () => {
  let component: ParametrizacionComponent;
  let fixture: ComponentFixture<ParametrizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParametrizacionComponent],
      providers: proveedoresDePrueba(),
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParametrizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
