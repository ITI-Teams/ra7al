import { TestBed } from '@angular/core/testing';

import { RentalRequestService } from './rental-request-service';

describe('RentalRequestService', () => {
  let service: RentalRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RentalRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
