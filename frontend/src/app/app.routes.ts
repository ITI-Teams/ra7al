import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { Contactus } from './components/contactus/contactus';
export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'contactus',
    component: Contactus,
  },
];
