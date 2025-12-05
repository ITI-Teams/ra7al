import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NgClass, NgIf, CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/authService/auth.service';
import { ThemeService } from '../../../core/services/themeService/theme-service';
import Swal from 'sweetalert2';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-owner-navbar',
   imports: [CommonModule, RouterLink, NgIf, ToastModule, ButtonModule],
  providers: [MessageService], // ✅ Provide MessageService here
  templateUrl: './owner-navbar.html',
  styleUrl: './owner-navbar.css',
})
export class OwnerNavbar {
 profileOpen = false;
  isFixed = false;
  isLoggedIn = false;
  user: any = null;
  showShareFeedback = false;

  constructor(
    public theme: ThemeService,
    private router: Router,
    private auth: AuthService,
    private messageService: MessageService
  ) {
    // Subscribe to user changes
    this.auth.user$.subscribe((user) => {
      this.user = user;
      this.isLoggedIn = !!user;
      this.profileOpen = false;
    });

    // Listen to storage changes
    window.addEventListener('storage', () => {
      const user = this.auth.getUser();
      this.user = user;
      this.isLoggedIn = !!user;
      this.profileOpen = false;
    });
  }

  toggleProfile() {
    this.profileOpen = !this.profileOpen;
  }

  logout() {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will be logged out of your account.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Logout',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.auth.logout().subscribe({
          next: () => {},
          error: () => {},
        }).add(() => {
          this.auth.clearUser();
          this.auth.clearToken();
          this.syncUser();

          // ✅ Show success toast
          this.messageService.add({
            severity: 'success',
            summary: 'Logged Out',
            detail: 'You have successfully logged out',
            life: 3000,
          });

          this.router.navigate(['/login'], { replaceUrl: true });
        });
      }
    });
  }

  shareProfile() {
    const path = this.user?.role === 'owner' ? '/profile-owner' : '/profile-student';
    const url = `${window.location.origin}${path}`;
    try {
      navigator.clipboard.writeText(url).then(() => {
        this.showShareFeedback = true;
        setTimeout(() => (this.showShareFeedback = false), 1800);
      });
    } catch (e) {
      console.info('Share URL:', url);
      this.showShareFeedback = true;
      setTimeout(() => (this.showShareFeedback = false), 1800);
    }
  }

  avatarUrl(): string {
    if (!this.user) return '/assets/default-avatar.svg';
    if (this.user.avatar) {
      return `${this.auth.getBackendBase()}/storage/${this.user.avatar}`;
    }
    const name = (this.user.name || '').trim();
    let initials = '';
    if (name.length === 0) initials = '??';
    else {
      const parts = name.split(/\s+/).filter(Boolean);
      initials = parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + (parts[1][0] || '')).toUpperCase();
    }
    const bg = '#667eea';
    const fg = '#ffffff';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'>
      <rect width='100%' height='100%' fill='${bg}' rx='16' />
      <text x='50%' y='50%' dy='.1em' text-anchor='middle' fill='${fg}' font-family='Helvetica, Arial, sans-serif' font-size='52'>${initials}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  private syncUser() {
    this.user = this.auth.getUser();
    this.isLoggedIn = !!this.auth.getToken();
  }

  get themeSignal() {
    return this.theme.theme;
  }

}
