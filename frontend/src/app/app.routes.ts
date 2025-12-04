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
import { Unauthorized } from './features/unauthorized/unauthorized';
import { NoAuthGuard } from './core/guards/noAuth.guard';
import { UserRoleGuard } from './core/guards/userRole.guard';
import { Payment } from './features/payment/payment';
import { General } from './layouts/general/general';
import { Dashboard } from './layouts/dashboard/dashboard';
import { CreateApartment } from './features/owner-dashboard/components/create-apartment/create-apartment';
import { PropertyDetail } from './features/property-detail/property-detail';

export const routes: Routes = [
  // General layout routes (with navbar & footer)
  {
    path: '',
    component: General,
    children: [
      { path: '', component: Home },
      { path: 'home', component: Home },
      { path: 'aboutus', component: AboutUs },
      { path: 'contactus', component: Contactus },
      { path: 'filter', component: FilterPage },
      { path: 'search', component: Search },

      // Prevent logged-in users from accessing login/register
      {
        path: 'login',
        component: Login,
        canActivate: [NoAuthGuard]
      },
      {
        path: 'register',
        component: Register,
        canActivate: [NoAuthGuard]
      },

      // Unauthorized page
      {
        path: 'unauthorized',
        component: Unauthorized
      },
       {
    path: 'payment',
    component: Payment
  },
    ]
  },
  { path: 'properties/:id', component: PropertyDetail },

  // Dashboard layout routes (no navbar & footer)
{
  path: 'owner-dashboard',
  component: Dashboard,
  canActivate: [UserRoleGuard],
  data: { role: 'owner' },
  children: [
    { path: '', redirectTo: 'apartments', pathMatch: 'full' },
    { path: 'apartments', component: Apartments },
    { path: 'create-apartment', component: CreateApartment }
  ]
},

  // Student-only dashboard page
  {
    path: 'profile-student',
    component: General,
    canActivate: [UserRoleGuard],
    data: { role: 'student' },
    children: [
      { path: '', component: StudentProfile }
    ]
  },


  // Unauthorized page
  {
    path: 'unauthorized',
    component: Unauthorized
  },
  // MUST ALWAYS BE LAST

  // Catch-all error page
  { path: '**', component: ErrorPage },
];
