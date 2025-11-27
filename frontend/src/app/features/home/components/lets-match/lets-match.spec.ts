import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LetsMatch } from './lets-match';

describe('LetsMatch', () => {
  let component: LetsMatch;
  let fixture: ComponentFixture<LetsMatch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LetsMatch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LetsMatch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
