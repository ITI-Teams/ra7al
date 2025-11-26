import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularLocations } from './popular-locations';

describe('PopularLocations', () => {
  let component: PopularLocations;
  let fixture: ComponentFixture<PopularLocations>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PopularLocations]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopularLocations);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
