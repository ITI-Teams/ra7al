import { Component } from '@angular/core';
import { Navbar } from "../../shared/navbar/navbar";
import { RouterModule } from "@angular/router";
import { Footer } from "../../shared/footer/footer";

@Component({
  selector: 'app-general',
  standalone: true,
  imports: [Navbar, RouterModule, Footer],
  templateUrl: './general.html',
  styleUrl: './general.css',
})
export class General {

}
