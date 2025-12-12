import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lets-match',
  standalone: true,
  imports: [],
  templateUrl: './lets-match.html',
  styleUrl: './lets-match.css',
})
export class LetsMatch {
  constructor(private router: Router) {}

  navigateToRecommendation() {
    this.router.navigate(['/recommendations']);
  }
}
