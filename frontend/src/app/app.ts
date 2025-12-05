import { Component, signal } from '@angular/core';
import { Loader } from './shared/loader/loader';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RouterModule } from "@angular/router";
import {AuthService} from './core/services/authService/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Loader, Toast, RouterModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css'], // صححت هنا
})
export class App {
  protected readonly title = signal('frontend');


  constructor(private auth: AuthService ,private messageService: MessageService) {
    if (this.auth.isLoggedIn()) {
      this.auth.refreshUser().subscribe({
        next: (res) => this.auth.storeUser(res.user),
        error: () => this.auth.clearUser()
      });
    }
  }
}
