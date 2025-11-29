import { Component, OnDestroy, OnInit, signal, computed, HostListener } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NgClass, NgIf } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/themeService/theme-service';
import { NgClass } from '@angular/common';

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

  avatarUrl(): string {
    if (!this.user || !this.user.avatar) return '/assets/default-avatar.png';
    // avatar stored like "images/users/xxx.jpg" in storage
    return `${this.auth.getBackendBase()}/storage/${this.user.avatar}`;
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

