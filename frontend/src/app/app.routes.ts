import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { AboutUs } from './features/about-us/about-us';
import { Contactus } from './features/contactus/contactus';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'aboutus',
    component: AboutUs,
  },
  {
    path: 'contactus',
    component: Contactus,
  },
];
