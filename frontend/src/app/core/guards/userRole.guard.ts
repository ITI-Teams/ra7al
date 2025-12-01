import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/authService/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserRoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data['role'];
    const user = this.auth.getUser();

    // 1️⃣ User not logged in → redirect to login
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }

    // 2️⃣ Wrong role → unauthorized page
    if (expectedRole && user.role !== expectedRole) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    // 3️⃣ Allowed
    return true;
  }
}
