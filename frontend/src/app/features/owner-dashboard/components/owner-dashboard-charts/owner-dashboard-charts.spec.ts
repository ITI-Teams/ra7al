import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerDashboardCharts } from './owner-dashboard-charts';

describe('OwnerDashboardCharts', () => {
  let component: OwnerDashboardCharts;
  let fixture: ComponentFixture<OwnerDashboardCharts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerDashboardCharts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerDashboardCharts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
