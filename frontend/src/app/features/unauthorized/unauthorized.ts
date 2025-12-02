import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.html',
})
export class Unauthorized {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']); // redirect to home
  }
}
