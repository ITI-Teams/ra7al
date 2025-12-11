import { TestBed } from '@angular/core/testing';

import { OwnerDashboardcharts } from './owner-dashboardcharts';

describe('OwnerDashboardcharts', () => {
  let service: OwnerDashboardcharts;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OwnerDashboardcharts);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
