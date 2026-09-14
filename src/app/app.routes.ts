import { Routes } from '@angular/router';
import { teacherGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: '',
    canActivate: [teacherGuard],
    loadComponent: () => import('./pages/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'leaderboard',
    loadComponent: () =>
      import('./pages/leaderboard-panel/leaderboard-panel').then((m) => m.LeaderboardPanel),
  },
  {
    path: 'upravljanje',
    canActivate: [teacherGuard],
    loadComponent: () => import('./pages/manage/manage').then((m) => m.Manage),
  },
  { path: '**', redirectTo: 'leaderboard' },
];
