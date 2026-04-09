import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: '',
    loadChildren: () =>
      import('./microfrontends/auth/routes/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: '',
    loadChildren: () =>
      import('./microfrontends/home/routes/home.routes').then((m) => m.HOME_ROUTES),
  },

  {
    path: 'perfil',
    loadComponent: () =>
      import('./layout/profile/pages/profile-page/profile-page').then(
        (m) => m.ProfilePageComponent,
      ),
  },
];
