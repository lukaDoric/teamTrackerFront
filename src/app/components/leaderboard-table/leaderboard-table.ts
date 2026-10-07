import { Component, input, signal } from '@angular/core';
import { LeaderboardEntry, ReviewedPr } from '../../models';

export interface ScoreGroup {
  kind: string;
  label: string;
  count: number;
  points: number;
  total: number;
  texts: string[];
}

const GROUPS: { kind: string; label: string }[] = [
  { kind: 'pr', label: 'Recenziran PR' },
  { kind: 'nedostatak', label: 'Nedostaci' },
  { kind: 'pitanje', label: 'Pitanja' },
  { kind: 'pohvala', label: 'Pohvale' },
  { kind: 'zaključak', label: 'Zaključak' },
  { kind: 'unapređenje', label: 'Unapređenja nakon revizije' },
];

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

  groups(pr: ReviewedPr): ScoreGroup[] {
    return GROUPS.map(({ kind, label }) => {
      const items = pr.items.filter((i) => i.kind === kind);
      const total = items.reduce((sum, i) => sum + i.points, 0);
      return {
        kind,
        label,
        count: items.length,
        points: items[0]?.points ?? 0,
        total,
        texts: items.map((i) => i.text).filter((t): t is string => !!t),
      };
    }).filter((g) => g.count > 0);
  }

  hasTexts(pr: ReviewedPr): boolean {
    return pr.items.some((i) => !!i.text);
  }

  prUrl(repoFullName: string, number: number): string {
    return `https://github.com/${repoFullName}/pull/${number}`;
  }
}
