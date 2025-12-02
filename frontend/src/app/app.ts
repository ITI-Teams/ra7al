import { Component, signal } from '@angular/core';
import { Layout } from './layout/layout';
import { Loader } from './shared/loader/loader';
import { Toast } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Layout, Loader, Toast],
  templateUrl: './app.html',
  styleUrls: ['./app.css'], // صححت هنا
})
export class App {
  protected readonly title = signal('frontend');

  constructor(private messageService: MessageService) {}
}
