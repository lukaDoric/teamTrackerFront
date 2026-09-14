import { Component, input, signal } from '@angular/core';
import { LeaderboardEntry } from '../../models';

@Component({
  selector: 'app-leaderboard-table',
  imports: [],
  templateUrl: './leaderboard-table.html',
  styleUrl: './leaderboard-table.css',
})
export class LeaderboardTable {
  readonly entries = input.required<LeaderboardEntry[]>();

  readonly expanded = signal<string | null>(null);

  toggle(login: string): void {
    this.expanded.update((cur) => (cur === login ? null : login));
  }

  medal(index: number): string {
    return index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
  }

  prUrl(repoFullName: string, number: number): string {
    return `https://github.com/${repoFullName}/pull/${number}`;
  }
}
