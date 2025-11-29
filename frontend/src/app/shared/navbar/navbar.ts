import { Component, OnDestroy, OnInit, signal, computed, HostListener } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/themeService/theme-service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  imports: [RouterLink , NgClass, NgIf],
  standalone: true,
})
export class Navbar {
  menuOpen = false;
  profileOpen = false;

isFixed = false;

  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.isFixed = scrollTop > 0; // fixed if scroll > 0
  }

  isLoggedIn = false;
  user: any = null;

  constructor(
    public theme: ThemeService,
    private router: Router,
    private auth: AuthService,
  ) {
    this.syncUser();
    window.addEventListener('storage', () => this.syncUser());
  }

  // toggle profile dropdown
  toggleProfile() {
    this.profileOpen = !this.profileOpen;
  }

  // logout: call backend then clear local storage and redirect
  logout() {
    // attempt backend logout but proceed even on error
    this.auth.logout().subscribe({
      next: () => {},
      error: () => {},
    }).add(() => {
      this.auth.clearToken();
      this.auth.clearUser();
      this.syncUser();
      this.router.navigate(['/']);
    });
  }

  // share profile URL to clipboard and show feedback
  shareProfile() {
    const path = this.user?.role === 'owner' ? '/profile-owner' : '/profile-student';
    const url = `${window.location.origin}${path}`;
    try {
      navigator.clipboard.writeText(url).then(() => {
        this.showShareFeedback = true;
        setTimeout(() => (this.showShareFeedback = false), 1800);
      });
    } catch (e) {
      // fallback: no clipboard
      console.info('Share URL:', url);
      this.showShareFeedback = true;
      setTimeout(() => (this.showShareFeedback = false), 1800);
    }
  }

  showShareFeedback = false;

  avatarUrl(): string {
    if (!this.user) return '/assets/default-avatar.png';

    // If user has uploaded avatar path, return full storage URL
    if (this.user.avatar) {
      return `${this.auth.getBackendBase()}/storage/${this.user.avatar}`;
    }

    // Otherwise, generate an SVG avatar with initials (2 chars)
    const name: string = (this.user.name || '').trim();
    let initials = '';
    if (name.length === 0) {
      initials = '??';
    } else {
      const parts = name.split(/\s+/).filter(Boolean);
      if (parts.length === 1) {
        initials = parts[0].slice(0, 2).toUpperCase();
      } else {
        initials = (parts[0][0] + (parts[1][0] || '')).toUpperCase();
      }
    }

    const bg = '#667eea';
    const fg = '#ffffff';
    const svg = ` <svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'>
      <rect width='100%' height='100%' fill='${bg}' rx='16' />
      <text x='50%' y='50%' dy='.1em' text-anchor='middle' fill='${fg}' font-family='Helvetica, Arial, sans-serif' font-size='52'>${initials}</text>
    </svg>`;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  private syncUser() {
    this.user = this.auth.getUser();
    this.isLoggedIn = !!this.auth.getToken();
  }
get themeSignal() { return this.theme.theme; }
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }


  }

