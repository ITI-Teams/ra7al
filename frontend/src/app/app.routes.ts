import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { AboutUs } from './features/about-us/about-us';
import { Contactus } from './features/contactus/contactus';
import { OwnerDashboard } from './features/owner-dashboard/owner-dashboard';
import { Apartments } from './features/owner-dashboard/components/apartments/apartments';
import {FilterPage} from './features/filter-page/filter-page';
import {Search} from './features/search/search';

export const routes: Routes = [
  { path: '', component: Home,},
  { path: 'aboutus', component: AboutUs,},
  { path: 'contactus', component: Contactus,},
  { path: 'filter', component: FilterPage,},
  { path: 'search', component: Search,},
  { path: 'owner-dashboard',
    component: OwnerDashboard,
    children: [
      { path: '', redirectTo: 'apartments', pathMatch: 'full' },
      { path: 'apartments', component: Apartments },
    ],
  },
];
