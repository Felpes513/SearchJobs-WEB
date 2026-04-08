import { Routes } from '@angular/router';

export const HOME_ROUTES: Routes = [
  {
    path: 'landing',
    loadComponent: () =>
      import('../pages/landing/landing').then((m) => m.Landing),
    children: [
      {
        path: '',
        redirectTo: 'upload',
        pathMatch: 'full',
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
    ],
  },
];