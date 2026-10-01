import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserInformacionComponent } from './user-informacion.component';
import { proveedoresDePrueba } from '../../../../testing/proveedores';

describe('UserInformacionComponent', () => {
  let component: UserInformacionComponent;
  let fixture: ComponentFixture<UserInformacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserInformacionComponent],
      providers: proveedoresDePrueba(),
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserInformacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
