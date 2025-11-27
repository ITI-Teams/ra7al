import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { AboutUs } from './components/about-us/about-us';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
   {
    path: 'about',
    component: AboutUs,
  }
];
