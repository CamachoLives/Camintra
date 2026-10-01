import { TestBed } from '@angular/core/testing';

import { AuthService } from './auth.service';
import { proveedoresDePrueba } from '../../testing/proveedores';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: proveedoresDePrueba(),
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
