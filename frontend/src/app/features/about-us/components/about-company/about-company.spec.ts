import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AboutCompany } from './about-company';


describe('AboutCompany', () => {
  let component: AboutCompany;
  let fixture: ComponentFixture<AboutCompany>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutCompany]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutCompany);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
