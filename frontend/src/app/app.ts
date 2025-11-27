import { Component, signal } from '@angular/core';
import { Layout } from "./layout/layout";
import { Loader } from "./shared/loader/loader";


@Component({
  selector: 'app-root',
  imports: [Layout, Loader],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
