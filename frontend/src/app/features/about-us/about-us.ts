import { Component } from '@angular/core';
import { Speakers } from './components/speakers/speakers';
import { AboutCompany } from './components/about-company/about-company';
import { OurService } from './components/our-services/our-service';
@Component({
  selector: 'app-about-us',
  standalone: true,
  imports: [Speakers ,AboutCompany ,OurService],
  templateUrl: './about-us.html',
  styleUrl: './about-us.css',
})
export class AboutUs {}
