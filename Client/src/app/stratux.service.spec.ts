import { TestBed } from '@angular/core/testing';

import { StratuxService } from './stratux.service';

describe('StratuxService', () => {
  let service: StratuxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StratuxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
