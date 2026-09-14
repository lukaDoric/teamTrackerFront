import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'leaderboard',
    loadComponent: () =>
      import('./pages/leaderboard-panel/leaderboard-panel').then((m) => m.LeaderboardPanel),
  },
  { path: '**', redirectTo: 'leaderboard' },
];
