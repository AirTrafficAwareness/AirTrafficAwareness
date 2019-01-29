import { TestBed } from '@angular/core/testing';

import { AirTrafficAwarenessService } from './air-traffic-awareness.service';

describe('AirTrafficAwarenessService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: AirTrafficAwarenessService = TestBed.get(AirTrafficAwarenessService);
    expect(service).toBeTruthy();
  });
});
