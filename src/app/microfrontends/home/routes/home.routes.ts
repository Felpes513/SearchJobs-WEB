import { Routes } from '@angular/router';

export const HOME_ROUTES: Routes = [
  {
    path: 'landing',
    loadComponent: () =>
      import('../pages/landing/landing').then((m) => m.Landing),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('../pages/landing-home/landing-home').then(
            (m) => m.LandingHome
          ),
      },
      {
        path: 'upload',
        loadComponent: () =>
          import('../pages/upload-resume/upload-resume').then(
            (m) => m.UploadResume
          ),
      },
      {
        path: 'resumes',
        loadComponent: () =>
          import('../pages/my-resumes/my-resumes').then(
            (m) => m.MyResumes
          ),
      },
      {
        path: 'jobs',
        loadComponent: () =>
          import('../pages/jobs/jobs').then(
            (m) => m.Jobs
          ),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('../pages/application-history/application-history').then(
            (m) => m.ApplicationHistory
          ),
      },
    ],
  },
];
