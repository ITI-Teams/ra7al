import { Component, OnDestroy, OnInit, signal, computed, HostListener } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ThemeService } from '../../core/services/themeService/theme-service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.html',
  imports: [RouterLink],
  standalone: true,
})
export class Navbar {
  menuOpen = false;
  profileOpen = false;

  constructor(public theme: ThemeService, private router: Router) {}
  get themeSignal() {
    return this.theme.theme;
  }
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  goLogin() {
    this.router.navigate(['/login']);
  }

  goRegister() {
    this.router.navigate(['/register']);
  }
}
