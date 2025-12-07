import { TestBed } from '@angular/core/testing';

import { Popularlocations } from './popularlocations';

describe('Popularlocations', () => {
  let service: Popularlocations;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Popularlocations);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
