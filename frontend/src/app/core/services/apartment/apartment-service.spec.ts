import { TestBed } from '@angular/core/testing';

<<<<<<<< HEAD:frontend/src/app/core/services/apartment/apartment-service.spec.ts
import { ApartmentService } from './apartment-service';

describe('ApartmentService', () => {
  let service: ApartmentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApartmentService);
========
import { PropertyService } from './property.service';

describe('PropertyService', () => {
  let service: PropertyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertyService);
>>>>>>>> afc0028c91deaeadc40a084d813e0b16d75d4444:frontend/src/app/core/services/property/property.service.spec.ts
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
