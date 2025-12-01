import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/authService/auth.service';
import { MessageService } from 'primeng/api'; // تأكد من أنك أضفت MessageService

@Injectable({
  providedIn: 'root',
})
export class UserRoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router , private messageService: MessageService) {}

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
      setTimeout(() => {
        this.messageService.add({
          severity: 'error',
          summary: 'Access Denied',
          detail: 'You do not have the required role to access this page.',
        });
      }, 1500); // 1.5ثانية
      return false;
    }

    // 3️⃣ Allowed
    return true;
  }
}
