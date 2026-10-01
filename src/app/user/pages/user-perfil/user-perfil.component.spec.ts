import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserPerfilComponent } from './user-perfil.component';
import { proveedoresDePrueba } from '../../../../testing/proveedores';

describe('UserPerfilComponent', () => {
  let component: UserPerfilComponent;
  let fixture: ComponentFixture<UserPerfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserPerfilComponent],
      providers: proveedoresDePrueba(),
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserPerfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
