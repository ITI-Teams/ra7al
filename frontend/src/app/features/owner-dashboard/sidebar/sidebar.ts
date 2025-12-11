import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/authService/auth.service';

interface MenuItem {
  label: string;
  icon: string; // FontAwesome class
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css'],
})
export class Sidebar {
  @Input() isOpen = true;
  @Output() isOpenChange = new EventEmitter<boolean>();
  user: any = null;

  constructor(private auth: AuthService) {
    // Subscribe to user changes
    this.auth.user$.subscribe((user) => {
      this.user = user;
    });

    // Listen to storage changes
    window.addEventListener('storage', () => {
      const user = this.auth.getUser();
      this.user = user;
    });
  }

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'fa-solid fa-gauge',
      route: '/owner-dashboard/owner-dashboardcharts',
    },
    {
      label: 'Offer for Rent',
      icon: 'fa-solid fa-handshake',
      route: '/owner-dashboard/create-property',
    },
    {
      label: 'Apartments',
      icon: 'fa-solid fa-building',
      route: '/owner-dashboard/apartments',
    },
    {
      label: 'Bookings',
      icon: 'fa-solid fa-calendar-check',
      route: '/owner-dashboard/rental-requests',
    },
    {
      label: 'Tenants',
      icon: 'fa-solid fa-users',
      route: '/owner-dashboard/tenants',
    },
    {
      label: 'Comments',
      icon: 'fa-solid fa-comments',
      route: '/owner-dashboard/comments',
    },
    {
      label: 'Payments',
      icon: 'fa-solid fa-credit-card',
      route: '/owner-dashboard/payments',
    },
    {
      label: 'Reports',
      icon: 'fa-solid fa-chart-line',
      route: '/owner-dashboard/reports',
    },
    {
      label: 'Settings',
      icon: 'fa-solid fa-gear',
      route: '/owner-dashboard/settings',
    },
  ];
  toggleSidebar() {
    this.isOpen = !this.isOpen;
    this.isOpenChange.emit(this.isOpen);
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
      initials =
        parts.length === 1
          ? parts[0].slice(0, 2).toUpperCase()
          : (parts[0][0] + (parts[1][0] || '')).toUpperCase();
    }
    const bg = '#667eea';
    const fg = '#ffffff';
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='128' height='128'>
      <rect width='100%' height='100%' fill='${bg}' rx='16' />
      <text x='50%' y='50%' dy='.1em' text-anchor='middle' fill='${fg}' font-family='Helvetica, Arial, sans-serif' font-size='52'>${initials}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
}
