import { TestBed } from '@angular/core/testing';

import { ATAService } from './ata.service';

describe('ATAService', () => {
  let service: ATAService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ATAService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
