import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css'],
})
export class Navbar {
  @Output() toggleSidebarEvent = new EventEmitter<void>();
  isNotificationsOpen = false;
  isProfileOpen = false;

  notifications = [
    {
      id: 1,
      title: 'New Booking',
      message: 'Apartment #5 has been booked',
      time: '5 minutes ago',
      unread: true,
    },
    {
      id: 2,
      title: 'New Comment',
      message: 'Comment on Maadi apartment',
      time: '1 hour ago',
      unread: true,
    },
    {
      id: 3,
      title: 'Payment Received',
      message: 'Payment of 5000 EGP received',
      time: '3 hours ago',
      unread: false,
    },
  ];

  get unreadCount(): number {
    return this.notifications.filter((n) => n.unread).length;
  }

  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }

  toggleNotifications() {
    this.isNotificationsOpen = !this.isNotificationsOpen;
    this.isProfileOpen = false;
  }

  toggleProfile() {
    this.isProfileOpen = !this.isProfileOpen;
    this.isNotificationsOpen = false;
  }

  logout() {
    console.log('Logging out...');
  }
}
