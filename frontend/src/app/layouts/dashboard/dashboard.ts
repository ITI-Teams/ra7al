import { Component } from '@angular/core';
import { RouterModule } from "@angular/router";
import { Sidebar } from "../../features/owner-dashboard/sidebar/sidebar";
import { OwnerNavbar } from "../../features/owner-dashboard/owner-navbar/owner-navbar";



@Component({
  selector: 'app-dashboard',
  imports: [RouterModule, Sidebar, OwnerNavbar],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {

}
