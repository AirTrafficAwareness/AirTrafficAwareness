import { TestBed } from '@angular/core/testing';

import { GDL90Service } from './gdl90-service.service';

describe('GDL90Service', () => {
  let service: GDL90Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GDL90Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
