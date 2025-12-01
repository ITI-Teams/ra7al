import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/authService/auth.service';
import { MessageService } from 'primeng/api'; // تأكد من أنك أضفت MessageService

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {}

  canActivate(): boolean {
    const user = this.auth.getUser();

    // إذا كان المستخدم مسجل الدخول → منع الوصول وعرض رسالة ثم إعادة التوجيه
    if (user) {
      this.router.navigate(['/home']);


      // تأخير صغير قبل إعادة التوجيه حتى يظهر الـ Toast
      setTimeout(() => {
        this.messageService.add({
          severity: 'error',
          summary: 'Access Denied',
          detail: 'You are already logged in!',
        });
      }, 1500); // 1.5 ثانية

      return false;
    }

    // إذا لم يكن مسجل الدخول → السماح بالوصول
    return true;
  }
}
