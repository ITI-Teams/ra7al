import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileComponenet } from './profile-componenet';

describe('ProfileComponenet', () => {
  let component: ProfileComponenet;
  let fixture: ComponentFixture<ProfileComponenet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfileComponenet]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileComponenet);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
