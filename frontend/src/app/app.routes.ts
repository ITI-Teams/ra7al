import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { AboutUs } from './features/about-us/about-us';
import { Contactus } from './features/contactus/contactus';
import { OwnerDashboard } from './features/owner-dashboard/owner-dashboard';
import { Apartments } from './features/owner-dashboard/components/apartments/apartments';
import { StudentProfile } from './features/student-profile/student-profile';
import { OwnerProfile } from './features/owner-profile/owner-profile';
import { FilterPage } from './features/filter-page/filter-page';
import { Search } from './features/search/search';
import { ErrorPage } from './features/error-page/error-page';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'aboutus', component: AboutUs },
  { path: 'login', component: Login, canActivate: [AuthGuard] },
  { path: 'register', component: Register, canActivate: [AuthGuard] },
  { path: 'contactus', component: Contactus },
  { path: 'filter', component: FilterPage },
  { path: 'search', component: Search },

  {
    path: 'owner-dashboard',
    component: OwnerDashboard,
    children: [
      { path: '', redirectTo: 'apartments', pathMatch: 'full' },
      { path: 'apartments', component: Apartments },
    ],
  },

  { path: 'profile-student', component: StudentProfile },
  { path: 'profile-owner', component: OwnerProfile },

  // MUST ALWAYS BE LAST
  { path: '**', component: ErrorPage },
];
