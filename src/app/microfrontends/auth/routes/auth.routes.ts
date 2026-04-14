import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('../pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('../pages/register/register').then((m) => m.Register),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('../pages/reset-password/reset-password').then((m) => m.ResetPasswordComponent),
  },
];
