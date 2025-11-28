import { Component } from '@angular/core';
import { Hero } from "./components/hero/hero";
import { OurService } from "./components/our-service/our-service";
import { HowItWork } from "./components/how-it-work/how-it-work";
import { LetsMatch } from "./components/lets-match/lets-match";
import { PopularLocations } from "./components/popular-locations/popular-locations";
import { Reviews } from "./components/reviews/reviews";
import { AboutUs } from './components/about-us/about-us';


@Component({
  selector: 'app-home',
  imports: [Hero, AboutUs, OurService, HowItWork, LetsMatch, PopularLocations, Reviews],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
