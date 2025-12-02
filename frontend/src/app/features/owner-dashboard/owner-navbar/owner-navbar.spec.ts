import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OwnerNavbar } from './owner-navbar';

describe('OwnerNavbar', () => {
  let component: OwnerNavbar;
  let fixture: ComponentFixture<OwnerNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerNavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OwnerNavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
