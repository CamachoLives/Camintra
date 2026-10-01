import { TestBed } from '@angular/core/testing';

import { CountryService } from './country.service';
import { proveedoresDePrueba } from '../../testing/proveedores';

describe('CountryService', () => {
  let service: CountryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: proveedoresDePrueba(),
    });
    service = TestBed.inject(CountryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
