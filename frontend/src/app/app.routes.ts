import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { AboutUs } from './features/about-us/about-us';
import { Contactus } from './features/contactus/contactus';
import { OwnerDashboard } from './features/owner-dashboard/owner-dashboard';
import { Apartments } from './features/owner-dashboard/components/apartments/apartments';
import { StudentProfile } from './features/student-profile/student-profile';
import { OwnerProfile } from './features/owner-profile/owner-profile';

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

    {
    path: 'profile-student',
    component:StudentProfile ,
  },
    {
    path: 'profile-owner',
    component:OwnerProfile ,
  },
  {
    path: 'owner-dashboard',
    component: OwnerDashboard,
    children: [
      { path: '', redirectTo: 'apartments', pathMatch: 'full' },
      { path: 'apartments', component: Apartments },
    ],
  },
];
