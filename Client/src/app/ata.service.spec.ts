import { TestBed } from '@angular/core/testing';

import { ATAService } from './ata.service';

describe('ATAService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ATAService = TestBed.get(ATAService);
    expect(service).toBeTruthy();
  });
});
