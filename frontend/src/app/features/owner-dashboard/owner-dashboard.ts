import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Footer } from './footer/footer';
import { Sidebar } from './sidebar/sidebar';
import { Navbar } from './navbar/navbar';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Navbar, Sidebar, Footer],
  templateUrl: './owner-dashboard.html',
  styleUrls: ['./owner-dashboard.css'],
})
export class OwnerDashboard {
  isSidebarOpen = true;

  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
