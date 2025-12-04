import { TestBed } from '@angular/core/testing';

import { PropertySearch } from './property-search';

describe('PropertySearch', () => {
  let service: PropertySearch;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertySearch);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
