import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserEdicionComponent } from './user-edicion.component';
import { proveedoresDePrueba } from '../../../../testing/proveedores';

describe('UserEdicionComponent', () => {
  let component: UserEdicionComponent;
  let fixture: ComponentFixture<UserEdicionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserEdicionComponent],
      providers: proveedoresDePrueba(),
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserEdicionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
