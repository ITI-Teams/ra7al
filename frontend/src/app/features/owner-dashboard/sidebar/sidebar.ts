import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';

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

  menuItems: MenuItem[] = [
    {
      label: 'Dashboard',
      icon: 'fa-solid fa-gauge',
      route: '/owner-dashboard',
    },
    {
      label: 'Offer for Rent',
      icon: 'fa-solid fa-handshake',
      route: '/owner-dashboard/create-apartment',
      badge: 2,
    },
    {
      label: 'Apartments',
      icon: 'fa-solid fa-building',
      route: '/owner-dashboard/apartments',
      badge: 12,
    },
    {
      label: 'Bookings',
      icon: 'fa-solid fa-calendar-check',
      route: '/owner-dashboard/bookings',
      badge: 5,
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
      badge: 3,
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
}
