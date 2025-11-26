import { Component } from '@angular/core';
import { ThemeService } from '../../core/services/themeService/theme-service';
import { Hero } from "../../components/hero/hero";

@Component({
  selector: 'app-home',
  imports: [Hero],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
}
